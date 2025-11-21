import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * DoctorAttributes
 *
 * Interface
 *
 * - Shape of the data required to create a new Doctor
 */
export interface DoctorAttributes {
  userId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  phoneNumber?: string;
  clinicName?: string;
  notes?: string;
}

/**
 * DoctorDocument
 *
 * Interface
 *
 * - Represents a single doctor document stored in MongoDB
 */
export interface DoctorDocument extends Document, DoctorAttributes {
  isActive: boolean; // When false, doctor should not appear in booking lists
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DoctorModel
 *
 * - Represents the Mongoose Model class for Doctor documents
 */
export type DoctorModel = Model<DoctorDocument>;

/**
 * doctorSchema
 *
 * - Define how Doctor documents are structured in MongoDB
 */
const doctorSchema = new Schema<DoctorDocument, DoctorModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },

    clinicName: {
      type: String,
      required: false,
      trim: true,
    },

    notes: {
      type: String,
      required: false,
      trim: true,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,

    // When converting docs to JSON, include virtuals and remove internal fields
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * Doctor
 *
 * - The Mongoose model used by the rest of the backend
 * - `mongoose.models.Doctor` guard avoids recompiling the model
 *    during hot-reload in development.
 */
const Doctor: DoctorModel =
  (mongoose.models.Doctor as DoctorModel) ??
  mongoose.model<DoctorDocument, DoctorModel>("Doctor", doctorSchema);

export default Doctor;
