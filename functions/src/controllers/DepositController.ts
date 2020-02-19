import { firestore } from 'firebase-admin'
import { TransactionType } from '../models/Transaction'
import * as Deposit from '../models/Deposit'
import { AccountConfiguration } from '../models/AccountConfiguration'
import { ShardType, randomShard, DafaultShardCharacters } from '../util/Shard'
import * as Dayjs from 'dayjs'

const system = () => firestore().collection('account').doc('v1')

export default class TransactionController {

	static async request<Request extends Deposit.Request>(data: Request) {
		const transactionRef = system().collection('transactions').doc()
		const toRef = system().collection('accounts').doc(data.to)
		const timestamp = firestore.Timestamp.now()
		const dayjs = Dayjs(timestamp.toDate())
		const expire = dayjs.add(3, 'minute').toDate()
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
		const tran = await ref.get()
		if (!tran) {
			throw new Error(`This transaction is not available. uid: ${ref.id}`)
		}
		const data = tran.data() as Deposit.Authorization | undefined
		if (!data) {
			throw new Error(`This transaction is not data. uid: ${ref.id}`)
		}
		const type: TransactionType = 'deposit'
		const amount = data.amount
		const toShardCharacters = data.toShardCharacters
		const timestamp = firestore.Timestamp.now()
		const dayjs = Dayjs(timestamp.toDate())
		const year = dayjs.year()
		const month = dayjs.month()
		const date = dayjs.date()
		const toRef = system().collection('accounts').doc(data.to)
		const toTransactionRef = toRef
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${year}-${month}`)
			.collection('days').doc(`${year}-${month}-${date}`)
			.collection('transactions').doc(ref.id)
		try {
			const result = await firestore().runTransaction(async transaction => {

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
