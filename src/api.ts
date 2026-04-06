const BASE = "https://simplefunctions.dev"
export async function sfFetch(path: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(path, BASE)
  if (params) for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`SimpleFunctions API error: ${res.status}`)
  const ct = res.headers.get("content-type") || ""
  return ct.includes("json") ? res.json() : res.text()
}
