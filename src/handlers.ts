import { sfFetch } from './api.js'

const stringify = (data: unknown): string => (typeof data === 'string' ? data : JSON.stringify(data))

/**
 * Dispatches a tool call from `chat.completions` (or the OpenAI Agents SDK)
 * to the SimpleFunctions API and returns a string ready to feed back into
 * the model as a tool message.
 */
export async function handleFunctionCall(
  name: string,
  args: Record<string, unknown> = {},
): Promise<string> {
  switch (name) {
    case 'get_context':
      return stringify(await sfFetch('/api/public/context'))
    case 'get_world_state':
      return stringify(
        await sfFetch('/api/agent/world', {
          format: (args.format as string) || 'markdown',
        }),
      )
    case 'get_world_changes': {
      const params: Record<string, string> = { format: 'markdown' }
      if (args.since) params.since = String(args.since)
      return stringify(await sfFetch('/api/agent/world/delta', params))
    }
    case 'get_market_edges':
      return stringify(await sfFetch('/api/edges'))
    case 'get_uncertainty_index':
      return stringify(await sfFetch('/api/public/index'))
    case 'get_ideas':
      return stringify(await sfFetch('/api/public/ideas'))
    default:
      throw new Error(`Unknown SimpleFunctions tool: ${name}`)
  }
}
