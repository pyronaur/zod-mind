# 🧠 Zod Mind

TypeScript-first AI chat interface library with OpenAI interface.

This package provides a set of tools for interacting with the OpenAI API using type-safe requests and responses.

## 🚀 Getting Started

### Install

To install the package, run:

```
npm install zod-mind
```

### Usage

1. Create a Zod Mind instance
2. Send a message to OpenAI with your message

```typescript
// 1. Create a Zod Mind instance
const client = new GPT_Client({
	model: "gpt-3.5-turbo",
	temperature: 0.5,
});

// 2. Send a message to OpenAI
async function fetchAnswer() {
	try {
		const prompt = "What is the meaning of life?";
		const result = await client.chat(prompt);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}
```
The `GPT_Client` class allows for easy setup of OpenAI.

Options:

- `model`: Choose the model to use. Can be either 'gpt-3.5-turbo' or 'gpt-4'.
- `max_tokens`, `temperature`: Configure how the AI generates responses.
- See [OpenAI's API documentation](https://www.npmjs.com/package/openai) for more available options.


## 📖 Documentation

### Default Interface: `GPT_Client`

This is a client for interacting with the OpenAI API.

The `GPT_Client` class accepts an `api_key` as the second parameter to the constructor if the `OPENAI_API_KEY` environment variable is not set. This `api_key` is the secret key you receive from OpenAI when you sign up for API access.

```typescript
const client = new GPT_Client({
	model: "gpt-3.5-turbo",
	max_tokens: 900,
	temperature: 0.5,
}, 'sk-WUBbaLuBbAdUBDUBmEanSIAMInGREaTPAInp1she1PME');
```

Please replace `'sk-WUBbaLuBbAdUBDUBmEanSIAMInGREaTPAInp1she1PME'` with your actual API key. Do not expose this key publicly. It's usually a good idea to keep it in an environment variable or some form of secure secret storage.

##### Typical interaction

Typically, you'll use `client.chat()` to send and receive messages to the OpenAPI:

```typescript
const result = await client.chat("What is the answer to life?");
```

##### System Message
By default, ZodMind comes with a built-in system message. If you'd like to modify the system message, you can do so by using the `set_system_message()` method:

```typescript
client.set_system_message("This is a custom system message.");
```

## 📁 Directory Structure

The main components of the package are organized as follows:

- `types.ts`: Defines types and interfaces used in the package.
- `GPT_Client.ts`: Implements the GPT client for interacting with the OpenAI GPT API.
- `utils.ts`: Contains utility functions.
