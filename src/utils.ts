export function assertInRange(
	valueArg: Record<string, number>,
	min: number,
	max: number,
) {
	const arg = Object.entries(valueArg)[0];
	if (!arg) {
		throw new Error("Invalid assertInRange argument");
	}
	const [name, value] = arg;
	if (value < min || value > max) {
		throw new Error(
			`Invalid ${name} value: ${value}, must be between ${min} and ${max}`,
		);
	}
}
