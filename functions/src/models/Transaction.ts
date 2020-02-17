import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'
import { ShardType } from '../util/Shard'

export interface Transaction {
	shard: ShardType
	from: string
	to: string
	currency: Currency
	amount: number
	createTime: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
}
