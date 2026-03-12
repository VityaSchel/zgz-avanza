import { decodeDate, encodeDate } from "./date";

const transactionHeaders = [0x020002, 0x020000, 0x0a0200, 0x0a0100];

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
 * Encodes transaction to a 16-byte record
 * @param transaction An object with the transaction fields
 * @returns The 16-byte transaction record
 */
export function encodeTransaction({
	header,
	fareId,
	consecutivePaymentsCounter,
	unknownVar1,
	line,
	direction,
	unknownVar2,
	createdAt: { year, month, day, hour, minute, second },
	sequence,
}: Transaction): Uint8Array {
	if (!transactionHeaders.includes(header)) {
		throw new Error(
			`Unknown transaction record marker: ${header.toString(16)} (bytes 0-2)`,
		);
	}
	if (
		consecutivePaymentsCounter === undefined ||
		consecutivePaymentsCounter < 1
	) {
		throw new Error(
			`Invalid consecutive payments counter: ${consecutivePaymentsCounter} (byte 4)`,
		);
	}
	if (direction !== 1 && direction !== 2) {
		throw new Error(`Invalid transaction direction: ${direction} (byte 8)`);
	}
	const date = encodeDate({ year, month, day });
	if (hour > 24) {
		throw new Error(`Invalid transaction hour: ${hour} (byte 12)`);
	}
	if (minute > 60) {
		throw new Error(`Invalid transaction minute: ${minute} (byte 13)`);
	}
	if (second > 60) {
		throw new Error(`Invalid transaction second: ${second} (byte 14)`);
	}
	if (sequence < 0 || sequence > 4) {
		throw new Error(
			`Invalid transaction sequence number: ${sequence} (byte 15)`,
		);
	}
	const transaction = new Uint8Array(16);
	transaction[0] = (header >> 16) & 0xff;
	transaction[1] = (header >> 8) & 0xff;
	transaction[2] = header & 0xff;
	transaction[3] = fareId;
	transaction[4] = consecutivePaymentsCounter;
	transaction.set(unknownVar1, 5);
	transaction[7] = line;
	transaction[8] = direction;
	transaction.set(unknownVar2, 9);
	transaction.set(date, 10);
	transaction[12] = hour;
	transaction[13] = minute;
	transaction[14] = second;
	transaction[15] = sequence;
	return transaction;
}

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
	if (!transactionHeaders.includes(header)) {
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
		throw new Error(
			`Invalid consecutive payments counter: ${consecutivePaymentsCounter} (byte 4)`,
		);
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
	if (seq === undefined || seq < 0 || seq > 4) {
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
