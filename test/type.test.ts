import { expect, it } from "bun:test";
import { CardType, decodeCardType, encodeCardType } from "../src/type";

const tests = [
	{
		type: CardType.TopUp,
		encoded: "02699F000000000000000000000000F4",
	},
	{
		type: CardType.PersonalUnlimited,
		encoded: "0A9775000000000000000000000000E8",
	},
];

it("should decode card type", () => {
	for (const { type, encoded } of tests) {
		expect(decodeCardType(Uint8Array.fromHex(encoded))).toEqual(type);
	}
});

it("should encode card type", () => {
	for (const { type, encoded } of tests) {
		expect(encodeCardType(type)).toEqual(Uint8Array.fromHex(encoded));
	}
});
