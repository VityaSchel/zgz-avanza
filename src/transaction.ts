import { decodeDate } from "./date";

export type Transaction = {
	header: number;
	/** Always 0 on personal unlimited cards */
	fareId: number;
	/** Starts from 1 */
	consecutivePaymentsCounter: number;
	unknownVar1: Uint8Array<ArrayBuffer>;
	line: number;
	/** Always either 1 or 2 */
	direction: number;
	unknownVar2: Uint8Array<ArrayBuffer>;
	createdAt: {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
		second: number;
	};
	/** Starts with 0 and increments with each transaction until 4 (inclusive), after that loops back to 0 */
	sequence: number;
};

/**
 * Decodes transaction from a 16-byte record
 * @param transaction The 16-byte transaction record
 * @returns An object with the decoded transaction fields
 */
export function decodeTransaction(transaction: Uint8Array): Transaction {
	if (transaction.length !== 16) {
		throw new Error(`Invalid transaction length: expected 16 bytes`);
	}
	const header = transaction
		.slice(0, 3)
		.reduce((acc, byte) => (acc << 8) | byte, 0);
	if (
		header !== 0x020002 &&
		header !== 0x020000 &&
		header !== 0x0a0200 &&
		header !== 0x0a0100
	) {
		throw new Error(
			`Unknown transaction record marker: ${header.toString(16)} (bytes 0-2)`,
		);
	}
	const fareId = transaction.slice(3, 4)[0];
	if (fareId === undefined) {
		throw new Error(`Invalid fare id: ${fareId} (byte 3)`);
	}
	const consecutivePaymentsCounter = transaction.slice(4, 5)[0];
	if (
		consecutivePaymentsCounter === undefined ||
		consecutivePaymentsCounter < 1
	) {
		throw new Error(`Invalid consecutive payments counter: ${fareId} (byte 4)`);
	}
	const unknownVar1 = transaction.slice(5, 7);
	const line = transaction.slice(7, 8)[0];
	if (line === undefined) {
		throw new Error(`Invalid transaction line number: ${line} (byte 7)`);
	}
	const direction = transaction.slice(8, 9)[0];
	if (direction === undefined || (direction !== 1 && direction !== 2)) {
		throw new Error(`Invalid transaction direction: ${direction} (byte 8)`);
	}
	const unknownVar2 = transaction.slice(9, 10);
	const date = transaction.slice(10, 12);
	const { year, month, day } = decodeDate(date);
	const hour = transaction.slice(12, 13)[0];
	if (hour === undefined || hour > 24) {
		throw new Error(`Invalid transaction hour: ${hour} (byte 12)`);
	}
	const minute = transaction.slice(13, 14)[0];
	if (minute === undefined || minute > 60) {
		throw new Error(`Invalid transaction minute: ${minute} (byte 13)`);
	}
	const second = transaction.slice(14, 15)[0];
	if (second === undefined || second > 60) {
		throw new Error(`Invalid transaction second: ${second} (byte 14)`);
	}
	const seq = transaction.slice(15, 16)[0];
	if (seq === undefined) {
		throw new Error(`Invalid transaction sequence number: ${seq} (byte 15)`);
	}
	return {
		header,
		fareId,
		consecutivePaymentsCounter,
		unknownVar1,
		line,
		direction,
		unknownVar2,
		createdAt: {
			year,
			month,
			day,
			hour,
			minute,
			second,
		},
		sequence: seq,
	};
}
