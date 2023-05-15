import { Configuration, OpenAIApi, type CreateChatCompletionRequest } from 'openai';
import { mind } from './logger';
import { LLM_Interface } from './types';
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


type GPT_Config = Omit<CreateChatCompletionRequest, "messages">;
type Message = {
	role: 'user' | 'system',
	content: string,
};

export class GPT_Client implements LLM_Interface {

	private history: Message[] = [];

	constructor (protected options: GPT_Config) { }

	public set_system_message(message: string): void {
		this.history.push({
			role: 'system',
			content: message,
		});
	}

	public async chat(message: string): Promise<string> {
		this.history.push({
			role: 'user',
			content: message,
		});

		return this.send(this.history);
	}

	private async send(messages: Message[]): Promise<string> {
		const response = await openai.createChatCompletion({
			...this.options,
			messages,
		});
		if (!response.data.choices[0]?.message?.content) {
			mind.problem("GPT Response:", response.data);
			return '';
		}
		mind.debug("GPT Response:", response.data.choices[0].message?.content);
		return response.data.choices[0].message?.content;
	}

	public async incognito_chat(message: string, system?: string): Promise<string> {

		const messages: Message[] = [
			{
				role: 'user',
				content: message
			}
		];

		const system_message = system ? system : this.history[0]?.content;
		if (system_message) {
			messages.push({
				role: 'system',
				content: system_message,
			});
		}

		return this.send(messages);
	}

}
