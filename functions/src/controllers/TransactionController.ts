import { firestore } from 'firebase-admin'
import { Transaction, ShardedTransaction } from '../models/Transaction'
import { ShardType } from '../util/Shard'
import { Dayjs } from 'dayjs'

export default class TransactionController {

	static async transfer<T extends Transaction>(data: T, fromShard: ShardType, toShard: ShardType) {

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

		const timestamp = firestore.Timestamp.now()
		const dayjs = new Dayjs(timestamp.toDate())
		const year = dayjs.year()
		const month = dayjs.month()
		const date = dayjs.date()

		const from = data.from.parent.parent!
			.collection('balances').doc(data.from.id)
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc()

		const to = data.to.parent.parent!
			.collection('balances').doc(data.to.id)
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc(from.id)

		try {
			const result = await firestore().runTransaction(async transaction => {
				transaction.set(from, fromTransaction)
				transaction.set(to, toTransaction)
				return data
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
