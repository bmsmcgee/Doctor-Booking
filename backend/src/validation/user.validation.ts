import * as z from "zod";
import type { UserRole } from "../models/user.model.js";

/**
 * allowedUserRoles
 */
const allowedUserRoles: UserRole[] = ["patient", "doctor", "admin"];

/**
 * registerUserSchema
 *
 * Schema for registering a new user
 */
export const registerUserSchema = z.object({
  email: z.email({ error: `A valid email is required` }),
  password: z
    .string()
    .min(8, { error: `Password must be at least 8 characters long` }),
  role: z.optional(
    z.enum(allowedUserRoles as [UserRole, ...UserRole[]], {
      error: `Invalid role`,
    })
  ),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

/**
 * loginUserSchema
 *
 * Schema for logging in a user
 */
export const loginUserSchema = z.object({
  email: z.email({ error: `A valid email is required` }),
  password: z.string().min(1, { error: `Password is required` }),
});

export type LoginUserSchema = z.infer<typeof loginUserSchema>;

/**
 * userIdParamSchema
 *
 * Helper for routes using :id in params
 */
export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, { error: `User ID is required` }),
});

export type UserIdParamSchema = z.infer<typeof userIdParamSchema>;
