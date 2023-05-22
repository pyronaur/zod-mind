import { zodMind } from 'zod-mind';
import { z } from 'zod';

const options = {
	type: "normal",
	openai: {
		model: "gpt-3.5-turbo",
		temperature: 0,
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
		const result = await client.chat("10 fictional characters from popular sci-fi books as customers.", schema);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

(async () => {
	console.log(await fetchCustomers());
})();