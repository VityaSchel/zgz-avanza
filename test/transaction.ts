import { decodeTransaction, type Transaction } from "../src/transaction";
import chalk from "chalk";
import { tests } from "./transaction.test";

// temporary dump viewer & pretty printer
// more dumps are in transactions-private.ts importing this file to automatically run these tests too

export function log(transaction: Transaction) {
	console.log(
		chalk.ansi256(240)(transaction.consecutivePaymentsCounter.toString()),
		chalk.bold(
			chalk.ansi256(220)(transaction.line.toString().padEnd(3, " ")),
			chalk.ansi256(transaction.direction === 1 ? 230 : 153)(
				transaction.direction === 1 ? "-->" : "<--",
			),
			`${transaction.createdAt.day.toString().padStart(2, "0")}-${transaction.createdAt.month.toString().padStart(2, "0")}-${transaction.createdAt.year} ${transaction.createdAt.hour.toString().padStart(2, "0")}:${transaction.createdAt.minute.toString().padStart(2, "0")}:${transaction.createdAt.second.toString().padStart(2, "0")}`,
		),
		"header = " +
			chalk.ansi256(200)(
				transaction.header.toString(16).toUpperCase().padStart(6, "0"),
			) +
			` (${chalk.ansi256(214)(transaction.header)});`,
		"fareId = " +
			chalk.ansi256(200)(
				transaction.fareId.toString(16).toUpperCase().padStart(2, "0"),
			) +
			` (${chalk.ansi256(214)(transaction.fareId?.toString().padStart(3, " "))});`,
		"var1 = " +
			chalk.ansi256(200)(transaction.unknownVar1.toHex().toUpperCase()) +
			` (${chalk.ansi256(214)(transaction.unknownVar1[0]?.toString().padStart(3, " "))},${chalk.ansi256(214)(transaction.unknownVar1[1]?.toString().padStart(3, " "))});`,
		"var2 = " +
			chalk.ansi256(200)(transaction.unknownVar2.toHex().toUpperCase()) +
			` (${chalk.ansi256(214)(transaction.unknownVar2?.toString().padStart(3, " "))})`,
	);
}

for (const t of tests) {
	console.log(decodeTransaction(Uint8Array.fromHex(t.encoded)));
}
