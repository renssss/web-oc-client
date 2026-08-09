interface ErrorLike {
  name?: unknown;
  status?: unknown;
  code?: unknown;
  message?: unknown;
  data?: { message?: unknown };
  cause?: unknown;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function isGenericFetchMessage(message: string): boolean {
  return /^fetch failed$/i.test(message) || /^failed to fetch$/i.test(message);
}

function collectMessage(err: unknown): string | undefined {
  let current: unknown = err;
  let fallback: string | undefined;
  for (let depth = 0; depth < 4 && isErrorLike(current); depth++) {
    const record = current;
    const candidate =
      (record.data !== null && typeof record.data === "object" && typeof record.data.message === "string" && record.data.message.trim()) ||
      (typeof record.message === "string" && record.message.trim());
    if (candidate) {
      if (isGenericFetchMessage(candidate)) {
        if (fallback === undefined) {
          fallback = candidate;
        }
      } else {
        return candidate;
      }
    }
    current = record.cause;
  }
  return fallback;
}

function extractStatus(err: unknown): number | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 3 && isErrorLike(current); depth++) {
    const record = current;
    const status =
      (typeof record.status === "number" && record.status) ||
      (record.cause !== null && typeof record.cause === "object" && typeof (record.cause as ErrorLike).status === "number"
        ? ((record.cause as ErrorLike).status as number)
        : undefined);
    if (status !== undefined) {
      return status;
    }
    current = record.cause;
  }
  return undefined;
}

function extractName(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 4 && isErrorLike(current); depth++) {
    const name = (current as ErrorLike).name;
    if (typeof name === "string" && name.trim()) {
      return name;
    }
    current = (current as ErrorLike).cause;
  }
  return undefined;
}

export function toClientError(err: unknown, fallbackStatus?: number): OpencodeClientError {
  if (err instanceof OpencodeClientError) {
    return err;
  }
  const message = collectMessage(err) ?? extractName(err) ?? String(err ?? "Unknown client error");
  const normalized = isGenericFetchMessage(message)
    ? "Failed to connect to the opencode server (connection error)"
    : message;
  return new OpencodeClientError(normalized, {
    status: extractStatus(err) ?? fallbackStatus,
    raw: err,
  });
}

export class OpencodeClientError extends Error {
  readonly status?: number;
  readonly raw?: unknown;

  constructor(message: string, options?: { status?: number; raw?: unknown }) {
    super(message);
    this.name = "OpencodeClientError";
    this.status = options?.status;
    this.raw = options?.raw;
  }
}
