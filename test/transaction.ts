import { decodeTransaction, type Transaction } from "../src/transaction";
import chalk from "chalk";

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

console.log("---");
console.log("BE322743");
log(decodeTransaction(Uint8Array.fromHex("020002F8010320D201FE2AD8132D1201")));
log(decodeTransaction(Uint8Array.fromHex("020002F80105DCD2026B2AD90D333B02")));
log(decodeTransaction(Uint8Array.fromHex("020002F80102BCD201992AD910260D03")));
console.log("---");
console.log("BE322742");
log(decodeTransaction(Uint8Array.fromHex("020002F8010640D202252ADC091B2F01")));
console.log("---");
console.log("BE739977");
log(decodeTransaction(Uint8Array.fromHex("0200022601817E1F0211344D10163003")));
log(decodeTransaction(Uint8Array.fromHex("020002260180011F0112344D14100704")));
log(decodeTransaction(Uint8Array.fromHex("02000226018001230209344E0C051B00")));
log(decodeTransaction(Uint8Array.fromHex("0200022601817F160105344E0D1F2001")));
log(decodeTransaction(Uint8Array.fromHex("0200022601801E23020934540F153502")));
log(decodeTransaction(Uint8Array.fromHex("020002260180CE16010D3454102D2403")));
