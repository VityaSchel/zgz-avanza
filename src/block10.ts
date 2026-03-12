import { decodeDate, encodeDate, type Date16Bit } from "./date";
import { decodeTime, encodeTime, type Time } from "./time";

export type Block10 = {
	createdAt: Date16Bit & Time;
	/** 2 bytes */
	unknownVar1: Uint8Array<ArrayBuffer>;
	line?: number;
	/** Always either 1 or 2 */
	direction?: number;
	/** Always `00006300` on top up cards and `00000000` on unlimited cards */
	constant: Uint8Array<ArrayBuffer>;
	previousTransactionLine?: number;
	/** Always either 1 or 2 */
	previousTransactionDirection?: number;
};

/**
 * Encodes transaction to a 16-byte record.
 * @param transaction An object with the transaction fields
 * @returns The 16-byte transaction record
 */
export function encodeBlock10({
	previousTransactionLine,
	previousTransactionDirection,
	createdAt: { year, month, day, hour, minute, second },
	unknownVar1,
	line,
	direction,
	constant,
}: Block10): Uint8Array {
	if (
		previousTransactionDirection !== undefined &&
		previousTransactionDirection !== 1 &&
		previousTransactionDirection !== 2
	) {
		throw new Error(
			`Invalid transaction previousTransactionDirection: ${previousTransactionDirection}`,
		);
	}
	if (direction !== undefined && direction !== 1 && direction !== 2) {
		throw new Error(`Invalid transaction direction: ${direction}`);
	}
	const date = encodeDate({ year, month, day });
	const time = encodeTime({ hour, minute, second });
	if (unknownVar1.length !== 2) {
		throw new Error(
			`Invalid transaction unknownVar1 length: ${unknownVar1.length}`,
		);
	}
	if (constant.length !== 3) {
		throw new Error(`Invalid transaction constant length: ${constant.length}`);
	}
	const block = new Uint8Array(16);
	block[0] = previousTransactionLine || 0;
	block[1] = previousTransactionDirection || 0;
	block.set(date, 2);
	block.set(time, 4);
	block.set(unknownVar1, 7);
	block[9] = line || 0;
	block[10] = direction || 0;
	block.set(constant, 11);
	const checksum = block.reduce((acc, byte) => acc ^ byte, 0);
	block[15] = checksum;
	return block;
}

/**
 * Decodes block 10 from a 16-byte record.
 * @param block The 16-byte block record
 * @returns An object with the decoded block 10 fields
 */
export function decodeBlock10(block: Uint8Array): Block10 {
	if (block.length !== 16) {
		throw new Error(`Invalid block length: expected 16 bytes`);
	}
	let previousTransactionLine = block[0];
	if (previousTransactionLine === undefined) {
		throw new Error(
			`Invalid block line number: ${previousTransactionLine} (byte 00)`,
		);
	}
	if (previousTransactionLine === 0) previousTransactionLine = undefined;
	let previousTransactionDirection = block[1];
	if (
		previousTransactionDirection === undefined ||
		(previousTransactionDirection !== 0 &&
			previousTransactionDirection !== 1 &&
			previousTransactionDirection !== 2)
	) {
		throw new Error(
			`Invalid block direction: ${previousTransactionDirection} (byte 01)`,
		);
	}
	if (previousTransactionDirection === 0)
		previousTransactionDirection = undefined;
	const date = block.slice(2, 4);
	const { year, month, day } = decodeDate(date);
	const time = block.slice(4, 7);
	const { hour, minute, second } = decodeTime(time);
	const unknownVar1 = block.slice(7, 9);
	let line = block[9];
	if (line === undefined) {
		throw new Error(`Invalid block line number: ${line} (byte 09)`);
	}
	if (line === 0) line = undefined;
	let direction = block[10];
	if (
		direction === undefined ||
		(direction !== 0 && direction !== 1 && direction !== 2)
	) {
		throw new Error(`Invalid block direction: ${direction} (byte 10)`);
	}
	if (direction === 0) direction = undefined;
	const constant = block.slice(11, 14);
	const aXor = block[15];
	const bXor = block.slice(0, 15).reduce((acc, byte) => acc ^ byte, 0);
	if (aXor === undefined) {
		throw new Error(`Invalid checksum byte: ${aXor}`);
	}
	if (aXor !== bXor) {
		throw new Error(`Invalid checksum byte: ${aXor}, expected ${bXor}`);
	}
	return {
		previousTransactionLine,
		previousTransactionDirection,
		createdAt: {
			year,
			month,
			day,
			hour,
			minute,
			second,
		},
		unknownVar1,
		line,
		direction,
		constant,
	};
}
