import {
	problem,
	success,
	trim_line_whitespace,
	zod_to_open_api
} from './utils';
import { mind } from './logger';
import { GPT_Client } from "./GPT_Client";
import { z } from "zod";
import { AnyValue } from "./types";

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace( `You're a helpful AI Assistant` );

export class Zod_GPT {

	constructor( private readonly client: GPT_Client, system_message: string = DEFAULT_SYSTEM_MESSAGE ) {
		this.client.set_system_message( system_message );
	};

	public async chat<T extends AnyValue>( message: string, zod_schema: z.ZodSchema<T> ) {
		mind.debug( "Prompt:", message );
		const result = await this.client.chat( message, {
			functions: [
				{
					name: 'structured_response',
					description: 'Deliver the response in a formatted function',
					parameters: zod_to_open_api( zod_schema ),
				}
			],
			function_call: {
				name: 'structured_response',
			},
		} );

		mind.debug( "Result:", result );
		try {
			if ( result.type === "message" ) {
				return success( result.data );
			}
			if ( result.type === "function_call" ) {
				const json = JSON.parse( result.data.arguments );
				const parsed = zod_schema.parse( json );
				return success( {
					function: result.data.name,
					data: parsed,
				} );
			}


		} catch ( e ) {
			return problem( "Zod_LLM failed to parse LLM Response JSON.", {
				type: 'parse',
				value: result,
				error: e,
			}, e );
		}


	}
}

