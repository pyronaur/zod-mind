import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';

export function zod_to_open_api<T>(schema: z.ZodSchema<T>): Outcome<T, { type: 'schema' }> {
	try {
		const json_schema = zodToJsonSchema(schema, {
			$refStrategy: "none",
			definitionPath: "schema",
		});

		if (json_schema) {
			return success(json_schema as T);
		}

	} catch (e) {
		return problem("Error converting Zod to OpenAPI.", { type: 'schema' }, e);
	}
	return problem("Error converting Zod to OpenAPI.", { type: 'schema' });
}

export function trim_line_whitespace(content: string): string {
	return content
		.split("\n")
		.map(line => line.trim())
		.join("\n");
}

interface Success<T> {
	status: 'success';
	value: T;
}

interface Problem<TProblem> {
	status: 'problem';
	message: string;
	error: TProblem;
}

export type Outcome<T, TProblem = unknown> = Success<T> | Problem<TProblem>;

export function success<T>(value: T): Success<T> {
	return { status: 'success', value };
}

export function problem<TProblem>(message: string, error: TProblem, log?: unknown): Problem<TProblem> {
	if (log) {
		console.error(log);
	}
	return { status: 'problem', message, error };
}