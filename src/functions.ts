export interface FunctionDef {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

const NO_PARAMS = { type: 'object', properties: {}, additionalProperties: false }

export const predictionMarketFunctions: FunctionDef[] = [
  {
    type: 'function',
    function: {
      name: 'get_context',
      description:
        "START HERE — single entry point that returns a global prediction-market snapshot bundle: top mispriced edges, 24h price movers, highlights, and traditional-market context. Read-only, no auth. Use this first when the user asks 'what's happening in markets right now'. Use the more specific functions only if the user wants one slice in isolation.",
      parameters: NO_PARAMS,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_world_state',
      description:
        "Get the calibrated world model: ~9,700 prediction markets distilled into ~800 tokens of real-money probabilities across geopolitics, economics, tech, and policy. Read-only, no auth. Use when you need a compact 'what the market believes right now' for system-prompt injection. Use get_world_changes for cheap polling, or get_context for the broader bundle.",
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          format: {
            type: 'string',
            enum: ['markdown', 'json'],
            description: "Output format. Default: 'markdown' (human/LLM-readable). Use 'json' for programmatic parsing.",
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_world_changes',
      description:
        'Get the incremental world-model delta since a given time — only the markets whose probability moved. ~30-50 tokens vs ~800 for the full state. Read-only, no auth. Use for cheap polling loops; use get_world_state for an absolute snapshot.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          since: {
            type: 'string',
            description: "Lookback window. Either a relative duration ('30m', '1h', '6h', '24h') or an ISO-8601 timestamp. Default: '1h'.",
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_edges',
      description:
        "Get currently actionable mispricings — markets where SimpleFunctions' causal model disagrees with the market price. Returns an array of edges with ticker, venue, prices, executableEdge in cents, confidence, liquidity, reasoning, age, and absorption. Read-only, no auth. Use after get_context if the user wants the raw edge list without bundled context.",
      parameters: NO_PARAMS,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_uncertainty_index',
      description:
        'Get the four-signal prediction-market uncertainty index: uncertainty (0-100), geopolitical risk (0-100), momentum (-1 to +1), activity (0-100). Derived from real-money orderbook spreads across 30,000+ markets. Read-only, no auth. Use when you need a single numeric pulse; use get_context for the full bundle.',
      parameters: NO_PARAMS,
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ideas',
      description:
        'Get LLM-generated, ready-to-act trade ideas derived from current edges, market changes, and source highlights. Each idea includes headline, pitch, conviction (high/medium/low), direction (buy_yes/buy_no), target market(s) with current price, catalyst, time horizon, and risk. Read-only, no auth. Cached server-side (~12h). Use when the user wants pre-packaged actionable suggestions; use get_market_edges for raw mispricings without LLM commentary.',
      parameters: NO_PARAMS,
    },
  },
]
