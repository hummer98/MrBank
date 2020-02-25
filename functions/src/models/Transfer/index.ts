import { ShardType } from '../../util/Shard'
import { _Request, _Transaction, _Authorization } from '../Core'

export interface Request extends _Request {
	from: string
	to: string
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
