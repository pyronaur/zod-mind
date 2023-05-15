# 📦 Package Overview

This package provides a set of tools for interacting with the OpenAI API, including error handling and JSON schema validation.

# 🚀 Getting Started

## Installation

To install the package, run:

```
npm install zod-mind
```

## Setup and Configuration

To configure the package, import the necessary components and initialize them with the required parameters.

# 🌐 GPT_Client
### `zodMind(options: Zod_Mind_Options)`

The `zodMind` factory function allows for easy setup of OpenAI with Zod. It returns either a "self-healing" or "normal" instance based on the `type` field of the options argument. This instance can then be used to communicate with the OpenAI GPT-3.5-turbo model.

`Open_AI_Options` is a type alias that omits the "messages" field from the CreateChatCompletionRequest type from the 'openai' library:

`Zod_Mind_Options` is an object type that contains the following properties:

- `type`: A string that can either be "self-healing" or "normal". This determines the type of the client that should be created.
- `openai`: An object that conforms to `Open_AI_Options`. This object is used to configure the underlying OpenAI GPT-3.5-turbo model instance.



#### Example

In the example below, a "self-healing" client is created using the `zodMind` function. The client is then used to generate a list of imaginary customers from the GPT-3.5-turbo model. The response from the model is validated against a Zod schema to ensure the data is in the expected format.

```typescript
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

fetchCustomers();
```

This example shows how you can use the `zodMind` function to create a client, make a request to the GPT-3.5-turbo model, and validate the response using a Zod schema. The "self-healing" client automatically attempts to recover from any errors in the response from the model, helping to ensure that the data you receive is always in the expected format.


## 📁 Directory Structure

The main components of the package are organized as follows:

- `types.ts`: Defines types and interfaces used in the package.
- `gpt-client.ts`: Implements the GPT client for interacting with the OpenAI GPT API.
- `utils.ts`: Contains utility functions.
- `zod-llm.ts`: Implements the Zod Low Level Model (LLM).
- `zod-healing-llm.ts`: Implements a healing LLM that can recover from errors.
- `zod-llm-error.ts`: Defines a specific error type for Zod LLM.

## `Zod_LLM` (normal)

To create a "normal" client, use the `Zod_LLM` or `zodMind` factory function with type set to `normal`.

The `Zod_LLM` class is an implementation of `LLM_Zod_Interface` that provides a chat interface for communicating with the OpenAI in a type-safe manner using Zod. It uses a provided instance of a class implementing `LLM_Interface` to send messages to the model.

### Constructor

The constructor accepts two arguments:

- `client`: An instance of a class implementing `LLM_Interface`. This is the underlying client that is used to send messages to the model.
- `system_message`: An optional system message that is sent before the user's message to guide the model's behavior. If not provided, a default message is used.

### Methods

#### `chat<T extends JSONObject>(message: string, response_format: z.ZodSchema<T>): Promise<T>`

This method sends a message to the model and receives a response, ensuring that the response matches the provided Zod schema. If the response from the model doesn't match the schema, it throws a `Zod_GPT_Error`.

## `Zod_Healing_LLM` (self-healing)

To create a "self-healing" client, use the `Zod_Healing_LLM` or `zodMind` factory function with type set to `self-healing`.


The `Zod_Healing_LLM` class is an extension of `Zod_LLM` that attempts to recover from errors when the response from the model doesn't match the provided Zod schema. 

### Constructor

The constructor accepts two arguments:

- `client`: An instance of a class implementing `LLM_Interface`. This is the underlying client that is used to send messages to the model.
- `system_message`: An optional system message that is sent before the user's message to guide the model's behavior. If not provided, a default message is used.

### Methods

#### `chat<T extends JSONObject>(message: string, response_schema: z.ZodSchema<T>): Promise<T>`

This method sends a message to the model and receives a response, ensuring that the response matches the provided Zod schema. If the response from the model doesn't match the schema, it attempts to correct the error and parse the response again. If the error can't be corrected, it throws a `Zod_GPT_Error`.

## `GPT_Client`

The `GPT_Client` class is an implementation of `LLM_Interface` that provides a chat interface for communicating with the OpenAI GPT-3.5-turbo model.

### Constructor

The constructor accepts a `GPT_Config` object that is used to configure the underlying GPT model.

### Methods

#### `set_system_message(message: string): void`

This method sets the system message that is sent before the user's message to guide the model's behavior.

#### `chat(message: string): Promise<string>`

This method sends a message to the model and receives a response.

#### `incognito_chat(message: string, system?: string): Promise<string>`

This method sends a message to the model and receives a response without affecting the current conversation history. An optional system message can be provided to guide the model's behavior. If not provided, the current system message is used.
