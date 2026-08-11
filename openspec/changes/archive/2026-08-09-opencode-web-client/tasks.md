## 1. Scaffolding and configuration

- [x] 1.1 Create `src/` module layout (`client.ts`, `resources/`, `events.ts`, `errors.ts`, `types.ts`, `index.ts`)
- [x] 1.2 Ensure `@opencode-ai/sdk` is the only runtime dependency in `package.json` and pin the version
- [x] 1.3 Add TypeScript config and typecheck script for the package
- [x] 1.4 Implement `resolveBaseUrl(options)` resolving explicit option → `OPENCODE_BASE_URL` env (Node) → `http://localhost:54321`
- [x] 1.5 Implement `createOpencodeWebClient(options)` that builds the SDK `OpencodeClient` (`createOpencodeClient({ baseUrl })`) and wires up all resource facades

## 2. Core client plumbing

- [x] 2.1 Implement `OpencodeClientError` carrying `status`, `message`, and raw error
- [x] 2.2 Implement `toClientError()` normalizing SDK error unions into `OpencodeClientError` rejections
- [x] 2.3 Implement a response helper that unwraps SDK `{ data, error }` fields-style results and rejects on `error`
- [x] 2.4 Verify connection to an unreachable server rejects with a clear connection error

## 3. Session and messaging facades

- [x] 3.1 Implement `session` facade: `list`, `create`, `status`, `get`, `update`, `delete`
- [x] 3.2 Implement `session` facade: `children`, `todo`, `init`, `fork`, `abort`
- [x] 3.3 Implement `session` facade: `share`, `unshare`, `diff`, `summarize`
- [x] 3.4 Implement `session` facade: `messages`, `message`, `prompt`, `promptAsync`, `command`, `shell`, `revert`, `unrevert`
- [x] 3.5 Implement the permission-response method (`postSessionIdPermissionsPermissionId` equivalent)

## 4. Provider, config, tool, command facades

- [x] 4.1 Implement `config` facade: `get`, `update`, `providers`
- [x] 4.2 Implement `tool` facade: `ids`, `list`
- [x] 4.3 Implement `provider` facade: `list`, `auth`
- [x] 4.4 Implement `provider.oauth` facade: `authorize`, `callback`
- [x] 4.5 Implement `command` facade: `list`

## 5. Project, path, VCS, instance, file, find facades

- [x] 5.1 Implement `project` facade: `list`, `current`
- [x] 5.2 Implement `path` facade: `get`
- [x] 5.3 Implement `vcs` facade: `get`
- [x] 5.4 Implement `instance` facade: `dispose`
- [x] 5.5 Implement `file` facade: `list`, `read`, `status`
- [x] 5.6 Implement `find` facade: `text`, `files`, `symbols`

## 6. PTY facade

- [x] 6.1 Implement `pty` facade: `list`, `create`, `remove`
- [x] 6.2 Implement `pty` facade: `get`, `update`, `connect`

## 7. MCP and auth facades

- [x] 7.1 Implement `mcp` facade: `status`, `add`, `connect`, `disconnect`
- [x] 7.2 Implement `mcp.auth` facade: `remove`, `start`, `callback`, `authenticate`, `set`

## 8. App, LSP, formatter facades

- [x] 8.1 Implement `app` facade: `log`, `agents`
- [x] 8.2 Implement `lsp` facade: `status`
- [x] 8.3 Implement `formatter` facade: `status`

## 9. TUI facade

- [x] 9.1 Implement `tui` facade: `appendPrompt`, `submitPrompt`, `clearPrompt`
- [x] 9.2 Implement `tui` facade: `openHelp`, `openSessions`, `openThemes`, `openModels`
- [x] 9.3 Implement `tui` facade: `executeCommand`, `showToast`, `publish`
- [x] 9.4 Implement `tui.control` facade: `next`, `response`

## 10. Event streaming

- [x] 10.1 Implement cancelable async iterable `EventStream` wrapping the SDK's `event.subscribe` (SSE)
- [x] 10.2 Support `abort()`/`return()` cancellation that releases the connection
- [x] 10.3 Surface SSE stream errors and retry options to the consumer
- [x] 10.4 Expose an `events()`/`subscribe()` method on the top-level client

## 11. Public types and exports

- [x] 11.1 Re-export SDK request/response types (`Session`, `AssistantMessage`, `TextPartInput`, `FilePartInput`, `SessionChatParams`, etc.) from the package entry
- [x] 11.2 Add local type aliases for any payloads the SDK does not export under a named type
- [x] 11.3 Export `createOpencodeWebClient`, all facade interfaces, `OpencodeClientError`, and `EventStream` from `index.ts`

## 12. Tests and verification

- [x] 12.1 Add unit tests for `resolveBaseUrl` precedence (option → env → default)
- [x] 12.2 Add tests for error normalization (`OpencodeClientError` status/message propagation)
- [x] 12.3 Add per-resource tests stubbing the SDK client to verify facade delegates to every endpoint and unwraps responses
- [x] 12.4 Add a streaming test verifying event delivery and `abort()` cancellation
- [x] 12.5 Verify every endpoint listed in `specs/web-client/spec.md` is exercised by a test
- [x] 12.6 Run typecheck and tests; confirm the facade surface matches the SDK's `OpencodeClient` route-by-route
