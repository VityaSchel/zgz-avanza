import { expect, it } from "bun:test";
import { decodeId, encodeId } from "../src/id";

const tests = [
	{
		encoded: "42453227430000000000000000000051",
		decoded: "BE322743",
	},
	{
		encoded: "42453227420000000000000000000050",
		decoded: "BE322742",
	},
	{
		encoded: "4245739977000000000000000000009A",
		decoded: "BE739977",
	},
]

it("should decode id", () => {
	for (const { encoded, decoded } of tests) {
		expect(decodeId(Uint8Array.fromHex(encoded))).toEqual(decoded);
	}
});

it("should encode id", () => {
	for (const { encoded, decoded } of tests) {
		expect(encodeId(decoded)).toEqual(Uint8Array.fromHex(encoded));
	}
});
