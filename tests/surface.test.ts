import { describe, expect, test } from "bun:test";
import { createOpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";

const RESOURCES = [
  "project",
  "pty",
  "config",
  "tool",
  "instance",
  "path",
  "vcs",
  "session",
  "command",
  "provider",
  "find",
  "file",
  "app",
  "mcp",
  "lsp",
  "formatter",
  "tui",
  "auth",
  "event",
] as const;

function sdkSurfaceNames(sdkResource: object): string[] {
  const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(sdkResource)).filter((name) => name !== "constructor");
  const instanceKeys = Object.keys(sdkResource).filter((name) => name !== "_client");
  return [...new Set([...protoMethods, ...instanceKeys])].sort();
}

describe("facade surface vs SDK OpencodeClient", () => {
  const client = createOpencodeWebClient();
  const raw = createOpencodeClient({ baseUrl: "http://localhost:54321" });
  const facade = client as unknown as Record<string, object>;

  test("each resource facade exposes exactly the SDK's routes", () => {
    for (const resource of RESOURCES) {
      const sdkNames = sdkSurfaceNames((raw as unknown as Record<string, object>)[resource]);
      const facadeNames = Object.keys(facade[resource]).sort();
      const expected = (resource === "session" ? [...sdkNames, "permission"] : sdkNames).sort();
      expect(facadeNames, `facade surface mismatch for "${resource}"`).toEqual(expected);
    }
  });

  test("nested sub-resources mirror their SDK counterparts", () => {
    const oauth = facade.provider as { oauth: object };
    expect(Object.keys(oauth.oauth).sort()).toEqual(["authorize", "callback"]);

    const tui = facade.tui as { control: object };
    expect(Object.keys(tui.control).sort()).toEqual(["next", "response"]);

    const mcp = facade.mcp as { auth: object };
    expect(Object.keys(mcp.auth).sort()).toEqual(Object.keys(facade.auth).sort());
  });

  test("the permission route is covered by the session facade", () => {
    const rawProto = Object.getPrototypeOf(raw) as { postSessionIdPermissionsPermissionId?: unknown };
    expect(typeof rawProto.postSessionIdPermissionsPermissionId).toBe("function");
    const session = facade.session as { permission?: unknown };
    expect(typeof session.permission).toBe("function");
  });

  test("the top-level client exposes events()/subscribe() for SSE", () => {
    const top = client as unknown as { events?: unknown; subscribe?: unknown };
    expect(typeof top.events).toBe("function");
    expect(typeof top.subscribe).toBe("function");
  });
});
