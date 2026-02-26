export enum CardType {
	TopUp = 0x02699f,
	PersonalUnlimited = 0x0a9775,
}

/**
 * Decode card type from block 1
 * @param block The block data (16 bytes)
 * @return The card type
 */
export function decodeCardType(block: Uint8Array): CardType {
	if (block.length !== 16) {
		throw new Error("Invalid card type block length: expected 16 bytes");
	}
	const type = block.subarray(0, 3).reduce((acc, byte) => (acc << 8) | byte, 0);
	const xor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (xor !== block[15]) {
		throw new Error(`Invalid card type block checksum: expected ${xor}, got ${block[15]}`);
	}
	switch (type) {
		case CardType.TopUp:
			return CardType.TopUp;
		case CardType.PersonalUnlimited:
			return CardType.PersonalUnlimited;
		default:
			throw new Error(`Unknown card type: ${type.toString(16)}`);
	}
}

/**
 * Encode card type for block 1
 * @param type The card type
 * @return The block data (16 bytes)
 */
export function encodeCardType(type: CardType): Uint8Array {
	const block = new Uint8Array(16);
	block[0] = (type >> 16) & 0xff;
	block[1] = (type >> 8) & 0xff;
	block[2] = type & 0xff;
	const xor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	block[15] = xor;
	return block;
}