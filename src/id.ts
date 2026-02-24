/**
 * Decodes the ID from the Zaragoza Avanza card.
 * @param block Block 2 from Zaragoza Avanza card
 * @return The decoded ID as a string
 */
export function decodeId(block: Uint8Array): string {
	if (block.length !== 16) {
		throw new Error(`Invalid block length: expected 16 bytes`);
	}
	const prefix = String.fromCharCode(...block.slice(0, 2));
	let id = block.slice(2, 15);
	const aXor = block.slice(15, 16)[0];
	const bXor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (aXor === undefined) {
		throw new Error(`Invalid checksum byte: ${aXor}`);
	}
	if (aXor !== bXor) {
		throw new Error(`Invalid checksum byte: ${aXor}, expected ${bXor}`);
	}
	while (id[id.length - 1] === 0 && id.length > 3) {
		id = id.slice(0, -1);
	}
	return prefix + id.toHex();
}

/**
 * Encodes the ID for the Zaragoza Avanza card.
 * @param cardId The ID to encode
 * @return The encoded ID as a 16-byte block for block 2
 */
export function encodeId(cardId: string): Uint8Array {
	if (!/^[A-Z]{2}[0-9]{6,26}$/.test(cardId)) {
		throw new Error(
			`Invalid ID format: ${cardId}. Expected format is 2 uppercase letters followed by 6 to 26 digits.`,
		);
	}
	const block = new Uint8Array(16);
	const prefix = cardId.slice(0, 2);
	const id = Uint8Array.fromHex(cardId.slice(2));
	block.set(Uint8Array.from(prefix.split('').map(c => c.charCodeAt(0))), 0);
	block.set(id, 2);
	const checksum = block.reduce((acc, byte) => acc ^ byte, 0);
	block[15] = checksum;
	return block;
}
