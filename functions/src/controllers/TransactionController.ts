import { firestore } from 'firebase-admin'
import { Transaction, ShardedTransaction } from '../models/Transaction'
import { ShardType, randomShard } from '../util/Shard'
import * as Dayjs from 'dayjs'

const system = () => firestore().collection('account').doc('v1')

export default class TransactionController {

	static async transfer<T extends Transaction>(data: T, fromShardCharacters: ShardType[], toShardCharacters: ShardType[]) {
		const amount = data.amount
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
			.collection('transactions').doc()
		const toTransactionRef = toRef
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc(fromTransactionRef.id)
		try {
			const result = await firestore().runTransaction(async transaction => {

				// amount
				const fromShard = randomShard(fromShardCharacters)
				const toShard = randomShard(toShardCharacters)
				const from = fromRef.collection(data.currency).doc(fromShard)
				const to = toRef.collection(data.currency).doc(toShard)
				const fromSnapshot = await transaction.get(from)
				const toSnapshot = await transaction.get(to)
				const fromData = (fromSnapshot.data() || { amount: 0 })
				const toData = toSnapshot.data() || { amount: 0 }
				const fromAmount = fromData.amount - amount
				const toAmount = toData.amount + amount

				// transaction
				const fromTransaction: ShardedTransaction = {
					...data,
					shard: fromShard,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				const toTransaction: ShardedTransaction = {
					...data,
					shard: toShard,
					createTime: firestore.FieldValue.serverTimestamp(),
					updateTime: firestore.FieldValue.serverTimestamp()
				}
				transaction.set(from, { amount: fromAmount })
				transaction.set(to, { amount: toAmount })
				transaction.set(fromTransactionRef, fromTransaction)
				transaction.set(toTransactionRef, toTransaction)
				return data
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
