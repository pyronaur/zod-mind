import type { z } from 'zod';

import { zod_to_open_api, trim_line_whitespace, problem, success, Outcome } from './utils';
import type { AnyValue, LLM_Error, LLM_Interface, LLM_Zod_Interface } from './types';
import { mind } from './logger';

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace(`
You are an AI assistant that communicates using valid JSON.
You must combine the question given in "prompt" with keys and descriptions in "json_schema".
Your response must be formatted according to "json_schema" provided.
You must never ignore the "json_schema" provided.
If you notice fields called "description" in "json_schema", you must use those to augment your response.
NEVER insert text before or after your JSON response.
Your response should always be formatted as follows:
\`\`\`
{
	"__AI_RESPONSE": <<JSON response that passes "json_schema" validation>>
}
\`\`\`
`);



export class Zod_LLM implements LLM_Zod_Interface {
	constructor (private readonly client: LLM_Interface, system_message: string = DEFAULT_SYSTEM_MESSAGE) {
		this.client.set_system_message(system_message);
	};
	private async send(message: string): Promise<string> {
		const result = await this.client.chat(message);
		return result;
	}

	public async chat<T extends AnyValue>(message: AnyValue, zod_schema: z.ZodSchema<T>): Promise<Outcome<T, LLM_Error>> {

		const json_schema = zod_to_open_api(zod_schema);
		if (json_schema.status === 'problem') {
			return json_schema;
		}

		const prompt = JSON.stringify({
			"prompt": message,
			"json_schema": json_schema.value,
		}, null, 4);

		mind.debug("Prompt:", prompt);
		const result = await this.send(prompt);
		mind.debug("Result:", result);

		try {
			const json = JSON.parse(result);
			const parsed = zod_schema.parse(json.__AI_RESPONSE);
			return success(parsed);
		} catch (e) {
			return problem("Zod_LLM failed to parse LLM Response JSON.", {
				type: 'parse',
				value: result,
				error: e,
			}, e);
		}


	}
}

