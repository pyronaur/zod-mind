import { GPT_Client, GPT_Request_Config } from './src/gpt-client';
import { Zod_Healing_LLM } from './src/zod-healing-llm';
import { Zod_LLM } from './src/zod-llm';

type Zod_Mind_Options = {
	type: "self-healing" | "normal",
	openai: GPT_Request_Config,
}

export function zodMind(options: Zod_Mind_Options) {
	const llm = new GPT_Client(options.openai);
	if (options.type === "self-healing") {
		return new Zod_Healing_LLM(llm);
	} else {
		return new Zod_LLM(llm);
	}
}

export { GPT_Client } from './src/gpt-client';
export { Zod_LLM } from './src/zod-llm';
export { Zod_Healing_LLM } from './src/zod-healing-llm';
export { zod_to_open_api } from './src/utils';

// Can't wait for TypeScript 5.1 export * types
export type {
	AnyObject,
	AnyValue,
	AnyArray,
	LLM_Interface,
	LLM_Zod_Interface,
} from './src/types';

// tmp
export { nLogs } from './src/logger';