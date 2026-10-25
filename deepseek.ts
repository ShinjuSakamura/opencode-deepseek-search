export type Result = {
  url: string
  title: string
  content: string
  time: { published?: number }
}

type DeepSeekResult = {
  url: string
  title: string
  snippet?: string
  summary?: string
  date?: string | null
}

const DEFAULT_ENDPOINT = "https://api.deepseek.com/v1/tools/search"

export async function search(
  query: string,
  options: { apiKey: string; count: number; endpoint?: string; signal?: AbortSignal },
): Promise<Result[]> {
  const response = await fetch(options.endpoint ?? DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, count: options.count, need_content: false }),
    signal: options.signal,
  })
  if (!response.ok) {
    throw new Error(`DeepSeek search ${response.status}: ${await response.text()}`)
  }

  const data = (await response.json()) as { results?: DeepSeekResult[] }
  return (data.results ?? []).map((result) => ({
    url: result.url,
    title: result.title || result.url,
    content: result.summary || result.snippet || "",
    time: result.date ? { published: Date.parse(result.date) } : {},
  }))
}
