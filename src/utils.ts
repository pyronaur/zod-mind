import zodToJsonSchema from 'zod-to-json-schema';
import type { z } from 'zod';
import type { JSONObject } from './types';

export function zod_to_open_api<T extends JSONObject>(schema: z.ZodSchema<T>): JSONObject {
	return zodToJsonSchema(schema, {
		target: "openApi3",
		$refStrategy: "none",
		definitionPath: "schema",
	}) as JSONObject;

}

export function trim_line_whitespace(content: string): string {
	return content
		.split("\n")
		.map(line => line.trim())
		.join("\n");
}