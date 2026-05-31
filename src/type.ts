export const CardTypeEnum = {
	TopUp: 0x02699f,
	PersonalUnlimited: 0x0a9775,
} as const;

/**
 * Decode card type from block 1.
 * @param block The block data (16 bytes)
 * @return The card type
 */
export function decodeCardType(block: Uint8Array): keyof typeof CardTypeEnum {
	if (block.length !== 16) {
		throw new Error("Invalid card type block length: expected 16 bytes");
	}
	const type = block.subarray(0, 3).reduce((acc, byte) => (acc << 8) | byte, 0);
	const xor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (xor !== block[15]) {
		throw new Error(
			`Invalid card type block checksum: expected ${xor}, got ${block[15]}`,
		);
	}
	switch (type) {
		case CardTypeEnum.TopUp:
			return "TopUp";
		case CardTypeEnum.PersonalUnlimited:
			return "PersonalUnlimited";
		default:
			throw new Error(`Unknown card type: ${type.toString(16)}`);
	}
}

/**
 * Encode card type for block 1.
 * @param type The card type
 * @return The block data (16 bytes)
 */
export function encodeCardType(type: keyof typeof CardTypeEnum): Uint8Array {
	const block = new Uint8Array(16);
	const value = CardTypeEnum[type];
	block[0] = (value >> 16) & 0xff;
	block[1] = (value >> 8) & 0xff;
	block[2] = value & 0xff;
	const xor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	block[15] = xor;
	return block;
}
