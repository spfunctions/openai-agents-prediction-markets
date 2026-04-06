import { sfFetch } from './api.js'

export async function handleFunctionCall(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'get_world_state': {
      const data = await sfFetch('/api/agent/world', { format: args.format || 'markdown' })
      return typeof data === 'string' ? data : JSON.stringify(data)
    }
    case 'get_uncertainty_index':
      return JSON.stringify(await sfFetch('/api/public/index'))
    case 'get_market_edges':
      return JSON.stringify(await sfFetch('/api/edges'))
    case 'get_market_detail': {
      const params: Record<string, string> = {}
      if (args.depth) params.depth = 'true'
      return JSON.stringify(await sfFetch(`/api/public/market/${encodeURIComponent(args.ticker)}`, params))
    }
    case 'get_world_changes': {
      const params: Record<string, string> = { format: 'json' }
      if (args.since) params.since = args.since
      return JSON.stringify(await sfFetch('/api/agent/world/delta', params))
    }
    default:
      throw new Error(`Unknown function: ${name}`)
  }
}
