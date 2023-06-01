import { logthing } from 'logthing';


export const mind = logthing('Zod Mind', ['debug', 'info', 'problem'], true);
export const client = logthing('GPT Client', ['verbose', 'debug', 'info', 'problem'], true);
