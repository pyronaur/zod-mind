# 🧠 Zod Mind

TypeScript-first schema validated AI chat interface library.

This package provides a set of tools for interacting with the OpenAI API using type-safe schemas validated by [Zod](https://zod.dev).

## 🚀 Getting Started

### Install

To install the package, run:

```
npm install zod-mind
```

### Usage

1. Define a schema for the expected response
2. Create a Zod Mind instance
3. Call Open API with your message and schema

```typescript
// 1. Define a schema for the expected response
const schema = z.object({
	customers: z.array(z.object({
		name: z.string(),
		email: z.string().email(),
	})),
});

// 2. Create a Zod Mind instance
const client = zodMind({
	type: "self-healing",
	openai: {
		model: "gpt-3.5-turbo",
		max_tokens: 60,
		temperature: 0.5,
	}
});

// 3. Call Open API with your message and schema
async function fetchCustomers() {
	try {
		const prompt = "10 fictional characters from popular sci-fi books."
		const result = await client.chat(prompt, schema);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}
```


## 📖 Documentation

### `zodMind(options: Zod_Mind_Options)`

The `zodMind` factory function allows for easy setup of OpenAI with Zod.

It returns either a "self-healing" or "normal" instance based on the `type` field of the options argument. This instance can then be used to communicate with OpenAI.

Options:

- `type`: A string that can either be "self-healing" or "normal". This determines the type of the client that should be created.
- `openai`: An object that conforms to `Open_AI_Options`. This object is used to configure the underlying Open AI instance. See [Open AI documentation](https://www.npmjs.com/package/openai) for more available options. This object is passed directly to the underlying Open AI instance.


```typescript
const client = zodMind({
	type: "self-healing",
	openai: {
		model: "gpt-3.5-turbo",
		max_tokens: 600,
		temperature: 0.5,
	}
});
```


### `Zod_LLM` and `Zod_Healing_LLM`

Both of these classes are responsible for a type-safe chat-like interface with the OpenAI API. They implement `LLM_Zod_Interface` that and use Zod schemas to validate the responses from the model.

`Zod_Healing_LLM` will take it a step further and in case an error is thrown, it will try to recover from it by sending another message to the model to attempt to automatically fix the error.

#### Constructor

The constructor accepts two arguments:

- `client`: An instance of a class implementing `LLM_Interface`. This is the underlying client that is used to send messages to the model. 
- `system_message`: An optional system message that is sent before the user's message to guide the model's behavior. If not provided, a default message is used.

#### Methods

##### `chat<T>(message: string, response_format: z.ZodSchema<T>): Promise<T>`

This method sends a message to the model and receives a response, ensuring that the response matches the provided Zod schema. If the response from the model doesn't match the schema, it throws a `Zod_GPT_Error`.


### Default LLM Interface: `GPT_Client`

This is a wrapper for the [OpenAI package](https://www.npmjs.com/package/openai) package. It implements `LLM_Interface` and can be used directly if you don't need the type-safe interface provided by `Zod_LLM` and `Zod_Healing_LLM`.

```typescript
const client = new GPT_Client({
	model: "gpt-3.5-turbo",
	max_tokens: 600,
	temperature: 0.5,
});
```

##### Typical interaction

Typically, you'll use `client.chat()` to send and receive messages to the OpenAPI:

```typescript
const result = await client.chat("What is the answer to life?");
```

##### System Message
By default, ZodMind comes with a built-in system message that enables schema-like communication between ZodMind and the GPT Client. If you'd like to modify the system message, you can do so by passing a `system_message` option to the `GPT_Client` constructor or directly set it on the client instance if you want to change it on the fly:

```typescript
client.set_system_message("This is a custom system message.");
```

##### Temporary interaction
If you want to interact with the model without affecting the current conversation history, you can use the `incognito_chat` method. This method accepts an optional `system` argument that can be used to guide the model's behavior. If not provided, the default system message is used.

```typescript
const result = await client.incognito_chat("This is a message.", "This is a system message.");
```

### Custom Models

If you want to use this package with a different LLM, you'll have to build your own class that subscribes to the `LLM_Interface` interface. You can then pass an instance of this class to the `zodMind` factory function.

```typescript
const llm = new MyCustomLLM(); // a class that implements LLM_Interface
const client = new Zod_Healing_LLM(llm);
client.chat("What is the custom LLM answer to life?");
```

## 📁 Directory Structure

The main components of the package are organized as follows:

- `types.ts`: Defines types and interfaces used in the package.
- `gpt-client.ts`: Implements the GPT client for interacting with the OpenAI GPT API.
- `utils.ts`: Contains utility functions.
- `zod-llm.ts`: Implements the Zod Low Level Model (LLM).
- `zod-healing-llm.ts`: Implements a healing LLM that can recover from errors.
- `zod-llm-error.ts`: Defines a specific error type for Zod LLM.

