import { zodMind } from '../index';
import { logthing } from 'logthing';

const app = logthing( "App" );
const mind = zodMind();

async function run() {
	mind.client.buffer(true);
	mind.chat("I'm going to tell you something, and you'll reply with 789.");
	mind.client.set_agent_message("Seven Ate Nine");
	mind.client.buffer(false);
	app.log( await mind.chat("Can you repeat what you previously said? Then repeat it in reverse.") );
}


( async () => {
	await run();
} )();
