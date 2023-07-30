import { trim_line_whitespace, zod_to_open_api } from './utils';
import { mind } from './logger';
import { GPT_Client } from "./GPT_Client";
import { z } from "zod";
import { AnyValue } from "./types";

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace( `You're a helpful AI Assistant` );

export class Zod_GPT {

	constructor( private readonly client: GPT_Client, system_message: string = DEFAULT_SYSTEM_MESSAGE ) {
		this.client.set_system_message( system_message );
	};

	/**
	 * Chat with the GPT and parse the response with Zod.
	 * @param message - GPT Instructions
	 * @param zod_schema - Response Format
	 */
	public async chat<T extends AnyValue>( message: string, zod_schema: z.ZodSchema<T> ) {
		mind.debug( "Prompt:", message );

		const structured_response = {
			name: 'structured_response',
			description: 'Format your response as a function call',
			parameters: zod_to_open_api( zod_schema ),
		}

		const result = await this.client.chat( message, {
			functions: [structured_response],
			function_call: {
				name: 'structured_response',
			},
		} );

		mind.debug( "Result:", result );
		try {

			if ( result.type === "function_call" ) {
				const json = JSON.parse( result.data.arguments );
				return zod_schema.parse( json );
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
}

