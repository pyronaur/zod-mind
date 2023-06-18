import type { z } from 'zod';
import { Outcome } from './utils';

export type AnyValue = null | string | number | boolean | AnyArray | AnyObject;
export type AnyArray = AnyValue[];
export type AnyObject = {
	[key: string]: AnyValue;
};

export type Problem = {
	message: string;
	meta: AnyValue;
}

export interface LLM_Interface {
	set_system_message(message: string): void;
	chat(message: string): Promise<string>;
	incognito_chat(message: string, system?: string): Promise<string>;
}

export type LLM_Error =
	{ type: 'schema' }
	|
	{
		type: 'parse'
		value: string,
		error: unknown,
	};

export type LLM_Zod_Interface = {
	chat: <T extends AnyObject>(message: AnyValue, schema: z.ZodSchema<T>) => Promise<Outcome<T, LLM_Error>>;
}
