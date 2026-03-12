import { expect, it } from "bun:test";
import { decodeBlock10, encodeBlock10 } from "../src/block10";

const tests = [
	{
		encoded: "00002ADC091B010200D2020000630054",
		block: {
			previousTransactionLine: undefined,
			previousTransactionDirection: undefined,
			createdAt: {
				year: 2021,
				month: 6,
				day: 28,
				hour: 9,
				minute: 27,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 210,
			direction: 2,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "00002AD8132D010200D201000063007F",
		block: {
			previousTransactionLine: undefined,
			previousTransactionDirection: undefined,
			createdAt: {
				year: 2021,
				month: 6,
				day: 24,
				hour: 19,
				minute: 45,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 210,
			direction: 1,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "D2012AD90D33010200D20200006300AE",
		block: {
			previousTransactionLine: 210,
			previousTransactionDirection: 1,
			createdAt: {
				year: 2021,
				month: 6,
				day: 25,
				hour: 13,
				minute: 51,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 210,
			direction: 2,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "D2022AD91026010200D20100006300A6",
		block: {
			previousTransactionLine: 210,
			previousTransactionDirection: 2,
			createdAt: {
				year: 2021,
				month: 6,
				day: 25,
				hour: 16,
				minute: 38,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 210,
			direction: 1,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "23023454102D0102001601000063000B",
		block: {
			previousTransactionLine: 35,
			previousTransactionDirection: 2,
			createdAt: {
				year: 2026,
				month: 2,
				day: 20,
				hour: 16,
				minute: 45,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 22,
			direction: 1,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "16013468002B04020016020000630011",
		block: {
			previousTransactionLine: 22,
			previousTransactionDirection: 1,
			createdAt: {
				year: 2026,
				month: 3,
				day: 8,
				hour: 0,
				minute: 43,
				second: 4,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 22,
			direction: 2,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
	{
		encoded: "0000346A0C1F0102001601000063003A",
		block: {
			previousTransactionLine: undefined,
			previousTransactionDirection: undefined,
			createdAt: {
				year: 2026,
				month: 3,
				day: 10,
				hour: 12,
				minute: 31,
				second: 1,
			},
			unknownVar1: Uint8Array.from([2, 0]),
			line: 22,
			direction: 1,
			constant: Uint8Array.from([0, 0, 99]),
		},
	},
];

it("should decode block10", () => {
	for (const { block, encoded } of tests) {
		expect(decodeBlock10(Uint8Array.fromHex(encoded))).toEqual(block);
	}
});

it("should encode block10", () => {
	for (const { block, encoded } of tests) {
		expect(encodeBlock10(block)).toEqual(Uint8Array.fromHex(encoded));
	}
});
