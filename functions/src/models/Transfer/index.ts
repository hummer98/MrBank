import { Currency } from '../../util/Currency'
import { ShardType } from '../../util/Shard'
import { _Transaction, _Authorization } from '../Core'

export interface Request {
	from: string
	to: string
	currency: Currency
	amount: number
}

export interface Authorization extends _Authorization {
	from: string
	to: string
	toShardCharacters: ShardType[]
}

export interface Transaction extends _Transaction {
	to: string
	from: string
}
