import { z } from 'zod';

export type AnyValue = string | number | boolean | AnyArray | AnyObject;
export type AnyArray = AnyValue[];
export type AnyObject = {
	[key: string]: AnyValue;
};


export interface LLM_Interface {
	set_system_message(message: string): void;
	chat(message: string): Promise<string>;
	incognito_chat(message: string, system?: string): Promise<string>;
}

export type LLM_Zod_Interface = {
	chat: <T extends AnyObject>(message: string, schema: z.ZodSchema<T>) => Promise<T>;
}

