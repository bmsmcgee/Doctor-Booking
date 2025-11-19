import bcrypt from "bcryptjs";
import { ConflictError } from "../errors/http.errors.js";
import type { UserDocument, UserRole } from "../models/user.model.js";
import User from "../models/user.model.js";

/**
 * UserCreateInput
 *
 * - Shape of the payload required to create a new user
 * - Accepts a plain-text passwordl; this service hashes it
 */
export interface UserCreateInput {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * UserUpdateInput
 *
 * - Fields allowed when updating an existing user
 * - All optional because updates are partial
 */
export interface UserUpdateInput {
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * createUserService
 *
 * Responsibilities:
 *  - Normalize email
 *  - Check for uniqueness on email
 *  - Hash password
 *  - Persist a new User document
 */
export const createUserService = async (
  input: UserCreateInput
): Promise<UserDocument> => {
  const email = input.email.trim().toLowerCase();

  const existing = await User.findOne({ email }).exec();

  if (existing) {
    throw new ConflictError(`Email already exists`);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await User.create({
    email,
    passwordHash,
    role: input.role,
  });

  return user;
};

/**
 * getUserByEmailService
 *
 * - Fetch a user by email
 * - Useful for login flows
 */
export const getUserByEmailService = async (
  email: string
): Promise<UserDocument | null> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).exec();

  return user;
};

/**
 * getUserByIdService
 *
 * - Fetch a user by MongoDB ObjectId
 */
export const getUserByIdService = async (
  id: string
): Promise<UserDocument | null> => {
  const user = await User.findById(id).exec();

  return user;
};

/**
 * updateUserService
 *
 * - Partially update an existing user
 * - If password is prvided, it is re-hashed
 */
export const updateUserService = async (
  id: string,
  update: UserUpdateInput
): Promise<UserDocument | null> => {
  const patch: Record<string, unknown> = {};

  if (update.email !== undefined) {
    patch.email = update.email;
  }

  if (update.password !== undefined) {
    const passwordHash = await bcrypt.hash(update.password, 10);
    patch.passwordHash = passwordHash;
  }

  if (update.role !== undefined) {
    patch.role = update.role;
  }

  if (update.isActive !== undefined) {
    patch.isActive = update.isActive;
  }

  const user = await User.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  }).exec();

  return user;
};

/**
 * deactivateUserService
 *
 * - Soft deactivation of a user by setting isActive = false
 */
export const deactivateUserService = async (
  id: string
): Promise<UserDocument | null> => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true }
  ).exec();

  return user;
};

/**
 * verifyPasswordService
 *
 * - Compare a plain-text password with a user's stored passwordHash
 */
export const verifyPasswordService = async (
  user: UserDocument,
  password: string
): Promise<boolean> => {
  return bcrypt.compare(password, user.passwordHash);
};
