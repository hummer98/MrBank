import { ShardType } from '../../util/Shard'
import { _Request, _Transaction, _Authorization } from '../Core'

export interface Request extends _Request {
	to: string
}

export interface Authorization extends _Authorization {
	to: string
	toShardCharacters: ShardType[]
}

export interface Transaction extends _Transaction {
	to: string
}
