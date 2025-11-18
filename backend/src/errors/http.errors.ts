/**
 * HttpError
 *
 * Base class for HTTP-aware erros
 *  - statusCode: HTTP status code to return
 *  - message:    human-readable error message
 *  - details:    optional extra information
 */

export class HttpError extends Error {
  statusCode: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}

/**
 * ValidationError
 *
 * - 400 Bad Request
 * - Use when the client sends invalid or incomplete data
 */
export class ValidationError extends HttpError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message = "Validation error", details?: any) {
    super(400, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * NotFoundError
 *
 * - 404 Not Found
 * - Use when a resource (e.g., a patient) is not found
 */
export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * ConflictError
 *
 * - 409 Conflict
 * - Use when there is a conflict with current state
 *    (e.g., duplicate email)
 */
export class ConflictError extends HttpError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message = "Conflict", details?: any) {
    super(409, message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
