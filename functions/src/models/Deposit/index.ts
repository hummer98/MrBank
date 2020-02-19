import { firestore } from 'firebase-admin'
import { Currency } from '../../util/Currency'
import { ShardType } from '../../util/Shard'
import { _Transaction } from '../Transaction'

export interface Request {
	to: string
	currency: Currency
	amount: number
}

export interface Authorization {
	shard: ShardType
	to: string
	toShardCharacters: ShardType[]
	currency: Currency
	amount: number
	isConfirmed: boolean
	expireTime: firestore.Timestamp
}

export interface Transaction extends _Transaction {
	to: string
}
