import { toClientError } from "./errors.ts";

export type FieldsResult<TData, TError> =
  | { data: TData; error: undefined; request: Request; response: Response }
  | { data: undefined; error: TError; request: Request; response: Response };

export async function unwrap<T>(result: Promise<{ data?: T; error?: unknown; response?: Response }>): Promise<T> {
  try {
    const res = await result;
    if (res.error !== undefined) {
      throw toClientError(res.error, res.response?.status);
    }
    return res.data as T;
  } catch (err) {
    throw toClientError(err);
  }
}
