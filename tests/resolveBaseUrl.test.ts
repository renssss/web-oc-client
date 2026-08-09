import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { DEFAULT_BASE_URL, resolveBaseUrl } from "../src/index.ts";

function setEnv(value: string | undefined): void {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (proc?.env) {
    if (value === undefined) {
      delete proc.env.OPENCODE_BASE_URL;
    } else {
      proc.env.OPENCODE_BASE_URL = value;
    }
  }
}

describe("resolveBaseUrl", () => {
  beforeEach(() => setEnv(undefined));
  afterEach(() => setEnv(undefined));

  test("defaults to the standard opencode server URL", () => {
    expect(resolveBaseUrl()).toBe(DEFAULT_BASE_URL);
    expect(resolveBaseUrl({})).toBe("http://localhost:54321");
  });

  test("uses OPENCODE_BASE_URL when no explicit option is given", () => {
    setEnv("http://example.com:8080");
    expect(resolveBaseUrl()).toBe("http://example.com:8080");
  });

  test("explicit option wins over OPENCODE_BASE_URL", () => {
    setEnv("http://example.com:8080");
    expect(resolveBaseUrl({ baseUrl: "http://127.0.0.1:9999" })).toBe("http://127.0.0.1:9999");
  });

  test("empty env value falls back to the default", () => {
    setEnv("");
    expect(resolveBaseUrl()).toBe(DEFAULT_BASE_URL);
  });
});
