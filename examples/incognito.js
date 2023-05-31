import { GPT_Client } from 'zod-mind';

const client = new GPT_Client({});
const result = await client.incognito_chat("3 fictional characters from popular sci-fi books.");
console.log(result);