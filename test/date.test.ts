import { expect, it } from "bun:test";
import { encodeDate, decodeDate, type Date16Bit } from "../src/date";

const tests: { date: Date16Bit; encoded: string }[] = [
	{
		date: {
			year: 2000,
			month: 1,
			day: 2,
		},
		encoded: "0022",
	},
	{
		date: {
			year: 2015,
			month: 11,
			day: 31,
		},
		encoded: "1F7F",
	},
	{
		date: {
			year: 2026,
			month: 2,
			day: 14,
		},
		encoded: "344E",
	},
	{
		date: {
			year: 2025,
			month: 12,
			day: 3,
		},
		encoded: "3383",
	},
];

it("should decode date", () => {
	for (const { date, encoded } of tests) {
		expect(decodeDate(Uint8Array.fromHex(encoded))).toEqual(date);
	}
});

it("should encode date", () => {
	for (const { date, encoded } of tests) {
		expect(encodeDate(date)).toEqual(Uint8Array.fromHex(encoded));
	}
});
