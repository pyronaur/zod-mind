import { Logthing } from 'logthing';

export const mind = new Logthing('Zod Mind', ['debug', 'info', 'problem']).get_interface();
