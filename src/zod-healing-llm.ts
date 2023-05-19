import type { z } from 'zod';
import type { AnyValue, LLM_Interface } from './types';

import { mind } from './logger';
import { zod_to_open_api } from './utils';
import type { AnyObject, LLM_Zod_Interface } from './types';
import { Zod_LLM } from './zod-llm';
import { Zod_GPT_Error } from './zod-llm-error';

const RECOVERY_SYSTEM_MESSAGE = `Use ONLY valid JSON to reply. Do not insert any text before or after JSON.`

export class Zod_Healing_LLM implements LLM_Zod_Interface {
	private zod_client: Zod_LLM;
	constructor (private readonly client: LLM_Interface, system_message?: string) {
		this.zod_client = new Zod_LLM(this.client, system_message);
	};

	public async chat<T extends AnyValue>(message: AnyValue, response_schema: z.ZodSchema<T>): Promise<T> {

		try {
			return await this.zod_client.chat(message, response_schema);
		} catch (e) {

			if (!(e instanceof Zod_GPT_Error)) {
				throw e;
			}

			// Currently, attempt recovery only once.
			// Maybe worth attempting multiple times?
			// We'll see if this comment is here in 5 years....
			const expected_schema = zod_to_open_api(response_schema);

			const prompt = `` +
				`Analyze the "ERROR" and "SCHEMA" and modify "INVALID JSON" to match the expected "JSON SCHEMA".` +
				`\nINVALID JSON:\n${e.result}` +
				`\nZod.js ERROR:\n${JSON.stringify(e.error, null, 4)}` +
				`\nJSON SCHEMA:\n${JSON.stringify(expected_schema, null, 4)}`;

			mind.debug("Recovery prompt:", prompt);
			const response = await this.client.incognito_chat(prompt, RECOVERY_SYSTEM_MESSAGE);
			mind.debug("Recovery result:", response);
			return response_schema.parse(JSON.parse(response));
		}

	}
}

