import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * AppointmentStatus
 *
 * Type
 *
 * - Enumerated status values for an appointment
 * - May be extended further (e.g., "no_show", "rescheduled")
 */
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

/**
 * AppointmentAttributes
 *
 * Interface
 *
 * - Shape of the data required to create a new Appointment
 * - This is what the service/controller layer will accept when
 *    creating an appointment in the system
 */
export interface AppointmentAttributes {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

/**
 * AppointmentDocument
 *
 * Interface
 *
 * - Represents a single Appointment document as stored in MongoDB
 */
export interface AppointmentDocument extends Document, AppointmentAttributes {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AppointmentModel
 *
 * Type
 *
 * - Represents the Mongoose Model class for Appointment documents
 */
export type AppointmentModel = Model<AppointmentDocument>;

/**
 * appointmentSchema
 *
 * - Defines how Appointment documents are structured in MongoDB
 * - Connects to Patient and Doctor collections via ObjectId refs
 */
const appointmentSchema = new Schema<AppointmentDocument, AppointmentModel>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },

  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },

  startTime: {
    tyoe: Date,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },

  reason: {
    type: String,
    required: false,
    trim: true,
  },

  notes: {
    type: String,
    required: false,
    trim: true,
  },

  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    required: true,
    default: "scheduled",
  },
});

/**
 * Indexes
 *
 * - Compound index on doctorId + startTime is useful
 *    - Preventing / detecting double-booking at the same time
 *    - Efficient queries like "doctors appointments for a given day"
 */
appointmentSchema.index({ doctorId: 1, startTime: 1 });

/**
 * Appointment
 *
 * - The actual Mongoose model used by the rest of the backend
 */
const Appointment: AppointmentModel =
  (mongoose.models.Appointment as AppointmentModel) ??
  mongoose.model<AppointmentDocument, AppointmentModel>(
    "Appointment",
    appointmentSchema
  );

export default Appointment;
