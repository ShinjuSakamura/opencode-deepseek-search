import { createServer } from "node:http"
import { strict as assert } from "node:assert"
import { search } from "../deepseek.ts"

let received = {}
let status = 200

const server = createServer((req, res) => {
  let body = ""
  req.on("data", (chunk) => (body += chunk))
  req.on("end", () => {
    received = { auth: req.headers.authorization, body: JSON.parse(body) }
    res.statusCode = status
    res.setHeader("content-type", "application/json")
    if (status !== 200) {
      res.end(JSON.stringify({ error: { message: "rate limited" } }))
      return
    }
    res.end(
      JSON.stringify({
        results: [
          {
            url: "https://example.com/a",
            title: "A title",
            content: "Full page A",
            summary: "Summary A",
            snippet: "Snippet A",
            date: "2026-06-01T00:00:00+00:00",
          },
          { url: "https://example.com/b", title: "", summary: "", snippet: "Snippet B", date: null },
        ],
      }),
    )
  })
})

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const endpoint = `http://127.0.0.1:${server.address().port}/v1/tools/search`

try {
  const results = await search("opencode test", { apiKey: "sk-test", count: 5, endpoint })

  assert.equal(received.auth, "Bearer sk-test")
  assert.deepEqual(received.body, { query: "opencode test", count: 5, need_content: false })
  assert.deepEqual(results[0], {
    url: "https://example.com/a",
    title: "A title",
    content: "Summary A",
    time: { published: Date.parse("2026-06-01T00:00:00+00:00") },
  })
  assert.deepEqual(results[1], {
    url: "https://example.com/b",
    title: "https://example.com/b",
    content: "Snippet B",
    time: {},
  })

  status = 429
  await assert.rejects(() => search("rate limited", { apiKey: "sk-test", count: 5, endpoint }), /DeepSeek search 429/)

  console.log("PASS: request shape, summary mapping, date mapping, error handling")
} finally {
  server.close()
}
