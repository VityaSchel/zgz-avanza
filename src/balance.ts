/**
 * Decode balance in dump
 * @param units Integer between 0 and 2147483647. €1.00 = 1000 units.
 * @return Encoded balance for block 8 and 9
 */
export function encodeBalance(units: number): Uint8Array {
  if (units < 0 || units > 2147483647) {
    throw new Error("Balance must be between 0 and 2147483647 units");
  }
  if (units % 1 !== 0) {
    throw new Error("Balance must be an integer number of units");
  }
  const le = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    le[i] = (units >> (i * 8)) & 0xFF;
  }
  const complement = le.map(byte => ~byte & 0xFF);
  const block = new Uint8Array(16);
  block.set(le, 0);
  block.set(complement, 4);
  block.set(le, 8);
  block.set([2, 253, 2, 253], 12);
  return block;
}

/**
 * Decode balance from block 8 or 9
 * @param block The block data (16 bytes)
 * @return The balance in units (0 to 2147483647). 1000 units = €1.00.
 */
export function decodeBalance(block: Uint8Array): number {
  const value = block.subarray(0, 12)
  const le = value.subarray(0, 4)
  const aComplement = value.subarray(4, 8)
  if (!le.every((byte, index) => byte === value[index + 8])) {
    throw new Error("Invalid balance block: bytes 0-3 and 8-11 do not match");
  }
  const balance = le.reduce((acc, byte, index) => acc + (byte << (index * 8)), 0);
  const bComplement = le.map(byte => ~byte & 0xFF);
  if (!bComplement.every((byte, index) => byte === aComplement[index])) {
    throw new Error("Invalid balance block: bytes 4-7 are not the complement of bytes 0-3");
  }
  return balance;
}