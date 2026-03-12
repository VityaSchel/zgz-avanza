import { expect, it } from "bun:test";
import { decodeTransaction, encodeTransaction } from "../src/transaction";
import { tests } from "./transactions-tests";

it("should decode transaction", () => {
	for (const { transaction, encoded } of tests) {
		expect(decodeTransaction(Uint8Array.fromHex(encoded))).toEqual(transaction);
	}
});

it("should encode transaction", () => {
	for (const { transaction, encoded } of tests) {
		expect(encodeTransaction(transaction)).toEqual(Uint8Array.fromHex(encoded));
	}
});
