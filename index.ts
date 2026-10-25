import { Plugin } from "@opencode/plugin"
import { search } from "./deepseek.ts"

export default Plugin.define({
  id: "search.deepseek",
  async setup(ctx) {
    await ctx.websearch.transform((editor) => {
      editor.add({
        id: "deepseek",
        name: "DeepSeek Search",
        execute: async ({ query }, { signal }) => {
          const connection = await ctx.integration.connection.active("deepseek")
          const credential = connection ? await ctx.integration.connection.resolve(connection) : undefined
          const apiKey =
            credential?.type === "key" ? credential.key : process.env.DEEPSEEK_API_KEY?.trim()
          if (!apiKey) throw new Error("Connect DeepSeek in /connect or set DEEPSEEK_API_KEY")

          const count = Math.min(50, Math.max(1, Number(ctx.options.count ?? 8) || 8))
          return search(query, {
            apiKey,
            count,
            endpoint: process.env.DEEPSEEK_SEARCH_ENDPOINT,
            signal,
          })
        },
      })
    })
  },
})
