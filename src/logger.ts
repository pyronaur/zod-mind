import pc from 'picocolors';
import * as util from 'util';

export function inspect(...args: unknown[]) {

	return args.map(arg => {
		try {
			if (typeof arg === "string") {
				arg = JSON.parse(arg);
			}
			return util.inspect(arg, { depth: null, colors: true })
		} catch (error) {
			return arg;
		}
	});
}

function named_logger(level: string, name: string) {
	return function (main: string, ...args: unknown[]) {
		let message = pc.gray(`${name}(${level}):`);
		if (typeof args[0] === "string") {
			message += " " + pc.underline(pc.bold(main));
		}
		if (args.length > 0) {
			console.log('\n', message, '\n', ...inspect(...args), '\n');
		} else {
			console.log(message);
		}

	}
}

type LoggerLevels = 'debug' | 'info' | 'problem';

export function create_logger(name: string, levels: LoggerLevels[] = ['debug', 'info']) {
	const loggers: { [K in LoggerLevels]: ReturnType<typeof named_logger> } = {
		debug: named_logger('debug', pc.white(name)),
		info: named_logger('info', pc.white(name)),
		problem: named_logger('problem', pc.red(name)),
	};

	const logger: typeof loggers = {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		debug: levels.includes('debug') ? loggers.debug : () => { },
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		info: levels.includes('info') ? loggers.info : () => { },
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		problem: levels.includes('problem') ? loggers.problem : () => { },
	};

	return logger;
}

export const mind = create_logger('Zod Mind', ['debug', 'info']);