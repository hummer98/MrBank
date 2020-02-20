import { Currency } from '../../util/Currency'
import { ShardType } from '../../util/Shard'
import { _Transaction, _Authorization } from '../Core'

export interface Request {
	to: string
	currency: Currency
	amount: number
}

export interface Authorization extends _Authorization {
	to: string
	toShardCharacters: ShardType[]
}

export interface Transaction extends _Transaction {
	to: string
}
