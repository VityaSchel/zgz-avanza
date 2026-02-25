import { expect, it } from "bun:test";
import { decodeBalance, encodeBalance } from "../src/balance";

const tests = [
	{
		balance: 600,
		encoded: "58020000A7FDFFFF5802000002FD02FD",
	},
	{
		balance: 5000,
		encoded: "8813000077ECFFFF8813000002FD02FD",
	},
];

it("should decode balance", () => {
	for (const { balance, encoded } of tests) {
		expect(decodeBalance(Uint8Array.fromHex(encoded))).toEqual(balance);
	}
});

it("should encode balance", () => {
	for (const { balance, encoded } of tests) {
		expect(encodeBalance(balance)).toEqual(Uint8Array.fromHex(encoded));
	}
});
