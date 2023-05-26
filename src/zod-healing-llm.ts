import type { z } from 'zod';
import type { AnyValue, LLM_Error, LLM_Interface } from './types';

import { mind } from './logger';
import { Outcome, problem, success, zod_to_open_api } from './utils';
import type { LLM_Zod_Interface } from './types';
import { Zod_LLM } from './zod-llm';

const RECOVERY_SYSTEM_MESSAGE = `
You are an AI assistant that fixes provided data. The user will provide you with DATA and your task is to fix it.
Your HIGHEST priority is to make sure the you return JSON that matches JSON SCHEMA.
Use ONLY valid JSON to reply.
Do not insert any text before or after JSON.
The JSON you return must match the JSON SCHEMA.



# EXAMPLE 1:

DATA:
This is a really interesting question! 
\`\`\`json
{ 
	"__AI_RESPONSE": {
		"answer": 42,
	}
}
\`\`\`

JSON SCHEMA:
{
	"type": "object",
	"properties": {
		"answer": {
			"type": "number",
		},
	},
	"required": [
		"answer",
	],
}

RESPONSE:
{ "answer": 42 }

# EXAMPLE 2:

DATA:
This is a really interesting question! I like the answer from the book "The Hitchhiker's Guide to the Galaxy".

JSON SCHEMA:
{
	"type": "object",
	"properties": {
		"answer": {
			"type": "number",
		},
	},
	"required": [
		"answer",
	],
}

RESPONSE:
{ "answer": 42 }
`


export class Zod_Healing_LLM implements LLM_Zod_Interface {
	private readonly zod_client: Zod_LLM;
	constructor (private readonly llm: LLM_Interface, system_message?: string) {
		this.zod_client = new Zod_LLM(llm, system_message);
	};

	public async chat<T extends AnyValue>(message: AnyValue, response_schema: z.ZodSchema<T>): Promise<Outcome<T, LLM_Error>> {

		const expected_schema = zod_to_open_api(response_schema);
		if (expected_schema.status === 'problem') {
			return expected_schema;
		}

		const response = await (this.zod_client.chat(message, response_schema));
		if (response.status === 'success') {
			return response;
		}

		mind.debug("Zod_LLM failed to parse LLM Response JSON.", response);

		if (response.error.type === 'schema') {
			return response;
		}

		// The response is invalid and the schema is valid.
		// Attempt to recover.
		const prompt: string = `` +
			`\nDATA:\n${response.error.value}` +
			`\nZod.js ERROR:\n${JSON.stringify(response.error.error, null, 4)}` +
			`\nJSON SCHEMA:\n${JSON.stringify(expected_schema, null, 4)}` +
			`\n\n` +
			`RESPONSE:`;

		mind.debug("Recovery prompt:", prompt);

		const recovery = await this.llm.incognito_chat(prompt, RECOVERY_SYSTEM_MESSAGE);

		try {
			return success(response_schema.parse(JSON.parse(recovery)));
		} catch (e) {
			return problem("Recovery failed.", {
				type: 'parse',
				value: recovery,
				error: e,
			}, e);
		}

	}
}

