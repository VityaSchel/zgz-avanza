import { expect, it } from "bun:test";
import { decodeBalance, encodeBalance } from "../src/balance";

it("should decode balance", () =>
	expect(
		decodeBalance(Uint8Array.fromHex("58020000A7FDFFFF5802000002FD02FD")),
	).toBe(600));

it("should encode balance", () =>
	expect(encodeBalance(600)).toEqual(
		Uint8Array.fromHex("58020000A7FDFFFF5802000002FD02FD"),
	));
