import { Currency } from '../../util/Currency'
import { ShardType } from '../../util/Shard'
import { _Transaction, _Authorization } from '../Core'

export interface Request {
	from: string
	currency: Currency
	amount: number
}

export interface Authorization extends _Authorization {
	from: string
	fromShardCharacters: ShardType[]
}

export interface Transaction extends _Transaction {
	from: string
}
