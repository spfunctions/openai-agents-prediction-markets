const BASE = 'https://simplefunctions.dev'

/** Internal fetch helper. Exported for advanced use and tests. */
export async function sfFetch(path: string, params?: Record<string, string>): Promise<unknown> {
  const url = new URL(path, BASE)
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`SimpleFunctions API error ${res.status} for ${path}`)
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : res.text()
}
