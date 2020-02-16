
export type ShardType =
	"a" | "b" | "c" | "d" | "e" |
	"f" | "g" | "h" | "i" | "j" |
	"k" | "l" | "m" | "n" | "o" |
	"p" | "q" | "r" | "s" | "t" |
	"u" | "v" | "w" | "x" | "y" |
	"z"

export const ShardCharacters: ShardType[] = [
	"a", "b", "c", "d", "e",
	"f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o",
	"p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y",
	"z"
]

export const DafaultShardCharacters: ShardType[] = ShardCharacters.slice(0, 10)

export const randomShard = (seed: ShardType[]): ShardType => {
	return seed[Math.floor(Math.random() * Math.floor(seed.length))]
}
