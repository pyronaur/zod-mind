import { z } from 'zod';

export type JSONValue = string | number | boolean | null | JSONArray | JSONObject;
export type JSONArray = JSONValue[];
export type JSONObject = {
	[key: string]: JSONValue;
};


export interface LLM_Interface {
	set_system_message(message: string): void;
	chat(message: string): Promise<string>;
	incognito_chat(message: string, system?: string): Promise<string>;
}

export type LLM_Zod_Interface = {
	chat: <T extends JSONObject>(message: string, schema: z.ZodSchema<T>) => Promise<T>;
}

