# web-oc-client

Framework-agnostic TypeScript web client for the opencode server, built on `@opencode-ai/sdk`.

## Requirements for consumers

The package ships raw TypeScript sources (`exports` points at `./src/index.ts`) with no build step, so consumers must use a TS-aware bundler (Vite, esbuild, tsup, etc.) or run the package through their own build pipeline.

- Runtime dependency: `@opencode-ai/sdk` (pinned to `1.18.15`).

## Connecting to a server

```ts
import { createOpencodeWebClient } from "web-oc-client";

// Node: explicit option, OPENCODE_BASE_URL, or http://localhost:54321 (in that order)
const client = createOpencodeWebClient();

// Browsers cannot read process env vars, so use the explicit option for non-default deployments:
const client = createOpencodeWebClient({ baseUrl: "https://opencode.example.com" });
```

Every server resource is exposed as a typed facade: `client.project`, `client.session`, `client.config`, `client.mcp`, `client.tui`, and the rest. Live server events are available via `client.events()` / `client.subscribe()` as a cancelable async iterable.

## Development

```sh
npm run typecheck
npm test
```
