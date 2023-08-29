import { GPT_Client, GPT_Model, GPT_Request_Config } from './src/GPT_Client';
import { Zod_GPT, Zod_GPT_Config } from './src/Zod_GPT';

type Zod_Mind_Options = {
	openai?: GPT_Request_Config,
	mind?: Partial<Zod_GPT_Config>,
	api_key?: string,
}

export function zodMind(config: GPT_Model | Zod_Mind_Options = "gpt-3.5-turbo", key?: string) {

	const gpt_defaults: GPT_Request_Config = {
		model: "gpt-3.5-turbo",
	}
	// If config is a string, assume it's a model name.
	const gpt_client_options = typeof config === 'string' ? { model: config } : {
		...gpt_defaults,
		...config.openai,
	};

	// Check for api key in second argument or in config object.
	const api_key = typeof config === 'string' ? key : config.api_key;
	const llm = new GPT_Client(gpt_client_options, api_key);

	const zod_gpt_defaults = {
		auto_healing: 0,
		system_message: `You're a helpful AI Assistant`
	}
	const zod_gpt_options = typeof config === 'string' ? zod_gpt_defaults : {
		...zod_gpt_defaults,
		...config.mind,
	};

	return new Zod_GPT(llm, zod_gpt_options);
}

export { GPT_Client } from './src/GPT_Client';
export { Zod_GPT } from './src/Zod_GPT';
export { zod_to_open_api } from './src/utils';

export type * from './src/types';
