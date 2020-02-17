import { firestore } from 'firebase-admin'
import { Transaction } from '../models/Transaction'
import { TransferRequest, TransferAuthorization } from '../models/TransferAuthorization'
import { AccountConfiguration } from '../models/AccountConfiguration'
import { ShardType, randomShard, DafaultShardCharacters } from '../util/Shard'
import * as Dayjs from 'dayjs'

const system = () => firestore().collection('account').doc('v1')

export default class TransactionController {

	static async request<Request extends TransferRequest>(data: Request) {
		const amount = data.amount
		const transactionRef = system().collection('transactions').doc()
		const fromRef = system().collection('accounts').doc(data.from)
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
				const [fromAccount, toAccount] = await Promise.all([
					transaction.get(fromRef),
					transaction.get(toRef)
				])
				const fromAccountData = fromAccount.data()
				const toAccountData = toAccount.data()
				if (!fromAccountData) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				if (!toAccountData) {
					throw new Error(`This account is not available. uid: ${data.to}`)
				}
				if (!fromAccountData.isAvailable) {
					throw new Error(`This account is not available. uid: ${data.from}`)
				}
				if (!toAccountData.isAvailable) {
					throw new Error(`This account is not available. uid: ${data.to}`)
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
				const documentData: TransferAuthorization = {
					...data,
					shard,
					toShardCharacters: toShardCharcters,
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

	static async transfer(id: string) {
		const ref = system().collection('transactions').doc(id)
		const tran = await ref.get()
		if (!tran) {
			throw new Error(`This transaction is not available. uid: ${ref.id}`)
		}
		const data = tran.data() as TransferAuthorization | undefined
		if (!data) {
			throw new Error(`This transaction is not data. uid: ${ref.id}`)
		}
		const amount = data.amount
		const toShardCharacters = data.toShardCharacters
		const timestamp = firestore.Timestamp.now()
		const dayjs = Dayjs(timestamp.toDate())
		const year = dayjs.year()
		const month = dayjs.month()
		const date = dayjs.date()
		const fromRef = system().collection('accounts').doc(data.from)
		const toRef = system().collection('accounts').doc(data.to)
		const fromTransactionRef = fromRef
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc(ref.id)
		const toTransactionRef = toRef
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc(ref.id)
		try {
			const result = await firestore().runTransaction(async transaction => {
				const snapshot = await fromRef.collection(data.currency).where('amount', '>=', data.amount).get()
				if (snapshot.docs.length > 0) {
					throw new Error(`Out of balance. ${fromRef.path}`)
				}
				const IDs = snapshot.docs.map(doc => doc.id) as ShardType[]

				// amount
				const fromShard = randomShard(IDs)
				const toShard = randomShard(toShardCharacters)
				const from = fromRef.collection(data.currency).doc(fromShard)
				const to = toRef.collection(data.currency).doc(toShard)
				const fromSnapshot = await transaction.get(from)
				const toSnapshot = await transaction.get(to)
				const fromData = fromSnapshot.data() || { amount: 0 }
				const toData = toSnapshot.data() || { amount: 0 }
				const fromAmount = fromData.amount - amount
				const toAmount = toData.amount + amount

				// transaction
				const fromTransaction: Transaction = {
					shard: fromShard,
					from: data.from,
					to: data.to,
					currency: data.currency,
					amount: data.amount,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				const toTransaction: Transaction = {
					shard: toShard,
					from: data.from,
					to: data.to,
					currency: data.currency,
					amount: data.amount,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				transaction.set(tran.ref, { isConfirmed: true })
				transaction.set(from, { amount: fromAmount })
				transaction.set(to, { amount: toAmount })
				transaction.set(fromTransactionRef, fromTransaction)
				transaction.set(toTransactionRef, toTransaction)
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
