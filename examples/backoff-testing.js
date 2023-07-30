import { zodMind } from '../index';
import { z } from 'zod';
import { logthing } from 'logthing';

const schema = z.object({
	customers: z.array(z.object({
		name: z.string(),
		email: z.string().email(),
		lifetime_spend: z.number().describe("Lifetime spend in USD"),
	})),
});


/**
 * @param {number} iteration
 */
async function fetchCustomers(iteration) {
	const client = zodMind();

	const app = logthing("Iteration " + iteration);
	try {
		app.debug("Fetching customers...");
		const result = await client.chat("3 fictional characters from popular sci-fi books as customers.", schema);
		app.debug(result);
		return result;
	} catch (error) {
		app.error(error);
	}
}


const promises = [
	fetchCustomers(1),
	fetchCustomers(2),
	fetchCustomers(3),
	fetchCustomers(4),
	fetchCustomers(5),
	fetchCustomers(6),
	fetchCustomers(7),
	fetchCustomers(8),
	fetchCustomers(9),
	fetchCustomers(10),
];

console.log("Waiting for all iterations to complete...");
await Promise.all(promises);
console.log("All iterations completed.");
