import { firestore } from 'firebase-admin'
import { TransactionType } from '../models/Core'
import * as Deposit from '../models/Deposit'
import { AccountConfiguration } from '../models/AccountConfiguration'
import { ShardType, randomShard, DafaultShardCharacters } from '../util/Shard'
import { getTransactionRef } from './helper'
import * as Dayjs from 'dayjs'

const system = () => firestore().collection('account').doc('v1')

export default class TransactionController {

	static async request<Request extends Deposit.Request>(data: Request) {
		const transactionRef = system().collection('transactions').doc()
		const toRef = system().collection('accounts').doc(data.to)
		const now = Dayjs(firestore.Timestamp.now().toDate())
		const year = now.year()
		const month = now.month()
		const date = now.date()
		const expire = now.add(3, 'minute').toDate()
		const shard = randomShard(DafaultShardCharacters)
		const toConfigurationSnapshot = await system().collection('accountConfigurations').doc(data.to).get()
		const toConfiguration = toConfigurationSnapshot.data() as AccountConfiguration | undefined
		const toShardCharcters = toConfiguration?.shardhardCharacters || DafaultShardCharacters
		try {
			await firestore().runTransaction(async transaction => {
				const toAccount = await transaction.get(toRef)
				const toAccountData = toAccount.data()
				if (!toAccountData) {
					throw new Error(`This account is not available. uid: ${data.to}`)
				}
				if (!toAccountData.isAvailable) {
					throw new Error(`This account is not available. uid: ${data.to}`)
				}
				const documentData: Deposit.Authorization = {
					...data,
					year, month, date,
					shard,
					toShardCharacters: toShardCharcters,
					isConfirmed: false,
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
		const type: TransactionType = 'deposit'
		try {
			const result = await firestore().runTransaction(async transaction => {
				const tran = await transaction.get(ref)
				if (!tran) {
					throw new Error(`This transaction is not available. id: ${ref.id}`)
				}
				const data = tran.data() as Deposit.Authorization | undefined
				if (!data) {
					throw new Error(`This transaction is not data. id: ${ref.id}`)
				}
				if (data.isConfirmed) {
					throw new Error(`This transaction is already confirmed. id: ${ref.id}`)
				}
				const amount = data.amount
				const toShardCharacters = data.toShardCharacters
				const timestamp = firestore.Timestamp.now()
				const dayjs = Dayjs(timestamp.toDate())
				const year = dayjs.year()
				const month = dayjs.month()
				const date = dayjs.date()
				const toRef = system().collection('accounts').doc(data.to)
				const toTransactionRef = getTransactionRef(toRef, ref.id, year, month, date)

				// amount
				const toShard: ShardType = randomShard(toShardCharacters)
				const to = toRef.collection("balances").doc(data.currency).collection(`shards`).doc(toShard)
				const toSnapshot = await transaction.get(to)
				const toData = toSnapshot.data() || { amount: 0 }
				const toAmount = toData.amount + amount

				// transaction
				const toTransaction: Deposit.Transaction = {
					type,
					shard: toShard,
					to: data.to,
					currency: data.currency,
					amount: data.amount,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				transaction.set(tran.ref, { isConfirmed: true })
				transaction.set(to, { amount: toAmount })
				transaction.set(toTransactionRef, toTransaction)
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
