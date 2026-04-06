export interface FunctionDef {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, any> }
}

export const predictionMarketFunctions: FunctionDef[] = [
  {
    type: 'function',
    function: {
      name: 'get_world_state',
      description: 'Get real-time prediction market world state from 30,000+ markets. Returns uncertainty index, regime summary, actionable edges, movers, and divergences.',
      parameters: { type: 'object', properties: { format: { type: 'string', enum: ['json', 'markdown'], description: 'Output format. Default: markdown' } } },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_uncertainty_index',
      description: 'Get the prediction market uncertainty index: uncertainty (0-100), geopolitical risk (0-100), momentum (-1 to +1), activity (0-100).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_edges',
      description: 'Get actionable edges — markets where thesis-implied price diverges from market price. Includes reasoning, causal path, age, absorption.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_detail',
      description: 'Get detailed data for a specific prediction market. Works with Kalshi tickers and Polymarket IDs.',
      parameters: { type: 'object', properties: { ticker: { type: 'string', description: 'Market ticker or ID' }, depth: { type: 'boolean', description: 'Include orderbook' } }, required: ['ticker'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_world_changes',
      description: 'Get incremental world state changes since a given time (~30-50 tokens vs 800 for full state).',
      parameters: { type: 'object', properties: { since: { type: 'string', description: 'Time window: 1h, 6h, 24h, or ISO timestamp' } } },
    },
  },
]
