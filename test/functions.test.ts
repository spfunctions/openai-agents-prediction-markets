import { describe, it, expect, afterEach, vi } from 'vitest'
import { predictionMarketFunctions, handleFunctionCall, sfFetch } from '../src/index.js'

// ── Helpers ───────────────────────────────────────────────

function mockFetchOnce(body: unknown, opts: { contentType?: string; status?: number } = {}) {
  const isString = typeof body === 'string'
  const ct = opts.contentType ?? (isString ? 'text/markdown' : 'application/json')
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(isString ? body : JSON.stringify(body), {
      status: opts.status ?? 200,
      headers: { 'content-type': ct },
    }),
  )
}

function lastCalledUrl(spy: ReturnType<typeof vi.spyOn>): string {
  const call = spy.mock.calls[0]
  return typeof call[0] === 'string' ? call[0] : (call[0] as URL).toString()
}

afterEach(() => vi.restoreAllMocks())

// ── Function definitions ──────────────────────────────────

describe('predictionMarketFunctions', () => {
  it('exports six function definitions in stable order', () => {
    expect(predictionMarketFunctions).toHaveLength(6)
    expect(predictionMarketFunctions.map((f) => f.function.name)).toEqual([
      'get_context',
      'get_world_state',
      'get_world_changes',
      'get_market_edges',
      'get_uncertainty_index',
      'get_ideas',
    ])
  })

  it('every function has type=function and a parameters object schema', () => {
    for (const f of predictionMarketFunctions) {
      expect(f.type).toBe('function')
      expect(f.function.description).toBeTruthy()
      expect((f.function.parameters as any).type).toBe('object')
    }
  })

  it('get_world_state declares the format enum', () => {
    const ws = predictionMarketFunctions.find((f) => f.function.name === 'get_world_state')!
    expect((ws.function.parameters as any).properties.format.enum).toEqual(['markdown', 'json'])
  })
})

// ── handleFunctionCall dispatch ───────────────────────────

describe('handleFunctionCall', () => {
  it('get_context hits /api/public/context', async () => {
    const spy = mockFetchOnce({ edges: [], movers: [] })
    const out = await handleFunctionCall('get_context')
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/public/context')
    expect(JSON.parse(out)).toEqual({ edges: [], movers: [] })
  })

  it('get_world_state defaults to markdown', async () => {
    const spy = mockFetchOnce('# State', { contentType: 'text/markdown' })
    const out = await handleFunctionCall('get_world_state', {})
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/agent/world?format=markdown')
    expect(out).toBe('# State')
  })

  it('get_world_state passes format=json', async () => {
    const spy = mockFetchOnce({ regime: 'neutral' })
    await handleFunctionCall('get_world_state', { format: 'json' })
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/agent/world?format=json')
  })

  it('get_world_changes default has no since param', async () => {
    const spy = mockFetchOnce('# Delta', { contentType: 'text/markdown' })
    await handleFunctionCall('get_world_changes', {})
    expect(lastCalledUrl(spy)).toBe(
      'https://simplefunctions.dev/api/agent/world/delta?format=markdown',
    )
  })

  it('get_world_changes passes since', async () => {
    const spy = mockFetchOnce('# Delta', { contentType: 'text/markdown' })
    await handleFunctionCall('get_world_changes', { since: '6h' })
    expect(lastCalledUrl(spy)).toBe(
      'https://simplefunctions.dev/api/agent/world/delta?format=markdown&since=6h',
    )
  })

  it('get_market_edges hits /api/edges', async () => {
    const spy = mockFetchOnce({ edges: [{ ticker: 'KX' }] })
    const out = await handleFunctionCall('get_market_edges')
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/edges')
    expect(JSON.parse(out).edges).toHaveLength(1)
  })

  it('get_uncertainty_index hits /api/public/index', async () => {
    const spy = mockFetchOnce({ uncertainty: 22, geopolitical: 0, momentum: -0.08, activity: 99 })
    const out = await handleFunctionCall('get_uncertainty_index')
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/public/index')
    expect(JSON.parse(out)).toMatchObject({ uncertainty: 22, activity: 99 })
  })

  it('get_ideas hits /api/public/ideas', async () => {
    const spy = mockFetchOnce({ ideas: [{ headline: 'h', conviction: 'high' }] })
    const out = await handleFunctionCall('get_ideas')
    expect(lastCalledUrl(spy)).toBe('https://simplefunctions.dev/api/public/ideas')
    expect(JSON.parse(out).ideas[0].conviction).toBe('high')
  })

  it('throws on unknown tool name', async () => {
    await expect(handleFunctionCall('not_a_tool')).rejects.toThrow(/Unknown/)
  })
})

// ── Error handling ────────────────────────────────────────

describe('sfFetch', () => {
  it('throws on non-2xx with status code in message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } }),
    )
    await expect(sfFetch('/api/missing')).rejects.toThrow(/404/)
  })
})
