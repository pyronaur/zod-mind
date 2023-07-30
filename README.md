# 🧠 Zod Mind

**OpenAI Function library with Zod and TypeScript type safety.** Built to
facilitate interactions with the OpenAI API in a type-safe manner. This package
includes a variety of tools for communicating with the OpenAI API using
type-safe requests and responses.

## 🚀 Getting Started

### Installation

To install the package, run the following command in your terminal:

```bash
npm install zod-mind
```

### Usage

`zodMind()` is the primary function for interacting with the Zod Mind library,
which provides a structured interface to the OpenAI API.

```typescript
// Step 1: Create a Zod Mind instance
const client = zodMind( {
	openai: {
		model: "gpt-3.5-turbo",
		temperature: 0.5,
	},
	// Replace this with your actual API key
	api_key: "sk-WUBbaLuBbAdUBDUBmEanSIAMInGREaTPAInp1she1PME",
} );

// Step 2: Send a message to OpenAI
async function fetchAnswer() {
	try {
		const prompt = "What is the meaning of life?";
		const result = await client.chat( prompt );
		console.log( result );
	} catch ( error ) {
		console.error( error );
	}
}
```

You can provide [OpenAI's API options](https://www.npmjs.com/package/opena)
using the `openai` of the `zodMind()` function.

Remember to replace `'sk-WUBbaLuBbAdUBDUBmEanSIAMInGREaTPAInp1she1PME'` with
your actual API key. Never expose this key publicly. It is generally recommended
to store it in an environment variable or a secure secret storage.

**Environment Variable**
Zod Mind is going to attempt to read `OPENAI_API_KEY` from your environment if no key is provided to the `zodMind()` function.

## Structured Chat

Structured chat refers to an organized and formatted way of communicating with
the AI with a predefined schema to guide AI's responses. It allows you to use a chat interface that
handles both the instruction and the desired response format.

The `structured_chat` method takes two parameters:

1. `message`: A string that serves as the instruction to the AI.
2. `zod_schema`: A Zod schema that defines the format of the AI's response.

Note: The schema should always be at the very least a Zod Object, like so:

```typescript
const results = await client.structured_chat( "What is the meaning of life?", z.object( {
	answer: z.string()
} ) );
```

The method returns a structured response from the AI that matches the given Zod
schema or it will throw a validation error.

## Invoke Functions

The `invoke` method allows the AI to call a function from a predefined list of
functions based on a given message.

The `invoke` method takes three parameters:

1. `message`: A string that serves as the instruction to the AI.
2. `functions`: An object mapping function names to GPT_Function definitions.
3. `function_call`: An optional parameter that specifies which function to call.
   If it's not provided, the AI will decide which function to call based on the
   message.

```typescript
const functions = {
	"random_number": {
		description: "Generate a random number between two numbers.",
		schema: z.object( {
			from: z.number(),
			to: z.number()
		} )
	},
	"random_quote": {
		description: "Generate a random quote.",
		schema: z.object( {
			quote: z.string()
		} )
	}
};
const result = await client.invoke( "Random number between 1 and 42", functions );
if ( result.name === "random_number" ) {
	const random_number = random_number_generator( result.arguments.from, result.arguments.to );
	app.debug( `GPT is calling function "${ result.name }"` )
		.debug( "With Arguments:", result.arguments )
		.info( `The random number is ${ random_number }` );
} else {
	app.error( `GPT is calling function "${ result.name }"` ).error( "With Arguments:", result.arguments );
}
```

The `invoke` method returns an object that includes the name of the function
called and its arguments, formatted according to the appropriate Zod schema.

**Force Function Call**
If you want to force the AI to call a specific function, you can do so by passing the third argument to the `invoke` method:

```typescript
const result = await client.invoke( "Random number between 1 and 42", functions, "random_number" );
```

#### Simple Chat

Even though this library is designed with type-safety in mind, you can just call
simple `chat` methods without type safety if you need to.

```typescript
const result = await client.chat( "What is the answer to life?" );
```

#### System Message
If you want to customize the system message, you can do so using the `set_system_message()`
method:

```typescript
client.set_system_message( "This is a custom system message." );
```
