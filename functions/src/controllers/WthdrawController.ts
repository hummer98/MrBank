import { firestore } from 'firebase-admin'
import * as Withdraw from '../models/Withdraw'
import { TransactionType } from '../models/Transaction'
import { AccountConfiguration } from '../models/AccountConfiguration'
import { randomShard, DafaultShardCharacters } from '../util/Shard'
import * as Dayjs from 'dayjs'

const system = () => firestore().collection('account').doc('v1')

export default class TransactionController {

	static async request<Request extends Withdraw.Request>(data: Request) {
		const amount = data.amount
		const transactionRef = system().collection('transactions').doc()
		const fromRef = system().collection('accounts').doc(data.from)
		const timestamp = firestore.Timestamp.now()
		const dayjs = Dayjs(timestamp.toDate())
		const expire = dayjs.add(3, 'minute').toDate()
		const shard = randomShard(DafaultShardCharacters)
		const fromConfigurationSnapshot = await system().collection('accountConfigurations').doc(data.from).get()
		const fromConfiguration = fromConfigurationSnapshot.data() as AccountConfiguration | undefined
		const fromShardCharacters = fromConfiguration?.shardhardCharacters || DafaultShardCharacters
		try {
			await firestore().runTransaction(async transaction => {
				const fromAccount = await transaction.get(fromRef)
				const fromAccountData = fromAccount.data()
				if (!fromAccountData) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				if (!fromAccountData.isAvailable) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				const snapshot = await transaction.get(fromRef.collection(data.currency))
				const currentAmount = snapshot.docs.reduce((prev, current) => {
					const data = (current.data() || { amount: 0 })
					const amount = data.amount
					return prev + amount
				}, 0)
				if (currentAmount < amount) {
					throw new Error(`Out of balance. ${currentAmount}`)
				}
				const documentData: Withdraw.Authorization = {
					...data,
					shard,
					fromShardCharacters: fromShardCharacters,
					isConfirmed: true,
					expireTime: firestore.Timestamp.fromDate(expire)
				}
				transaction.set(transactionRef, documentData)
			})
			return transactionRef.id
		} catch (error) {
			throw error
		}
	}

	static async confirm(id: string) {
		const ref = system().collection('transactions').doc(id)
		const tran = await ref.get()
		if (!tran) {
			throw new Error(`This transaction is not available. uid: ${ref.id}`)
		}
		const data = tran.data() as Withdraw.Authorization | undefined
		if (!data) {
			throw new Error(`This transaction is not data. uid: ${ref.id}`)
		}
		const type: TransactionType = 'withdraw'
		const amount = data.amount
		const fromShardCharacters = data.fromShardCharacters
		const timestamp = firestore.Timestamp.now()
		const dayjs = Dayjs(timestamp.toDate())
		const year = dayjs.year()
		const month = dayjs.month()
		const date = dayjs.date()
		const fromRef = system().collection('accounts').doc(data.from)
		const fromTransactionRef = fromRef
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${year}-${month}`)
			.collection('days').doc(`${year}-${month}-${date}`)
			.collection('transactions').doc(ref.id)
		try {
			const result = await firestore().runTransaction(async transaction => {
				const snapshot = await transaction.get(fromRef.collection("balances").doc(data.currency).collection(`shards`))
				if (snapshot.docs.length > 0) {
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
				transaction.set(tran.ref, { isConfirmed: true })
				transaction.set(from, { amount: fromAmount })
				transaction.set(fromTransactionRef, fromTransaction)
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
