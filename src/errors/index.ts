export class HTTPServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HTTPServerError {
  public code: number;
  constructor(message: string) {
    super(message);
    this.code = 400;
  }
}
