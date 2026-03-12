import { assertInRange } from "./utils";

export type Date16Bit = {
	/** 2000-2127 */
	year: number;
	/** 1-12 */
	month: number;
	/** 1-31 */
	day: number;
};

/**
 * Decodes a 2 bytes date format.
 * @param data 2 bytes (16 bits) date
 * @returns An object with the decoded year, month and day
 */
export function decodeDate(data: Uint8Array): Date16Bit {
	if (data.length !== 2) throw new Error("Encoded date must be 2 bytes");

	const dateInt = (data[0]! << 8) | data[1]!;

	const year = ((dateInt >> 9) & 0x7f) + 2000;
	const month = (dateInt >> 5) & 0x0f;
	assertInRange({ month }, 1, 12);
	const day = dateInt & 0x1f;
	assertInRange({ day }, 1, 31);

	return { year, month, day };
}

/**
 * Encodes a date into the 2 bytes format.
 * @param date An object with the year, month and day to encode
 * @returns A Uint8Array with the encoded date
 */
export function encodeDate(date: Date16Bit): Uint8Array {
	const { year, month, day } = date;
	assertInRange({ year }, 2000, 2000 + 2 ** 7 - 1);
	assertInRange({ month }, 1, 12);
	assertInRange({ day }, 1, 31);

	const dateInt = ((year - 2000) << 9) | ((month & 0x0f) << 5) | (day & 0x1f);

	return new Uint8Array([dateInt >> 8, dateInt & 0xff]);
}
