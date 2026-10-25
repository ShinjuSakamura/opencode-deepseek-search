# opencode-deepseek-search

OpenCode V2 的 DeepSeek 搜索 provider，通过 DeepSeek 官方 Search API 为内置 `websearch` 工具提供结果。

## 行为

- 调用 `POST https://api.deepseek.com/v1/tools/search`，固定 `need_content: false`。
- 每条结果的 `content` 取 `summary`，没有时回退到 `snippet`，与内置 provider 返回摘要的行为一致。
- `date` 映射为 `time.published`，单位毫秒。
- 默认返回 8 条，可通过插件选项调整。
- 认证优先使用 OpenCode `/connect` 中 DeepSeek 的凭据，其次读取 `DEEPSEEK_API_KEY`。

## 安装

从 GitHub 安装：

```sh
opencode plugin add github:ShinjuSakamura/opencode-deepseek-search
```

或者在 `~/.config/opencode/opencode.json(c)` 中声明：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["github:ShinjuSakamura/opencode-deepseek-search"]
}
```

本地目录同样可用：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/you/opencode-deepseek-search"]
}
```

配置修改后 OpenCode 会自动重载。需要手动重载时执行 `opencode service restart`。

## 认证

在 TUI 中执行 `/connect`，选择 DeepSeek 并填入 API key。这个凭据同时用于 DeepSeek 模型 provider。

也可以给服务进程设置环境变量：

```sh
opencode service set env DEEPSEEK_API_KEY sk-...
```

## 选用

插件注册的 provider ID 是 `deepseek`。想固定使用它：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "websearch": {
    "provider": "deepseek"
  }
}
```

不固定时它会参与 `random`，与内置的五个 provider 等概率。`random` 只在 HTTP 429 时切换来源，其他错误会直接失败。

## 选项

用对象形式传入：

```jsonc
{
  "plugins": [
    {
      "package": "opencode-deepseek-search",
      "options": { "count": 5 }
    }
  ]
}
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `count` | `8` | 返回条数，范围 1–50 |

代理或自建网关可以设置 `DEEPSEEK_SEARCH_ENDPOINT`，值为完整的 Search 接口 URL。

## 开发

需要 Node.js 22.18 或更新版本：

```sh
npm test
```

测试会启动本地 mock 服务，覆盖请求体、摘要映射、日期映射和错误处理。

## License

MIT
