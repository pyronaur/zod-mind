import { zodMind } from '../index';
import { z } from 'zod';
import { logthing } from 'logthing';

const app = logthing( "App" );

const client = zodMind();

function random_number_generator( min: number, max: number ) {
	return Math.floor(
		Math.random() * ( max - min ) + min
	)
}

const functions = {
	"random_number": {
		description: "Generate a random number between two numbers.",
		schema: z.object( {
			from: z.number(),
			to: z.number()
		} )
	},
	"random_quote": {
		description: "Generate a random quote.",
		schema: z.object( {
			quote: z.string()
		} )
	}
};


async function run() {
	const result = await client.invoke( "Random number between 1 and 42", functions );
	if ( result.name === "random_number" ) {
		const random_number = random_number_generator( result.arguments.from, result.arguments.to );
		app.debug( `GPT is calling function "${ result.name }"` )
			.debug( "With Arguments:", result.arguments )
			.info( `The random number is ${ random_number }` );
	} else {
		app.error( `GPT is calling function "${ result.name }"` ).error( "With Arguments:", result.arguments );
	}
}


( async () => {
	await run();
} )();
