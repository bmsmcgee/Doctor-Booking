import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Shape that defines the creation of a new patient
 */
export interface PatientAttributes {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  notes?: string;
}

/**
 * Represent a single patient document stored in MongoDB
 */
export interface PatientDocument extends Document, PatientAttributes {
  isActive: boolean; // Flag for soft-deactivation
  createdAt: Date; // When the patient record was first created
  updatedAt: Date; // Last time any field was modified
}

/**
 * Represent the Mongoose Model class for Patient documents
 */
type PatientModel = Model<PatientDocument>;

/**
 * Define how Patient documents are structured in MongoDB
 */
const patientSchema = new Schema<PatientDocument, PatientModel>(
  {
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

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
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
 * The Mongoose model for Patient used by the backend.
 * `mongoose.models.Patient` guards against recompiling the model
 *    when using hot-reload in development.
 */
const Patient: PatientModel =
  (mongoose.models.Patient as PatientModel) ??
  mongoose.model<PatientDocument, PatientModel>("Patient", patientSchema);

export default Patient;
