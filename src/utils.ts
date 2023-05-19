import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';
import type { AnyObject, AnyValue } from './types';

export function zod_to_open_api<T extends AnyValue>(schema: z.ZodSchema<T>): AnyObject {
	const json_schema = zodToJsonSchema(schema, {
		$refStrategy: "none",
		definitionPath: "schema",
	}) as AnyObject;
	delete json_schema["$schema"];
	return json_schema;
}

export function trim_line_whitespace(content: string): string {
	return content
		.split("\n")
		.map(line => line.trim())
		.join("\n");
}