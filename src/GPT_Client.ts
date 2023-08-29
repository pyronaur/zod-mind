import pRetry from 'p-retry';
import { client } from './logger';
import { AnyObject } from "./types";


type Role = 'system' | 'user' | 'assistant';

type GPT_Response = {
	type: 'message',
	data: string,
} | {
	type: 'function_call',
	data: {
		name: string;
		arguments: string;
	}
}

type Message = {
	role: Role;
	content?: string;
	name?: string;
	function_call?: {
		name: string;
		arguments: string;
	}
}
type GPT_Function = {
	name: string;
	description: string;
	parameters: AnyObject;
}

export type GPT_Model = 'gpt-3.5-turbo' | `gpt-3.5-turbo-${ number | '16k' | `16k-${number}` }` | 'gpt-4' | `gpt-4-${ number | '32k' | `32k-${number}` }`;

export type GPT_Request_Config = {
	model?: GPT_Model;
	temperature?: number;
	top_p?: number;
	n?: number;
	stream?: boolean;
	stop?: string | string[];
	max_tokens?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	logit_bias?: {
		[ key: string ]: number
	};
	user?: string;
	functions?: GPT_Function[];
	function_call?: 'auto' | 'none' | {
		name: string;
	}
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

const GPT_DEFAULTS: GPT_Request_Config = {
	model: 'gpt-3.5-turbo',
}

export class GPT_Client {

	private history: Message[] = [];
	public options: GPT_Request_Config;
	private is_buffering: boolean = false;

	constructor( options?: undefined | GPT_Request_Config, private api_key?: string ) {
		this.options = {
			...GPT_DEFAULTS,
			...options,
		};
	};

	public buffer( enable: boolean ): GPT_Client {
		this.is_buffering = enable;
		return this;
	}

	public set_agent_message( message: string ): void {
		this.history.push( {
			role: 'assistant',
			content: message,
		} );
	}

	public set_system_message( message: string ): void {
		const system_message = this.history.find( ( message ) => message.role === 'system' );
		if ( system_message ) {
			system_message.content = message
		} else {
			this.history.unshift( {
				role: 'system',
				content: message,
			} );
		}
	}


	private async send( messages: Message[], additional_config: GPT_Request_Config ): Promise<GPT_Response> {
		
		if( this.is_buffering ) {
			return {
				type: 'message',
				data: '',
			}
		}
		
		const response = await this.completions_request( messages, additional_config );
		const choice = response.choices[ 0 ];
		if ( !choice ) {
			throw new Error( "No response from GPT" );
		}

		this.history.push( choice.message );

		if ( choice.message.function_call ) {
			return {
				type: 'function_call',
				data: choice.message.function_call
			}
		}

		if ( choice.message.content ) {
			return {
				type: 'message',
				data: choice.message.content
			}
		}

		throw new Error( "Received a response, but without a function call or content." );
	}

	public async chat( message: string, additional_config: GPT_Request_Config = {} ): Promise<GPT_Response> {
		this.history.push( {
			role: 'user',
			content: message,
		} );

		return await this.send( this.history, additional_config );
	}

	private async completions_request( messages: Message[], additional_config: GPT_Request_Config ): Promise<ChatResponse> {
		const url = 'https://api.openai.com/v1/chat/completions';
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${ this.api_key || process.env.OPENAI_API_KEY }`
		};

		const body = {
			...this.options,
			messages: messages,
			...additional_config
		};

		try {
			const res = await pRetry(
				() => fetch( url, {
					method: 'POST',
					headers: headers,
					keepalive: false,
					body: JSON.stringify( body )
				} ),
				{
					retries: 10,
					onFailedAttempt: ( error ) => {
						client
							.retry( `${ error.attemptNumber }/10 Failed to get a response from OpenAI. ` )
							.debug( error );
					}
				}
			);
			client.info( "Body:", body );
			if ( !res.ok ) {
				const message = await res.text();
				client.problem( "OpenAI Response:", message );
				switch ( res.status ) {
					case 429:
						throw new Error( 'Error 429: Too many requests. Please slow down your request rate.' );
					case 503:
					case 500:
						throw new Error( 'Error 500: Server error. Please try again later.' );
					case 400:
						throw new Error( 'Error 400: Bad request. Please check your request data.' );
					default:
						throw new Error( `Error ${ res.status }: ${ res.statusText }` );
				}
			}

			const data: ChatResponse = await res.json();
			client.debug( "GPT Response:", data );

			return data;
		} catch ( err ) {
			console.error( "Failed to parse the response from OpenAI", err );
			throw err;
		}
	}


}
