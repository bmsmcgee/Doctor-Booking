import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http.errors.js";

/**
 * errorHandler
 *
 * Function
 *
 * Global Express error-handling middleware
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  console.log(req.body);

  console.error("Unhandled error:", err);

  // If this is one of the HttpError subclasses, use its status & message
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error.",
  });
};
