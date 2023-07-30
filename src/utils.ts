import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';
import { AnyObject } from "./types";

export function zod_to_open_api<T>( schema: z.Schema<T> ) {
	return zodToJsonSchema( schema, {
		$refStrategy: "none",
		definitionPath: "schema",
		target: "openApi3"
	} ) as AnyObject;
}

export function trim_line_whitespace( content: string ): string {
	return content
		.split( "\n" )
		.map( line => line.trim() )
		.join( "\n" );
}

interface Success<T> {
	status: 'success';
	value: T;
}

interface Problem<TProblem> {
	status: 'problem';
	message: string;
	error: TProblem;
}

export type Outcome<T, TProblem = unknown> = Success<T> | Problem<TProblem>;

export function success<T>( value: T ): Success<T> {
	return { status: 'success', value };
}

export function problem<TProblem>( message: string, error: TProblem, log?: unknown ): Problem<TProblem> {
	if ( log ) {
		console.error( log );
	}
	return { status: 'problem', message, error };
}
