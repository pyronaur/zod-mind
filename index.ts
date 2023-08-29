import { GPT_Client, GPT_Model, GPT_Request_Config } from './src/GPT_Client';
import { Zod_GPT } from './src/Zod_GPT';

type Zod_Mind_Options = {
	openai?: GPT_Request_Config,
	api_key?: string,
}

export function zodMind(config: GPT_Model | Zod_Mind_Options = {}, key?: string) {
	// If config is a string, assume it's a model name.
	const options = typeof config === 'string' ? { model: config } : config.openai;
	// Check for api key in second argument or in config object.
	const api_key = typeof config === 'string' ? key : config.api_key;
	const llm = new GPT_Client(options, api_key);
	return new Zod_GPT(llm);
}

export { GPT_Client } from './src/GPT_Client';
export { Zod_GPT } from './src/Zod_GPT';
export { zod_to_open_api } from './src/utils';

export type * from './src/types';
