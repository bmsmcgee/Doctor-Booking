import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * UserRole
 *
 * - Role used for authorization
 * - "patient" and "doctor" map naturally to existing Patient/Doctor models
 * - "admin" is for elevated access (full system view)
 */
export type UserRole = "patient" | "doctor" | "admin";

/**
 * UserAttributes
 *
 * - Shape of data required to create a new User
 * - Note: deliberately kept minimal and auth-focused
 */
export interface UserAttributes {
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive?: boolean;
}

/**
 * UserDocument
 *
 * - Represents a single User document stored in MongoDB
 */
export interface UserDocument extends Document, UserAttributes {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserModel
 *
 * - Mongoose Model type for User
 */
export type UserModel = Model<UserDocument>;

/**
 * userSchema
 *
 * Auth-focused scheman
 *  - unique email (lowercase)
 *  - passwordHash (already hashed, never plain text)
 *  - role for authorization
 *  - isActive for soft deactivation
 */
const userSchema = new Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { passwordHash, ...clean } = ret as any;
        return clean;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * User
 *
 * - The mongoose model used by the rest of the backend
 */
const User: UserModel =
  (mongoose.models.User as UserModel) ??
  mongoose.model<UserDocument, UserModel>("User", userSchema);

export default User;
