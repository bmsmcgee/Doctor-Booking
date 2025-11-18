import * as z from "zod";
import type { AppointmentStatus } from "../models/appointment.model.js";

/**
 * Valid status values for appointment
 */
const allowedStatuses: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
];

/**
 * createAppointmentSchema
 *
 * Schema for creating an appointment
 */
export const createAppointmentSchema = z.object({
  patientId: z.string().trim().min(1, { error: "patientId is required" }),
  doctorId: z.string().trim().min(1, { error: "doctorId is required" }),
  startTime: z.coerce.date({ error: "startTime must be a valid date" }),
  endTime: z.coerce.date({ error: "endTime must be a valid date" }),
  reason: z.optional(
    z.string().trim().max(250, { error: "reason cannot exceed 250 characters" })
  ),
  notes: z.optional(
    z
      .string()
      .trim()
      .max(1000, { error: "notes cannot exceed 2000 characters" })
  ),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;

/**
 * getAppointmentQuerySchema
 *
 * Schema for appointment list query parameters
 *
 * All optional:
 *  - patientId
 *  - doctorId
 *  - status
 *  - from
 *  - to
 */
export const getAppointmentQuerySchema = z.object({
  patientId: z.optional(
    z.string().trim().min(1, { error: "patientId cannot be empty" })
  ),
  doctorId: z.optional(
    z.string().trim().min(1, { error: "doctorId cannot be empty" })
  ),
  status: z.optional(
    z.enum(allowedStatuses as [AppointmentStatus, ...AppointmentStatus[]])
  ),
  from: z.optional(z.coerce.date({ error: "from must be a valid date" })),
  to: z.optional(z.coerce.date({ error: "to must be a valid date" })),
});

export type GetAppointmentQuerySchema = z.infer<
  typeof getAppointmentQuerySchema
>;

/**
 * appointmentIdParamSchema
 *
 * Schema for routes where :id is in params
 */
export const appointmentIdParamSchema = z.object({
  id: z.string().trim().min(1, { error: "Appointment ID is required" }),
});

/**
 * updateAppointmentSchema
 *
 * Schema for updating an appointment
 *
 * - All fields optional
 * - At least one much be provided
 */
export const updateAppointmentSchema = z
  .object({
    startTime: z.optional(
      z.coerce.date({ error: " startTime must be a valid date" })
    ),
    endTime: z.optional(
      z.coerce.date({ error: "endTime must be a valid date" })
    ),
    reason: z.optional(
      z
        .string()
        .trim()
        .max(250, { error: "reason cannot exceed 250 characters" })
    ),
    notes: z.optional(
      z
        .string()
        .trim()
        .max(2000, { error: "notes cannot exceed over 1000 characters" })
    ),
    status: z.optional(
      z.enum(allowedStatuses as [AppointmentStatus, ...AppointmentStatus[]])
    ),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "No updatable fields provided",
  });

export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;
