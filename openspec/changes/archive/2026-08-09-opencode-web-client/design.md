## Context

See proposal.md — Why. Current state: the repo is an empty scaffold that already depends on `@opencode-ai/sdk` (^1.18.15). The SDK ships a fully generated, per-resource typed client (`OpencodeClient` via `createOpencodeClient`) plus a `v2` entry point, both mirroring the opencode server HTTP/SSE API. There is no existing application code, no bundler config, and no framework selected.

## Goals / Non-Goals

**Goals:**
- A single typed client entry point (`createOpencodeWebClient()`) that wraps the SDK's `OpencodeClient` and exposes every server endpoint through resource namespaces (`project`, `session`, `config`, `mcp`, `tui`, …).
- Browser-usable from day one: explicit base-URL option (env fallback works in Node, explicit option required in browsers), no Node-only APIs.
- SSE event streaming (`event.subscribe`) exposed as a cancelable async iterable.
- Consistent, typed error handling across all methods.
- Framework-agnostic core so any web UI (React, Vue, vanilla) can consume it.

**Non-Goals:**
- No UI framework, routing, state store, or component library in this change.
- No authentication/authorization beyond what the server API supports (no token storage layer).
- No re-implementation of the SDK's transport; the SDK remains the sole HTTP/SSE engine.

## Decisions

**1. Standardize on the installed `@opencode-ai/sdk` generated client**
Use `createOpencodeClient({ baseUrl, directory })` from `@opencode-ai/sdk/client` as the sole underlying transport. Its generated surface matches the server's actual routes one-to-one (verified against `dist/gen/sdk.gen.d.ts`). The opencode server API contract was confirmed against the official SDK docs via the **context7 MCP** (default server URL `http://localhost:54321`, `OPENCODE_BASE_URL` override, SSE streaming); the repo's pinned `@opencode-ai/sdk` implements that contract. No alternative SDK was considered — context7 served only as a documentation source.

**2. Thin facade wrapper per resource**
Expose `client.<resource>.<method>(...)` facades that delegate to the SDK's `OpencodeClient` resource namespaces (e.g. `session.prompt` → `sdkClient.session.prompt`). Rationale: a stable, curated surface that normalizes response shape (`data`/`error` fields → typed values or rejected errors) and can be tested without depending on SDK internals. Alternative considered: re-exporting the raw `OpencodeClient` directly — rejected because the raw client returns `{ data | error }` unions and mixed SSE/plain methods, which pushes boilerplate onto consumers.

**3. SDK types are re-exported as the public types**
The facade re-exports the SDK's generated request/response types (`Session`, `AssistantMessage`, `TextPartInput`, etc.) rather than inventing parallel types. Rationale: keeps the client in lockstep with the server schema and avoids drift. Where the SDK lacks an exported name for a payload, define a local type aliasing the SDK's inline shape.

**4. Configuration module with explicit-first base URL**
`createOpencodeWebClient({ baseUrl?, ... })` resolves base URL in order: explicit option → `OPENCODE_BASE_URL` env (Node) → `http://localhost:54321`. Rationale: browsers can't read arbitrary env vars, so the explicit option is mandatory for non-default deployments. Alternative considered: relying on the SDK's env handling — rejected for browsers.

**5. SSE streaming as a cancelable async iterable**
Wrap the SDK's `event.subscribe` (`ServerSentEventsResult`) in an `EventStream` that yields events, supports `abort()`/`return()` to cancel, and surfaces stream errors to the consumer. Rationale: matches the documented streaming model (SSE, default `http://localhost:54321`) and gives consumers a uniform `for await` contract.

**6. Error normalization**
A single `toClientError()` maps SDK error unions to a typed `OpencodeClientError` carrying `status`, `message`, and the raw error. Rationale: consistent error contract per spec. Alternative considered: surfacing SDK's `{ data: undefined, error }` unions as values — rejected because rejection is the more idiomatic contract for a browser client.

**7. Framework-agnostic core, no build tooling in this change**
The core is plain ESM TypeScript with no React/Vue/bundler assumptions; tooling choices (Vite, etc.) are deferred to the consuming app. Rationale: the requirement is endpoint coverage and typed access, not a UI.

## Risks / Trade-offs

- **SDK surface drift** (new server endpoints won't appear until the SDK is upgraded) → Pin and document the SDK version; the facade is thin, so upgrades only need type checks.
- **SSE from browser to `localhost:54321`** may hit CORS/browser restrictions → Document server CORS requirements and keep base URL fully configurable.
- **`OPENCODE_BASE_URL` env is not readable in browsers** → Explicit `baseUrl` option is the browser path; env is a Node convenience only.
- **Response-shape normalization** (SDK `fields` style vs. plain data) is easy to get subtly wrong → Centralize in the facade and cover with tests per resource.
- **Streaming behavior depends on server behavior** (retries, disconnect handling) → Expose the SDK's SSE options (retry delay/max attempts) through the stream config.

## Migration Plan

Greenfield — no existing code to migrate or roll back. Deployment is additive: introduce `src/`, keep `@opencode-ai/sdk` as the only runtime dependency.

## Open Questions

- Whether the client should be published as a standalone package or live as an internal `src/` module — deferrable; does not change the API surface, approach, or task breakdown.
- Exact browser test harness / bundler for consumers — deferrable to the consuming app; core remains framework-agnostic.
