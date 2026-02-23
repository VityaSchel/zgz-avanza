/**
 * Decodes transaction from a 16-byte record
 * @param transaction The 16-byte transaction record
 * @returns An object with the decoded transaction fields
 */
export function decodeTransaction(transaction: Uint8Array) {
	if (transaction.length !== 16) {
		throw new Error(`Invalid transaction length: ${transaction.length}`);
	}
	const header = transaction.slice(0, 3);
	if (header[0] !== 0x02 || header[1] !== 0x00 || header[2] !== 0x02) {
		throw new Error(
			`Unknown transaction record marker: ${header.toHex()} (bytes 0-2)`,
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
