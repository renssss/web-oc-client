## Why

The repo is an empty scaffold (`web-oc-client`) that already depends on `@opencode-ai/sdk`, but has no code. We need a browser-usable, fully typed web client for the opencode server that covers the entire documented HTTP + SSE surface, so any web UI can talk to a running opencode server without hand-rolling HTTP calls or missing endpoints.

## What Changes

- Introduce a framework-agnostic TypeScript web client package layered on `@opencode-ai/sdk`'s generated `OpencodeClient`.
- Expose typed wrapper namespaces for every server resource: `project`, `pty`, `config`, `tool`, `instance`, `path`, `vcs`, `session`, `command`, `provider`, `find`, `file`, `app`, `mcp`, `lsp`, `formatter`, `tui`, `auth`, and `event`.
- Cover **all** documented endpoints of the opencode server (full method list captured in `specs/web-client/spec.md`), including SSE streaming for live events.
- Add configurable server connection (base URL via `OPENCODE_BASE_URL`, default `http://localhost:54321`), typed request/response payloads, streaming with cancellation, and consistent error handling.

## Capabilities

### New Capabilities
- `web-client`: A complete, typed, framework-agnostic client for the opencode server HTTP and SSE API, built on `@opencode-ai/sdk`, exposing all documented endpoints.

### Modified Capabilities
<!-- No existing capabilities to modify - this is the first spec in the project. -->

## Impact

- **Code**: New source under the repo root (`src/`), extending the existing `@opencode-ai/sdk` dependency (^1.18.15).
- **Dependencies**: No new runtime dependencies planned; `@opencode-ai/sdk` stays the single SDK dependency.
- **APIs**: Client surface mirrors the server API (resource → method) with zero breaking changes to the server.
- **Systems**: Runs against an opencode server instance (local default `http://localhost:54321`); SSE used for the event stream.
