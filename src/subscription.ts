import { decodeDate, encodeDate, type Date16Bit } from "./date";
import { encodeTime, decodeTime, type Time } from "./time";

export type Subscription = {
	startsAt: Date16Bit;
	endsAt: Date16Bit;
	/** 2 bytes */
	unknownVar1: Uint8Array;
	/** 4 bytes */
	unknownVar2: Uint8Array;
	lastUsedAt?: Date16Bit & Time;
};

/**
 * Encodes subscription to a block.
 * @param subscription An object with the subscription fields
 * @returns The subscription block
 */
export function encodeSubscription({
	startsAt,
	endsAt,
	unknownVar1,
	unknownVar2,
	lastUsedAt,
}: Subscription): Uint8Array {
	const startsAtDate = encodeDate(startsAt);
	const endsAtDate = encodeDate(endsAt);
	if (unknownVar1.length !== 2) {
		throw new Error(
			`Invalid unknownVar1 length: ${unknownVar1.length}, must be 2 bytes`,
		);
	}
	if (unknownVar2.length !== 4) {
		throw new Error(
			`Invalid unknownVar2 length: ${unknownVar2.length}, must be 4 bytes`,
		);
	}
	const block = new Uint8Array(16);
	block.set(startsAtDate, 0);
	block.set(endsAtDate, 2);
	block.set(unknownVar1, 4);
	block.set(unknownVar2, 6);
	if (lastUsedAt) {
		const lastUsedAtDate = encodeDate(lastUsedAt);
		const lastUsedAtTime = encodeTime(lastUsedAt);
		block.set(lastUsedAtDate, 10);
		block.set(lastUsedAtTime, 12);
	}
	const checksum = block.reduce((acc, byte) => acc ^ byte, 0);
	block[15] = checksum;
	return block;
}

/**
 * Decodes subscription from a block
 * @param block The subscription block
 * @returns An object with the decoded subscription fields
 */
export function decodeSubscription(block: Uint8Array): Subscription {
	if (block.length !== 16) {
		throw new Error(`Invalid block length: expected 16 bytes`);
	}
	const startsAt = decodeDate(block.slice(0, 2));
	const endsAt = decodeDate(block.slice(2, 4));
	const unknownVar1 = block.slice(4, 6);
	const unknownVar2 = block.slice(6, 10);
	let lastUsedAt: (Date16Bit & Time) | undefined;
	if (!block.slice(10, 15).every((b) => b === 0)) {
		lastUsedAt = {
			...decodeDate(block.slice(10, 12)),
			...decodeTime(block.slice(12, 15)),
		};
	}
	const aXor = block[15];
	const bXor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (aXor === undefined) {
		throw new Error(`Invalid checksum byte: ${aXor}`);
	}
	if (aXor !== bXor) {
		throw new Error(`Invalid checksum byte: ${aXor}, expected ${bXor}`);
	}
	return {
		startsAt,
		endsAt,
		unknownVar1,
		unknownVar2,
		lastUsedAt,
	};
}
