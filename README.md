# openai-agents-prediction-markets

[![npm](https://img.shields.io/npm/v/openai-agents-prediction-markets)](https://www.npmjs.com/package/openai-agents-prediction-markets)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

OpenAI function-calling tools for **real-time prediction market data**. Drop-in
function definitions + dispatcher for the Chat Completions API and the OpenAI
Agents SDK. World awareness from the active Kalshi and Polymarket market universe —
no auth required.

```ts
import OpenAI from 'openai'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const openai = new OpenAI()
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: "What's the highest-conviction trade idea right now?" }],
  tools: predictionMarketFunctions,
})

for (const call of response.choices[0].message.tool_calls ?? []) {
  const result = await handleFunctionCall(call.function.name, JSON.parse(call.function.arguments))
  console.log(`${call.function.name} →`, result.slice(0, 200))
}
```

---

## Install

```bash
npm install openai-agents-prediction-markets openai
```

Zero runtime dependencies. Works with the OpenAI Node SDK and any
OpenAI-compatible chat completions endpoint (Anthropic via OpenAI SDK,
Ollama, vLLM, OpenRouter, Together).

## Functions

All six functions hit the public SimpleFunctions API. **No API key, no rate limit,
no auth.** Every endpoint below is verified live.

| Function | Endpoint | When to use |
|----------|----------|-------------|
| `get_context` | `/api/public/context` | **Start here.** Single bundle: edges, movers, highlights, traditional-market context. |
| `get_world_state` | `/api/agent/world` | ~800-token compressed snapshot of all markets, ideal for system-prompt injection. |
| `get_world_changes` | `/api/agent/world/delta` | ~30-50 token incremental delta — cheap polling loops. |
| `get_market_edges` | `/api/edges` | Raw mispricings (thesis price vs market price) with reasoning. |
| `get_uncertainty_index` | `/api/public/index` | Single numeric pulse: uncertainty, geopolitical risk, momentum, activity. |
| `get_ideas` | `/api/public/ideas` | LLM-generated trade ideas with conviction, catalyst, time horizon. |

## Full agent loop with Chat Completions

```ts
import OpenAI from 'openai'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const openai = new OpenAI()

async function runAgent(userMessage: string) {
  const messages: any[] = [
    {
      role: 'system',
      content:
        'You are a market intelligence assistant. Use the tools to ground every claim in real-time prediction-market data. Cite tickers explicitly.',
    },
    { role: 'user', content: userMessage },
  ]

  for (let step = 0; step < 5; step++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: predictionMarketFunctions,
    })
    const msg = response.choices[0].message
    messages.push(msg)

    if (!msg.tool_calls?.length) return msg.content

    for (const call of msg.tool_calls) {
      const result = await handleFunctionCall(call.function.name, JSON.parse(call.function.arguments))
      messages.push({ role: 'tool', tool_call_id: call.id, content: result })
    }
  }
}

console.log(await runAgent("What changed in markets in the last 6 hours?"))
```

## With the OpenAI Agents SDK

```ts
import { Agent } from '@openai/agents'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const agent = new Agent({
  name: 'market-intel',
  instructions: 'Use the prediction-market tools to ground every claim in real-time data.',
  tools: predictionMarketFunctions.map((fn) => ({
    type: 'function' as const,
    name: fn.function.name,
    description: fn.function.description,
    parameters: fn.function.parameters,
    handler: async (args: Record<string, unknown>) => handleFunctionCall(fn.function.name, args),
  })),
})

const result = await agent.run('What are the open edges right now?')
console.log(result.finalOutput)
```

## Direct invocation (no agent)

```ts
import { handleFunctionCall } from 'openai-agents-prediction-markets'

const idx = JSON.parse(await handleFunctionCall('get_uncertainty_index'))
console.log(`Uncertainty: ${idx.uncertainty}/100`)

const { ideas } = JSON.parse(await handleFunctionCall('get_ideas'))
console.log(`Top idea: ${ideas[0].headline}`)
```

## Response shapes

`handleFunctionCall` always returns a **string** ready to feed back into the model
as a tool message. JSON tools return `JSON.stringify(...)`; markdown tools
(`get_world_state`, `get_world_changes`) return raw markdown.

### `get_context`
```ts
{
  edges: Edge[]
  movers: Mover[]
  highlights: Highlight[]
  traditionalMarkets: { [topic: string]: TraditionalMarket[] }
}
```

### `get_uncertainty_index`
```ts
{
  uncertainty: number    // 0-100
  geopolitical: number   // 0-100
  momentum: number       // -1 to +1
  activity: number       // 0-100
  components: { medianSpread: number; avgSpread: number; ... }
  timestamp: string
}
```

### `get_market_edges`
```ts
{
  edges: {
    ticker: string
    venue: 'kalshi' | 'polymarket'
    title: string
    marketPrice: number
    thesisPrice: number
    executableEdge: number
    confidence: number
    liquidityScore: 'high' | 'medium' | 'low'
    direction: 'yes' | 'no'
    reasoning: string
  }[]
}
```

### `get_ideas`
```ts
{
  generatedAt: string
  cached: boolean
  ideas: {
    headline: string
    pitch: string
    conviction: 'high' | 'medium' | 'low'
    direction: 'buy_yes' | 'buy_no'
    markets: { url: string; ticker: string; currentPrice: number; venue: string }[]
    catalyst: string
    timeHorizon: string
    risk: string
  }[]
}
```

## Errors

`handleFunctionCall` throws `Error("SimpleFunctions API error <status> for <path>")`
on non-2xx responses, and `Error("Unknown SimpleFunctions tool: <name>")` for
unknown tool names. Wrap your dispatch loop in try/catch and return the error
message as the tool response so the model can recover.

## Sister packages

If you're not using the OpenAI SDK, use the wrapper for your stack:

| Stack | Package |
|-------|---------|
| Vercel AI SDK | [`vercel-ai-prediction-markets`](https://github.com/spfunctions/vercel-ai-prediction-markets) |
| LangChain / LangGraph | [`langchain-prediction-markets`](https://github.com/spfunctions/langchain-prediction-markets) |
| CrewAI (Python) | [`crewai-prediction-markets`](https://github.com/spfunctions/crewai-prediction-markets) |
| MCP / Claude / Cursor | [`simplefunctions-cli`](https://github.com/spfunctions/simplefunctions-cli) |
| Bare Python SDK | [`simplefunctions-python`](https://github.com/spfunctions/simplefunctions-python) |

## Testing

```bash
npm test
```

13 tests, all `fetch`-mocked — no network required.

## License

MIT — built by [SimpleFunctions](https://simplefunctions.dev).
