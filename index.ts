import { GPT_Client, GPT_Request_Config } from './src/GPT_Client';
import { Zod_GPT } from './src/Zod_GPT';

type Zod_Mind_Options = {
	openai?: GPT_Request_Config,
	api_key?: string,
}

export function zodMind(options: Zod_Mind_Options = {}) {
	const llm = new GPT_Client(options?.openai, options?.api_key);
	return new Zod_GPT(llm);
}

export { GPT_Client } from './src/GPT_Client';
export { Zod_GPT } from './src/Zod_GPT';
export { zod_to_open_api } from './src/utils';

export type * from './src/types';
