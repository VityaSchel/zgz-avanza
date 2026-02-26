// TODO: decode transactions format using more dumps

/**
 * Decodes transaction from a 16-byte record
 * @param transaction The 16-byte transaction record
 * @returns An object with the decoded transaction fields
 */
export function decodeTransaction(transaction: Uint8Array): {
	header: Uint8Array<ArrayBuffer>;
	cardType: Uint8Array<ArrayBuffer>;
	unknownVar1: Uint8Array<ArrayBuffer>;
	line: number;
	direction: number;
	unknownVar2: Uint8Array<ArrayBuffer>;
	createdAt: {
		hour: number;
		minute: number;
		second: number;
	};
	sequence: number;
} {
	if (transaction.length !== 16) {
		throw new Error(`Invalid transaction length: expected 16 bytes`);
	}
	const header = transaction.slice(0, 3).reduce((acc, byte) => (acc << 8) | byte, 0);
	if (header !== 0x020002 && header !== 0x0A0100 && header !== 0x0A0200) {
		throw new Error(
			`Unknown transaction record marker: ${header.toString(16)} (bytes 0-2)`,
		);
	}
	const cardType = transaction.slice(3, 5);
	const unknownVar1 = transaction.slice(5, 7);
	const line = transaction.slice(7, 8)[0];
	if (line === undefined) {
		throw new Error(`Invalid transaction line number: ${line} (byte 7)`);
	}
	const direction = transaction.slice(8, 9)[0];
	if (direction === undefined || (direction !== 1 && direction !== 2)) {
		throw new Error(`Invalid transaction direction: ${direction} (byte 8)`);
	}
	const unknownVar2 = transaction.slice(9, 12);
	const bcdHour = transaction.slice(12, 13)[0];
	if (bcdHour === undefined || bcdHour > 24) {
		throw new Error(`Invalid transaction hour: ${bcdHour} (byte 12)`);
	}
	const bcdMinute = transaction.slice(13, 14)[0];
	if (bcdMinute === undefined || bcdMinute > 60) {
		throw new Error(`Invalid transaction minute: ${bcdMinute} (byte 13)`);
	}
	const bcdSecond = transaction.slice(14, 15)[0];
	if (bcdSecond === undefined || bcdSecond > 60) {
		throw new Error(`Invalid transaction second: ${bcdSecond} (byte 14)`);
	}
	const seq = transaction.slice(15, 16)[0];
	if (seq === undefined) {
		throw new Error(`Invalid transaction sequence number: ${seq} (byte 15)`);
	}
	return {
		header,
		cardType,
		unknownVar1,
		line,
		direction,
		unknownVar2,
		createdAt: {
			hour: bcdHour,
			minute: bcdMinute,
			second: bcdSecond,
		},
		sequence: seq,
	};
}
