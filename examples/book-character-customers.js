import { zodMind } from 'zod-mind';
import { z } from 'zod';
import { logthing } from 'logthing';

const app = logthing("App");

const options = {
	type: "normal",
	openai: {
		model: "gpt-4",
		temperature: 0.77,
	}
}

const client = zodMind(options);
const schema = z.object({
	customers: z.array(z.object({
		name: z.string(),
		email: z.string().email(),
		lifetime_spend: z.number().positive().describe("Lifetime spend in USD"),
	})),
});

async function fetchCustomers() {
	try {
		const result = await client.chat("3 fictional characters from popular sci-fi books as customers.", schema);
		app.log(result);
		return result;
	} catch (error) {
		app.error(error);
	}
}

(async () => {
	app.log(await fetchCustomers());
})();