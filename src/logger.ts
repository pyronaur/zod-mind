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
	return function (content: string, ...args: unknown[]) {
		const whoami = `${name}(${level}):`;
		if (args.length > 0) {
			console.log(`\n${whoami} ${content}\n`, ...inspect(...args));
		} else {
			console.log(`${whoami} ${content}`, ...args);
		}

	}
}

type LoggerLevels = 'debug' | 'info' | 'problem';

export function create_logger(name: string, levels: LoggerLevels[] = ['debug', 'info']) {
	const loggers: { [K in LoggerLevels]: ReturnType<typeof named_logger> } = {
		debug: named_logger('debug', name),
		info: named_logger('info', name),
		problem: named_logger('problem', name),
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
