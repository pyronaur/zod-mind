import { type z, ZodError } from 'zod';

import { zod_to_open_api, trim_line_whitespace } from './utils';
import type { JSONObject, LLM_Interface, LLM_Zod_Interface } from './types';
import { mind } from './logger';
import { Zod_GPT_Error } from './zod-llm-error';

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace(`
Use ONLY valid JSON to communicate. Do not insert any text before or after JSON.
DESCRIPTION:
"user_input": The user's input.
"response_format": JSON Schema describing the expected response.

INSTRUCTIONS:
Given "user_input", you must respond only using JSON as described in "response_format".

NOTES:
If provided with "response_format.description" use that to augment "user_input".
`);



export class Zod_LLM implements LLM_Zod_Interface {
	constructor (private readonly client: LLM_Interface, system_message: string = DEFAULT_SYSTEM_MESSAGE) {
		this.client.set_system_message(system_message);
	};
	private async send(message: string): Promise<string> {
		const result = await this.client.chat(message);
		return result;
	}

	public async chat<T extends JSONObject>(message: string, response_format: z.ZodSchema<T>): Promise<T> {

		const prompt = JSON.stringify({
			"user_input": message,
			"response_format": zod_to_open_api(response_format),
		}, null, 2);
		mind.debug("Prompt:", prompt);

		const result = await this.send(prompt);
		mind.debug("Result:", result);

		try {
			const json = JSON.parse(result);
			const parsed = response_format.parse(json);
			return parsed;
		} catch (e) {
			throw new Zod_GPT_Error("Parsing error", result, e);
		}


	}
}

