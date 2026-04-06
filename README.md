# openai-agents-prediction-markets

OpenAI function-calling tools for prediction market data. Works with Chat Completions API and OpenAI Agents SDK.

[![npm](https://img.shields.io/npm/v/openai-agents-prediction-markets)](https://www.npmjs.com/package/openai-agents-prediction-markets)

## Install
```bash
npm install openai-agents-prediction-markets
```

## Quick Start
```ts
import OpenAI from 'openai'
import { predictionMarketFunctions, handleFunctionCall } from 'openai-agents-prediction-markets'

const openai = new OpenAI()
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'What are the geopolitical risks?' }],
  tools: predictionMarketFunctions,
})

for (const call of response.choices[0].message.tool_calls || []) {
  const result = await handleFunctionCall(call.function.name, JSON.parse(call.function.arguments))
  // Feed result back to the model...
}
```

## Functions
| Function | Description |
|----------|-------------|
| `get_world_state` | Full prediction market world state |
| `get_uncertainty_index` | Four-signal uncertainty index |
| `get_market_edges` | Actionable mispricings |
| `get_market_detail` | Single market with orderbook |
| `get_world_changes` | Incremental changes |

## License
MIT — [SimpleFunctions](https://simplefunctions.dev)
