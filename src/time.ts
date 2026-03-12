import { assertInRange } from "./utils";

export type Time = {
	/** 0-23 */
	hour: number;
	/** 0-59 */
	minute: number;
	/** 0-59 */
	second: number;
};

/**
 * Decodes a BCD-encoded 3-bytes time.
 * @param data 3 bytes
 * @returns An object with the decoded hour, minute and second
 */
export function decodeTime(data: Uint8Array): Time {
	if (data.length !== 3) throw new Error("Encoded time must be 3 bytes");
	const hour = data[0];
	if (hour === undefined || hour > 24) {
		throw new Error(`Invalid BCD-encoded hour: ${hour}`);
	}
	const minute = data[1];
	if (minute === undefined || minute > 60) {
		throw new Error(`Invalid BCD-encoded minute: ${minute}`);
	}
	const second = data[2];
	if (second === undefined || second > 60) {
		throw new Error(`Invalid BCD-encoded second: ${second}`);
	}
	return { hour, minute, second };
}

/**
 * Encodes time into the BCD format.
 * @param time An object with the hour, minute and second to encode
 * @returns A Uint8Array with the encoded time
 */
export function encodeTime({ hour, minute, second }: Time): Uint8Array {
	assertInRange({ hour }, 0, 23);
	assertInRange({ minute }, 0, 59);
	assertInRange({ second }, 0, 59);

	return Uint8Array.from([hour, minute, second]);
}
