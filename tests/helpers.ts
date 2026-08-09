export function sdkResult<T>(data: T) {
  return Promise.resolve({
    data,
    error: undefined,
    request: {} as Request,
    response: { status: 200 } as Response,
  });
}

export function sdkError<T>(error: T, status = 400) {
  return Promise.resolve({
    data: undefined,
    error,
    request: {} as Request,
    response: { status } as Response,
  });
}

export class SuccessStub {
  calls: unknown[] = [];

  constructor(private readonly data: unknown) {}

  fn = (options?: unknown): Promise<unknown> => {
    this.calls.push(options);
    return sdkResult(this.data);
  };
}

export class ErrorStub {
  calls: unknown[] = [];

  constructor(private readonly error: unknown, private readonly status = 400) {}

  fn = (options?: unknown): Promise<unknown> => {
    this.calls.push(options);
    return sdkError(this.error, this.status);
  };
}
