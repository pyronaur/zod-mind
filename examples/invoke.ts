import { zodMind } from '../index';
import { z } from 'zod';
import { logthing } from 'logthing';

const app = logthing( "App" );

const client = zodMind();
const fictional_characters = z.object( {
	customers: z.array( z.object( {
		name: z.string(),
		email: z.string().email(),
		lifetime_spend: z.number().describe( "Lifetime spend in USD" ),
	} ) ).nonempty(),
} );

const favorite_hats = z.object( {
	event_name: z.string().describe( "Which event are the characters attending?" ),
	customer_hats: z.array(
		z.object( {
			name: z.string(),
			hat: z.string(),
		} )
	)
} )

const functions = {
	fictional_chars: {
		description: "Generate a list of characters",
		schema: fictional_characters,
	},
	favorite_hats: {
		description: "Generate a list of favorite hats",
		schema: favorite_hats,
	},
}

async function fetchCustomers() {
	try {
		const characters = await client.invoke( "3 fictional characters from popular sci-fi books as customers.", functions );
		app.info( `GPT is calling function "${ characters.name }"` ).info( "With Arguments:", characters.arguments );

		const hats = await client.invoke( "What are their favorite hats?", functions );
		app.info( `GPT is calling function "${ hats.name }"` ).info( "With Arguments:", hats.arguments );

		const hats_for_sure = await client.invoke( "What are their favorite hats?", functions, 'favorite_hats' );
		app.info( `I forced GPT to call "favorite_hats"` )
			// Notice that because we forced which function to call, we don't need to check the arguments.
			.info( "These are the hats:", hats_for_sure.arguments.customer_hats );
	} catch ( error ) {
		app.error( error );
	}
}

( async () => {
	await fetchCustomers();
} )();
