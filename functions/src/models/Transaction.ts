import { firestore } from 'firebase-admin'
import { Currency } from './Currency'

type Shard = 'a' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k'

export interface Transaction {
	shard: Shard
	from: firestore.DocumentReference
	to: firestore.DocumentReference
	currency: Currency
	amount: number
	createTime: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
	executionTime: firestore.Timestamp
}
