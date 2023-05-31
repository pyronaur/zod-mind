import { logthing } from 'logthing';
import { LLM_Interface } from './types';

const log = logthing('GPT Client', ['verbose', 'debug', 'info', 'problem']);

type Role = 'system' | 'user' | 'assistant';

type Message = {
	role: Role;
	content: any;
	name?: string;
}

export type GPT_Request_Config = {
	model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-32k';
	temperature?: number;
	top_p?: number;
	n?: number;
	stream?: boolean;
	stop?: string | string[];
	max_tokens?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	logit_bias?: { [key: string]: number };
	user?: string;
}

type ResponseChoice = {
	index: number;
	message: Message;
	finish_reason: string;
}

type ChatResponse = {
	id: string;
	object: string;
	created: number;
	choices: ResponseChoice[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

export class GPT_Client implements LLM_Interface {

	private history: Message[] = [];

	constructor (protected options: GPT_Request_Config = {}, private api_key?: string) { }

	public set_system_message(message: string): void {
		this.history.push({
			role: 'system',
			content: message,
		});
	}

	public async chat(message: any): Promise<string> {
		this.history.push({
			role: 'user',
			content: message,
		});

		const response = await this.send(this.history);

		this.history.push({
			role: 'assistant',
			content: response,
		});

		return response;
	}

	private async openai_chat(messages: Message[], config: GPT_Request_Config): Promise<ChatResponse> {
		const url = 'https://api.openai.com/v1/chat/completions';
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${this.api_key || process.env.OPENAI_API_KEY}`
		};

		const body = {
			model: config.model || 'gpt-3.5-turbo',
			messages: messages,
			...config
		};

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: headers,
				keepalive: false,
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				switch (res.status) {
					case 429:
						throw new Error('Error 429: Too many requests. Please slow down your request rate.');
					case 503:
					case 500:
						throw new Error('Error 500: Server error. Please try again later.');
					case 400:
						throw new Error('Error 400: Bad request. Please check your request data.');
					default:
						throw new Error(`Error ${res.status}: ${res.statusText}`);
				}
			}

			const data: ChatResponse = await res.json();
			return data;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	private async send(messages: Message[]): Promise<string> {
		try {
			const response = await this.openai_chat(messages, this.options);
			if (!response.choices[0]?.message?.content) {
				log.problem("GPT Response is empty:", response);
				return '';
			}
			log.debug("GPT Response:", response.choices[0].message?.content);
			return response.choices[0].message?.content;
		} catch (e) {
			console.error(e);
		}

		return '';
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
			messages.unshift({
				role: 'system',
				content: system_message,
			});
		}

		log.info('Sending incognito message...')
			.debug(message)
			.verbose(messages);

		const result = await this.send(messages);

		return result;
	}
}
