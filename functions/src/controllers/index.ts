import { firestore } from 'firebase-admin'
import { Transaction, ShardedTransaction } from '../models/Transaction'
import { ShardCharacters, randomShard } from '../util/Shard'
import { Dayjs } from 'dayjs'

export default class TransactionController {

	async transfer<T extends Transaction>(transaction: T, shardLength: number) {
		const result = await this._transfer(transaction, shardLength)
		return result
	}

	private _shard(shardLength: number) {
		if (shardLength > ShardCharacters.length) {
			throw new Error(`invalid shard length. ${shardLength}`)
		}
		const shardCharacters =	ShardCharacters.slice(0, shardLength)
		const shard = randomShard(shardCharacters)
		return shard
	}

	private async _transfer<T extends Transaction>(transaction: T, shardLength: number) {

		const shard = this._shard(shardLength)
		const sharedTransaction: ShardedTransaction = {
			...transaction,
			shard: shard,
			createTime: firestore.FieldValue.serverTimestamp(),
			updateTime: firestore.FieldValue.serverTimestamp()
		}

		const timestamp = firestore.Timestamp.now()
		const dayjs = new Dayjs(timestamp.toDate())
		const year = dayjs.year()
		const month = dayjs.month()
		const date = dayjs.date()

		const from = transaction.from
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc()

		const to = transaction.to
			.collection('years').doc(`${year}`)
			.collection('months').doc(`${month}`)
			.collection('days').doc(`${date}`)
			.collection('transactions').doc(from.id)

		try {
			const result = await firestore().runTransaction(async transaction => {
				transaction.set(from, sharedTransaction)
				transaction.set(to, sharedTransaction)
				return sharedTransaction
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
