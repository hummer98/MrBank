import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'
import { ShardType } from '../util/Shard'

export interface TransferRequest {
	from: string
	to: string
	currency: Currency
	amount: number
}

export interface TransferAuthorization {
	shard: ShardType
	from: string
	to: string
	toShardCharacters: ShardType[]
	currency: Currency
	amount: number
	isConfirmed: boolean
	expireTime: firestore.Timestamp
}
