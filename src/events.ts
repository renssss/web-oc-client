import { OpencodeClientError } from "./errors.ts";

export interface StreamOptions {
  signal?: AbortSignal;
  sseDefaultRetryDelay?: number;
  sseMaxRetryAttempts?: number;
  sseMaxRetryDelay?: number;
  onError?: (error: unknown) => void;
}

export class EventStream<T> implements AsyncIterable<T> {
  private readonly controller: AbortController;
  private readonly consumerOnError?: (error: unknown) => void;
  private source: AsyncIterator<T> | undefined;
  private lastError: unknown;
  private aborted = false;

  constructor(controller: AbortController, onError?: (error: unknown) => void) {
    this.controller = controller;
    this.consumerOnError = onError;
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  get isAborted(): boolean {
    return this.aborted;
  }

  bind(source: AsyncIterator<T>): void {
    this.source = source;
  }

  recordError(error: unknown): void {
    this.lastError = error;
    this.consumerOnError?.(error);
  }

  abort(): void {
    if (this.aborted) {
      return;
    }
    this.aborted = true;
    this.controller.abort();
  }

  async next(): Promise<IteratorResult<T>> {
    if (this.aborted) {
      return { done: true, value: undefined };
    }
    const source = this.source;
    if (source === undefined) {
      throw new OpencodeClientError("EventStream has no active source");
    }
    const result = await source.next();
    if (result.done === true && !this.aborted && this.lastError !== undefined) {
      throw this.lastError;
    }
    return result;
  }

  async return(): Promise<IteratorResult<T>> {
    this.abort();
    return this.source?.return?.() ?? { done: true, value: undefined };
  }

  async throw(error?: unknown): Promise<IteratorResult<T>> {
    this.abort();
    return this.source?.throw?.(error) ?? { done: true, value: undefined };
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }
}
