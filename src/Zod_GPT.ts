import { trim_line_whitespace, zod_to_open_api } from './utils';
import { mind } from './logger';
import { GPT_Client } from "./GPT_Client";
import { z } from "zod";

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace( `You're a helpful AI Assistant` );

type GPT_Function = {
	description: string,
	schema: z.ZodObject<any>
}

type GPT_Return_Function<T extends Record<string, GPT_Function>, K extends keyof T | 'auto'> = {
	[Key in keyof T]: {
		name: Key,
		arguments: z.infer<T[Key]['schema']>,
	}
}[K extends 'auto' ? keyof T : K];


export class Zod_GPT {

	constructor( private readonly client: GPT_Client, system_message: string = DEFAULT_SYSTEM_MESSAGE ) {
		this.client.set_system_message( system_message );
	};


	/**
	 * Simple chat interface without structured data or function calls.
	 * @param message
	 */
	public async chat( message: string ) {
		mind.debug( "Prompt:", message );
		const result = await this.client.chat( message );
		mind.debug( "Result:", result );
		return result;
	}

	/**
	 * Let GPT Invoke a function from a list of functions based on the given message.
	 *
	 * @param message
	 * @param functions
	 * @param function_call
	 */
	public async invoke<T extends Record<string, GPT_Function>, K extends keyof T>( message: string, functions: T, function_call?: K): Promise<GPT_Return_Function<T, K>> {
		const additional_config = {
			functions: Object.entries( functions ).map( ( [ name, fn ] ) => {
				return {
					name: name,
					description: fn.description,
					parameters: zod_to_open_api( fn.schema ),
				}
			} ),
			function_call: (! function_call ) ? 'auto' as 'auto' : {
				name: function_call as string,
			}
		}

		const result = await this.client.chat( message, additional_config );

		try {
			if ( result.type === "function_call" ) {
				const func_name = result.data.name;
				if ( !( func_name in functions ) ) throw new Error( `Could not find function ${ func_name }` );

				const func = functions[ func_name ];
				const func_schema = func!.schema;

				return {
					name: func_name,
					arguments: func_schema.parse( JSON.parse( result.data.arguments ) ),
				} as GPT_Return_Function<T, K>;

			} else {
				throw new Error( "Expected a function call response, but got a message." );
			}


		} catch ( e ) {
			mind.problem( "Zod_LLM failed to parse LLM Response JSON.", {
				type: 'parse',
				value: result,
				error: e,
			} );
			throw e;
		}
	}

	/**
	 * Chat with the GPT and parse the response with Zod.
	 * @param message - GPT Instructions
	 * @param zod_schema - Response Format
	 */
	public async structured_chat<T extends z.ZodObject<any>>( message: string, zod_schema: T ) {
		mind.debug( "Prompt:", message );

		const functions = {
			structured_response: {
				description: 'Format your response as a function call',
				schema: zod_schema,
			}
		};

		const result = await this.invoke( message, functions, 'structured_response' );
		mind.debug( "Result:", result );
		return result.arguments;
	}
}

