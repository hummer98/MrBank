import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'
import { ShardType } from '../util/Shard'

export type TransactionType = 'deposit' | 'transfer' | 'withdraw' | 'interest'

export interface _Transaction {
	shard: ShardType
	type: TransactionType
	currency: Currency
	amount: number
	createTime: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
}
