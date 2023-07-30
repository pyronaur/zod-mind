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
