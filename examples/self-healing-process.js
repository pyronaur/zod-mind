import { zodMind } from 'zod-mind';
import { z } from 'zod';

const options = {
	type: "self-healing",
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
	})).min(5),
});

async function fetchCustomers() {
	try {
		const result = await client.chat("10 sci-fi characters and their favorite color and food. Include currency symbols with amounts.", schema);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

(async () => {
	console.log(await fetchCustomers());
})();