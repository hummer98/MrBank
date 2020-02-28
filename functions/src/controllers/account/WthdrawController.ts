import { firestore } from 'firebase-admin'
import * as Withdraw from '../../models/Withdraw'
import { TransactionType } from '../../models/Core'
import { AccountConfiguration } from '../../models/AccountConfiguration'
import { randomShard, DafaultShardCharacters } from '../../util/Shard'
import { rootRef, getTransactionRef } from '../helper'
import { DEFAULT_EXPIRE_TIME } from '../../config'
import * as Dayjs from 'dayjs'

export default class WithdrawController {

	static async request<Request extends Withdraw.Request>(data: Request) {
		const amount = data.amount
		const fromRef = rootRef().collection('accounts').doc(data.from)
		const authorizationCollectionRef = fromRef.collection('authorizations')
		const transactionRef = authorizationCollectionRef.doc()
		const now = Dayjs(firestore.Timestamp.now().toDate())
		const year = now.year()
		const month = now.month()
		const date = now.date()
		const expire = now.add(DEFAULT_EXPIRE_TIME, 'second').toDate()
		const shard = randomShard(DafaultShardCharacters)
		const fromConfigurationSnapshot = await rootRef().collection('accountConfigurations').doc(data.from).get()
		const fromConfiguration = fromConfigurationSnapshot.data() as AccountConfiguration | undefined
		const fromShardCharacters = fromConfiguration?.shardCharacters || DafaultShardCharacters
		try {
			await firestore().runTransaction(async transaction => {
				const [authorizationSnapshot, fromAccount] = await Promise.all([
					authorizationCollectionRef
						.where('expireTime', '>', firestore.Timestamp.now())
						.where('isConfirmed', '==', false)
						.get(),
					transaction.get(fromRef)
				])
				if (authorizationSnapshot.docs.length > 0) {
					console.log(authorizationSnapshot.docs)
					throw new Error(`Already requested. authorization id: ${authorizationSnapshot.docs[0].ref.path}`)
				}
				const fromAccountData = fromAccount.data()
				if (!fromAccountData) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				if (!fromAccountData.isAvailable) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				const snapshot = await transaction.get(fromRef.collection("balances").doc(data.currency).collection('shards'))
				const currentAmount = snapshot.docs.reduce((prev, current) => {
					const data = (current.data() || { amount: 0 })
					const amount = data.amount
					return prev + amount
				}, 0)
				console.log(currentAmount, amount)
				if (currentAmount < amount) {
					throw new Error(`Out of balance. ${currentAmount}`)
				}
				const documentData: Withdraw.Authorization = {
					...data,
					year, month, date,
					shard,
					fromShardCharacters: fromShardCharacters,
					isConfirmed: false,
					expireTime: firestore.Timestamp.fromDate(expire)
				}
				transaction.set(transactionRef, documentData, { merge: true })
			})
			return transactionRef.id
		} catch (error) {
			throw error
		}
	}

	static async confirm(from: string, authorizationID: string) {
		const fromRef = rootRef().collection('accounts').doc(from)
		const ref = fromRef.collection('authorizations').doc(authorizationID)
		const type: TransactionType = 'withdraw'
		try {
			const result = await firestore().runTransaction(async transaction => {
				const tran = await transaction.get(ref)
				if (!tran) {
					throw new Error(`This transaction is not available. id: ${ref.id}`)
				}
				const data = tran.data() as Withdraw.Authorization | undefined
				if (!data) {
					throw new Error(`This transaction is not data. id: ${ref.id}`)
				}
				if (data.isConfirmed) {
					throw new Error(`This transaction is already confirmed. id: ${ref.id}`)
				}
				const { expireTime, amount, fromShardCharacters } = data
				const timestamp = firestore.Timestamp.now()
				if (expireTime.toDate() < timestamp.toDate()) {
					throw new Error(`This request has expired. id: ${ref.id}`)
				}
				const dayjs = Dayjs(timestamp.toDate())
				const year = dayjs.year()
				const month = dayjs.month()
				const date = dayjs.date()
				const fromTransactionRef = getTransactionRef(fromRef, ref.id, year, month, date)

				const snapshot = await transaction.get(fromRef.collection("balances").doc(data.currency).collection(`shards`))
				if (snapshot.docs.length === 0) {
					throw new Error(`Out of balance. ${fromRef.path}`)
				}
				const currentAmount = snapshot.docs.reduce((prev, current) => {
					const data = (current.data() || { amount: 0 })
					const amount = data.amount
					return prev + amount
				}, 0)

				// amount
				const fromShard = randomShard(fromShardCharacters)
				const from = fromRef.collection("balances").doc(data.currency).collection(`shards`).doc(fromShard)
				const fromSnapshot = await transaction.get(from)
				const fromData = fromSnapshot.data() || { amount: 0 }
				if (currentAmount < amount) {
					throw new Error(`Out of balance. ${fromRef.path}`)
				}
				const fromAmount = fromData.amount - amount

				// transaction
				const fromTransaction: Withdraw.Transaction = {
					type,
					shard: fromShard,
					from: data.from,
					currency: data.currency,
					amount: data.amount,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				transaction.set(tran.ref, { isConfirmed: true }, { merge: true })
				transaction.set(from, { amount: fromAmount }, { merge: true })
				transaction.set(fromTransactionRef, fromTransaction, { merge: true })
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
