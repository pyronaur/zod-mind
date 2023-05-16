import type * as ZodMind from './src/types';
import { GPT_Client } from './src/gpt-client';
import { Zod_Healing_LLM } from './src/zod-healing-llm';
import type { CreateChatCompletionRequest } from 'openai';
import { Zod_LLM } from './src/zod-llm';

type Open_AI_Options = Omit<CreateChatCompletionRequest, "messages">;
type Zod_Mind_Options = {
	type: "self-healing" | "normal",
	openai: Open_AI_Options,
}

export function zodMind(options: Zod_Mind_Options) {
	const client = new GPT_Client(options.openai);
	if (options.type === "self-healing") {
		return new Zod_Healing_LLM(client);
	} else {
		return new Zod_LLM(client);
	}
}

export { GPT_Client } from './src/gpt-client';
export { Zod_LLM } from './src/zod-llm';
export { Zod_Healing_LLM } from './src/zod-healing-llm';
export { zod_to_open_api } from './src/utils';

// Can't wait for TypeScript 5.1 export * types
export type JSONObject = ZodMind.JSONObject;
export type JSONValue = ZodMind.JSONValue;
export type JSONArray = ZodMind.JSONArray;
export type LLM_Interface = ZodMind.LLM_Interface;
export type LLM_Zod_Interface = ZodMind.LLM_Zod_Interface;