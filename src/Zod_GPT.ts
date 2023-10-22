import { zod_to_open_api } from './utils';
import { mind } from './logger';
import { GPT_Client } from "./GPT_Client";
import { z } from "zod";
import dirty_json from 'dirty-json';

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

export type Zod_GPT_Config = {
	auto_healing: number,
	system_message: string,
	on?: {
		healing?: (attempt: number, gpt: Zod_GPT, the_plan: string) => void,
	}
}


/**
 * This function traverses the response data along the provided path.
 * If it encounters a null or non-object value, it returns undefined.
 * Otherwise, it returns the value at the end of the path.
 *
 * @param {any} response_data - The data to traverse.
 * @param {(string | number)[]} path - The path to traverse.
 * @return {unknown} - The value at the end of the path, or undefined.
 */
function error_value(response_data: any, path: (string | number)[]): unknown {
	let value: any = response_data;
	for (const key of path) {
		if (value === null || typeof value !== 'object') {
			return undefined;
		}
		value = value[key];
	}
	return value;
}



/**
 * This function constructs a string representation of the path to an error.
 * It iterates over the path array and concatenates each segment to the result string.
 * If the segment is a number, it is treated as an array index and is enclosed in square brackets.
 * If the segment is a string, it is treated as an object key.
 * The segments are separated by dots, except for the first segment.
 *
 * @param {(string | number)[]} path - The path to the error.
 * @return {string} - The string representation of the path.
 */
function error_path(path: (string | number)[]) {
	let result = '';
	path.forEach((segment, index) => {
		if (typeof segment === 'number') {
			result += `[${segment}]`;
		} else {
			result += index === 0 ? segment : `.${segment}`;
		}
	});
	return result;
}


export class Zod_GPT {

	private healing_attempt = 0;

	constructor (public readonly client: GPT_Client, private config: Zod_GPT_Config) {
		this.client.set_system_message(this.config.system_message);
	};

	public set_healing(healing: number) {
		this.config.auto_healing = healing;
	}

	/**
	 * Simple chat interface without structured data or function calls.
	 * @param message
	 */
	public async chat(message: string) {
		mind.debug("Prompt:", message);
		const result = await this.client.chat(message);
		mind.debug("Result:", result);
		return result;
	}

	/**
	 * Let GPT Invoke a function from a list of functions based on the given message.
	 *
	 * @param message
	 * @param functions
	 * @param function_call
	 */
	public async invoke<T extends Record<string, GPT_Function>, K extends keyof T>(message: string, functions: T, function_call?: K): Promise<GPT_Return_Function<T, K>> {
		const additional_config = {
			functions: Object.entries(functions).map(([name, fn]) => {
				return {
					name: name,
					description: fn.description,
					parameters: zod_to_open_api(fn.schema),
				}
			}),
			function_call: (!function_call) ? 'auto' as 'auto' : {
				name: function_call as string,
			}
		}

		const result = await this.client.chat(message, additional_config);

		try {
			
			if (result.type === "function_call") {
				const func_name = result.data.name;
				if (!(func_name in functions)) throw new Error(`Could not find function ${func_name}`);

				const func = functions[func_name];
				const func_schema = func!.schema;


				const args = func_schema.parse(dirty_json.parse(result.data.arguments));
				// Reset the attempt counter on success.
				this.healing_attempt = 0;

				return {
					name: func_name,
					arguments: args,
				} as GPT_Return_Function<T, K>;

			} else {
				throw new Error("Expected a function call response, but got a message.");
			}


		} catch (e) {

			/**
			 * Attempt to recover from Zod Errors.
			 */
			if (this.config.auto_healing > 0 && e instanceof z.ZodError && ++this.healing_attempt <= this.config.auto_healing) {
				const errors = e.flatten((issue) => {
					const value = error_value(result, issue.path);
					const path = error_path(issue.path);
					return {
						incorrect_value_location: path,
						incorrect_value_received: value,
						validation_error: issue.message,
					};
				});

				let prompt = `Fatal error!`;
				prompt += `\nAnalyze each "validation_error" in the error details provided. Make sure to identify the type of data that should be in the field according to the "validation_error" message, regardless of the field name.`
				prompt += "\nError Details:"
				prompt += `\n${JSON.stringify(errors, null, 2)}`;
				prompt += "\nFormat your response as follows"
				prompt += `\n## Description\nDescribe the errors.`;
				prompt += `\n## Inconsistency\nDescribe discrepancies between the schema and validation if any.`;
				prompt += `\n## Valid Examples\nProvide at least 2 example values that would pass the validation error.`;
				prompt += `\n## Plan\nHow to fix the validation errors in the next run?`;
				
				// Let GPT think this through first
				const the_plan = await this.chat(prompt);

				if( this.config.on?.healing ) {
					this.config.on.healing( this.healing_attempt, this , the_plan.data as string );
				}



				// Then ask it to attempt invoking the function again.
				return await this.invoke("Try again using corrected values.", functions, function_call);
			}

			mind.problem("Zod_LLM failed to parse LLM Response JSON.", {
				type: 'parse',
				value: result,
				error: e,
			});

			// Reset the attempt counter when failed to recover from error.
			this.healing_attempt = 0;
			throw e;
		}
	}

	/**
	 * Chat with the GPT and parse the response with Zod.
	 * @param message - GPT Instructions
	 * @param zod_schema - Response Format
	 */
	public async structured_chat<T extends z.ZodObject<any>>(message: string, zod_schema: T) {
		mind.debug("Prompt:", message);

		const functions = {
			structured_response: {
				description: 'Format your response as a function call',
				schema: zod_schema,
			}
		};

		const result = await this.invoke(message, functions, 'structured_response');
		mind.debug("Result:", result);
		return result.arguments;
	}
}

