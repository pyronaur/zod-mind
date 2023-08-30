import { zodMind } from '../index';
import { z } from 'zod';
import { logthing } from 'logthing';

const app = logthing("App");

const client = zodMind({
	openai: { model: "gpt-3.5-turbo" },
	mind: { auto_healing: 2 }
});

const fictional_characters = z.object({
	customers: z.array(z.object({
		name: z.string(),
		info: z.array(z.object({
			// GPT is going to have a hard time understanding how a last name can be an email.
			last_name: z.string().email(),
			// GPT is probably going to try to provide a negative number here,
			// but `min` requires a number greater than 200.
			negative_value: z.number().min(200),
		}))
	}))
});

const functions = {
	fictional_chars: {
		description: "Generate a list of characters",
		schema: fictional_characters,
	},
}

async function fetchCustomers() {
	try {
		const characters = await client.invoke("3 fictional characters from popular sci-fi books as customers.", functions);
		app.info(`GPT is calling function "${characters.name}"`).info("With Arguments:", characters.arguments);
	} catch (error) {
		app.error(error);
	}
}

(async () => {
	await fetchCustomers();
})();
