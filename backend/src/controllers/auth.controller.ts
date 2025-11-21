import jwt from "jsonwebtoken";
import type { UserDocument, UserRole } from "../models/user.model.js";
import config from "../config.js";
import type { Request, Response } from "express";
import * as z from "zod";
import {
  loginUserSchema,
  registerUserSchema,
  type LoginUserSchema,
  type RegisterUserSchema,
} from "../validation/user.validation.js";
import { UnauthorizedError, ValidationError } from "../errors/http.errors.js";
import {
  createUserService,
  getUserByEmailService,
  verifyPasswordService,
} from "../services/user.service.js";

/**
 * JwtPayload
 *
 * Shape of data embedded in the JWT
 */
export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}

/**
 * getJwtSecret
 *
 * Helper to read JWT secret from env
 */
const getJwtSecret = (): jwt.Secret => {
  const secret = config.jwtSecret;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
};

/**
 * generateJwt
 *
 * Helper to create a signed JWT for a user
 */
export const generateJwt = (user: UserDocument): string => {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: "1h",
  });

  return token;
};

/**
 * registerUserController
 *
 * HTTP handler for registering new user
 *
 * Intended route:
 *  - POST /api/auth/register
 */
export const registerUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = registerUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid registration data`,
      z.flattenError(parsed.error)
    );
  }

  const input: RegisterUserSchema = parsed.data;

  const role: UserRole = input.role ?? "patient";

  const user = await createUserService({
    email: input.email,
    password: input.password,
    role,
  });

  const token = generateJwt(user);

  res.status(201).json({
    message: `User registered successfully`,
    user,
    token,
  });
};

/**
 * loginUserController
 *
 * HTTP handler for logging in user
 *
 * Intended route:
 *  - POST /api/auth/login
 */
export const loginUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = loginUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid login data`,
      z.flattenError(parsed.error)
    );
  }

  const input: LoginUserSchema = parsed.data;

  const user = await getUserByEmailService(input.email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const isPasswordValid = await verifyPasswordService(user, input.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ValidationError(`User account is inactive`);
  }

  const token = generateJwt(user);

  res.status(200).json({
    message: "Login successful",
    user,
    token,
  });
};
