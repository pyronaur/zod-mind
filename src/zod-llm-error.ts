import type { z } from 'zod';

export class Zod_GPT_Error extends Error {
	constructor (message: string, public readonly result: string, public readonly error: z.ZodError) {
		super(message);
		/**
		 * This makes `foo instanceof ApiError` work.
		 * To make instanceof work correctly
		 * set the prototype explicitly.
		 *
		 * @see https://stackoverflow.com/a/41102306/1015046
		 */
		Object.setPrototypeOf(this, Zod_GPT_Error.prototype);
	}
}