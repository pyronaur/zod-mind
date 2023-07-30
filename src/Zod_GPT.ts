import { trim_line_whitespace, zod_to_open_api } from './utils';
import { mind } from './logger';
import { GPT_Client } from "./GPT_Client";
import { z } from "zod";

const DEFAULT_SYSTEM_MESSAGE = trim_line_whitespace( `You're a helpful AI Assistant` );

type GPT_Function = {
	name: string,
	description: string,
	parameters: z.ZodObject<any>
}

type Function_Call<F extends GPT_Function[]> = F[number]['name'] | 'auto';

export class Zod_GPT {

	constructor( private readonly client: GPT_Client, system_message: string = DEFAULT_SYSTEM_MESSAGE ) {
		this.client.set_system_message( system_message );
	};


	public async chat( message: string ) {
		mind.debug( "Prompt:", message );
		const result = await this.client.chat( message );
		mind.debug( "Result:", result );
		return result;
	}

	public async invoke<Fn_List extends GPT_Function[], Fn_Name extends Function_Call<Fn_List>>( message: string, functions: Fn_List, function_call: Fn_Name ) {

		const additional_config = {
			functions: functions.map( fn => {
				return {
					name: fn.name,
					description: fn.description,
					parameters: zod_to_open_api( fn.parameters ),
				}
			} ),
			function_call: function_call === 'auto' ? ( 'auto' as 'auto' ) : {
				name: function_call,
			}
		}

		const result = await this.client.chat( message, additional_config );

		try {
			if ( result.type === "function_call" ) {
				const func_name = result.data.name as Fn_Name extends 'auto' ? Fn_List[number] : Fn_Name;
				const func = functions.find( fn => fn.name === func_name );
				if ( !func ) throw new Error( `Could not find function ${ func_name }` );

				const func_schema = func.parameters;
				if ( !func_schema ) throw new Error( `Could not find function ${ func_name }` );
				return {
					name: func_name,
					arguments: func_schema.parse( JSON.parse( result.data.arguments ) ),
				};
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
	public async structured_chat<T extends z.ZodObject<any>>( message: string, zod_schema: T ): Promise<z.infer<T>> {
		mind.debug( "Prompt:", message );

		const structured_response = {
			name: 'structured_response',
			description: 'Format your response as a function call',
			parameters: zod_schema,
		}
		const result = await this.invoke( message, [ structured_response ], 'structured_response' );
		mind.debug( "Result:", result );
		return result.arguments;
	}
}

