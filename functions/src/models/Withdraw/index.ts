import { ShardType } from '../../util/Shard'
import { _Request, _Transaction, _Authorization } from '../Core'

export interface Request extends _Request{
	from: string
}

export interface Authorization extends _Authorization {
	from: string
	fromShardCharacters: ShardType[]
}

export interface Transaction extends _Transaction {
	from: string
}
