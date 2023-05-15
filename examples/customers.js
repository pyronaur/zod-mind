import { zodMind } from 'zod-mind';
import { z } from 'zod';

const options = {
	type: "self-healing",
	openai: {
		model: "gpt-3.5-turbo",
		max_tokens: 60,
		temperature: 0.5,
	}
}

const client = zodMind(options);
const schema = z.object({
	customers: z.array(z.object({
		name: z.string(),
		email: z.string().email(),
	})),
});

async function fetchCustomers() {
	try {
		const result = await client.chat("Give me a list of imaginary customers.", schema);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

(async () => {
	console.log(await fetchCustomers());
})();