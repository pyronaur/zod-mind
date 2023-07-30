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

async function fetchCustomers() {
	try {
		const characters = await client.structured_chat( "3 fictional characters from popular sci-fi books as customers.", fictional_characters );
		app.info( characters );

		const hats = await client.structured_chat( "What are their favorite hats?", favorite_hats );
		app.info( hats );
	} catch ( error ) {
		app.error( error );
	}
}

( async () => {
	await fetchCustomers();
} )();
