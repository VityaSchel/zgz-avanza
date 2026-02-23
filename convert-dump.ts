const input = process.argv[2]

if (!input) {
  console.error("Usage: bun convert-dump.js <input-file>")
  process.exit(1)
}

const inputFile = Bun.file(input)
const content = JSON.parse(await inputFile.text())
const contentHex = Object.values(content.blocks as string[]).reduce((acc, c) => acc += c, "")
const contentBytes = Uint8Array.fromHex(contentHex)
await Bun.file(input.replace(/\.json$/, ".mfd")).write(contentBytes)
await inputFile.delete()