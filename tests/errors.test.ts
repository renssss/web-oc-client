import { describe, expect, test } from "bun:test";
import { OpencodeClientError, toClientError } from "../src/index.ts";

describe("toClientError", () => {
  test("wraps an SDK BadRequest-shaped error, preserving message and fallback status", () => {
    const err = toClientError({ name: "BadRequest", data: { message: "Invalid body" } }, 400);
    expect(err).toBeInstanceOf(OpencodeClientError);
    expect(err.name).toBe("OpencodeClientError");
    expect(err.message).toBe("Invalid body");
    expect(err.status).toBe(400);
    expect(err.raw).toEqual({ name: "BadRequest", data: { message: "Invalid body" } });
  });

  test("carries an explicit status found on the error object", () => {
    const err = toClientError({ name: "NotFoundError", data: { message: "missing" }, status: 404 });
    expect(err.message).toBe("missing");
    expect(err.status).toBe(404);
  });

  test("falls back to the error name when no message is present", () => {
    const err = toClientError({ name: "BadRequest" });
    expect(err.message).toBe("BadRequest");
  });

  test("normalizes a bare network failure into a clear connection error", () => {
    const err = toClientError(new TypeError("fetch failed"));
    expect(err.message).toBe("Failed to connect to the opencode server (connection error)");
    expect(err.status).toBeUndefined();
    expect(err.raw).toBeInstanceOf(TypeError);
  });

  test("surfaces an underlying connection-refused detail", () => {
    const err = toClientError(new TypeError("fetch failed", { cause: new Error("connect ECONNREFUSED 127.0.0.1:54321") }));
    expect(err.message).toContain("ECONNREFUSED");
    expect(err.status).toBeUndefined();
  });

  test("reads status from the error cause chain", () => {
    const err = toClientError(new Error("boom", { cause: { status: 503 } }));
    expect(err.status).toBe(503);
  });

  test("returns existing OpencodeClientError instances untouched", () => {
    const original = new OpencodeClientError("already typed", { status: 409 });
    expect(toClientError(original)).toBe(original);
  });
});
