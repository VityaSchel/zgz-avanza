import { decodeDate, encodeDate, type Date16Bit } from "./date";
import { encodeTime, decodeTime, type Time } from "./time";
import { assertInRange } from "./utils";

export type SubscriptionMetadata = {
	unknownVar1: number;
	/** Appears to always be 1 */
	unknownVar2: number;
	purchasedAt: Date16Bit;
	/** 4 bytes, appears to always be `00210000` */
	unknownVar3: Uint8Array;
	validityDays: number;
	/** 5 bytes, appears to always be `0021000000` */
	unknownVar4: Uint8Array;
};

/**
 * Encodes subscription metadata to a block.
 * @param subscription An object with the subscription metadata fields
 * @returns The subscription metadata block
 */
export function encodeSubscriptionMetadata({
	unknownVar1,
	unknownVar2,
	purchasedAt,
	unknownVar3,
	validityDays,
	unknownVar4,
}: SubscriptionMetadata): Uint8Array {
	assertInRange({ unknownVar1 }, 0, 2 ** 8 - 1);
	assertInRange({ unknownVar2 }, 0, 2 ** 8 - 1);
	const purchaseDate = encodeDate(purchasedAt);
	if (unknownVar3.length !== 4) {
		throw new Error(
			`Invalid unknownVar3 length: ${unknownVar3.length}, must be 4 bytes`,
		);
	}
	assertInRange({ validityDays }, 0, 2 ** 16 - 1);
	if (unknownVar4.length !== 5) {
		throw new Error(
			`Invalid unknownVar4 length: ${unknownVar4.length}, must be 5 bytes`,
		);
	}
	const block = new Uint8Array(16);
	block[0] = unknownVar1;
	block[1] = unknownVar2;
	block.set(purchaseDate, 2);
	block.set(unknownVar3, 4);
	block[8] = (validityDays >> 8) & 0xff;
	block[9] = validityDays & 0xff;
	block.set(unknownVar4, 10);
	const checksum = block.reduce((acc, byte) => acc ^ byte, 0);
	block[15] = checksum;
	return block;
}

/**
 * Decodes subscription metadata from a block
 * @param block The subscription metadata block
 * @returns An object with the decoded subscription metadata fields
 */
export function decodeSubscriptionMetadata(
	block: Uint8Array,
): SubscriptionMetadata {
	if (block.length !== 16) {
		throw new Error(`Invalid block length: expected 16 bytes`);
	}
	const unknownVar1 = block[0];
	if (unknownVar1 === undefined) {
		throw new Error(`Invalid unknownVar1: ${unknownVar1}`);
	}
	const unknownVar2 = block[1];
	if (unknownVar2 === undefined) {
		throw new Error(`Invalid unknownVar2: ${unknownVar2}`);
	}
	const purchasedAt = decodeDate(block.slice(2, 4));
	const unknownVar3 = block.slice(4, 8);
	const validityDays = block
		.slice(8, 10)
		.reduce((acc, byte) => (acc << 8) | byte, 0);
	const unknownVar4 = block.slice(10, 15);
	const aXor = block[15];
	const bXor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (aXor === undefined) {
		throw new Error(`Invalid checksum byte: ${aXor}`);
	}
	if (aXor !== bXor) {
		throw new Error(`Invalid checksum byte: ${aXor}, expected ${bXor}`);
	}
	return {
		unknownVar1,
		unknownVar2,
		purchasedAt,
		unknownVar3,
		validityDays,
		unknownVar4,
	};
}
