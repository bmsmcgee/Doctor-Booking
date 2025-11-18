import type { Request, Response } from "express";
import type {
  AppointmentDocument,
  AppointmentStatus,
} from "../models/appointment.model.js";
import { NotFoundError, ValidationError } from "../errors/http.errors.js";
import {
  cancelAppointmentService,
  completeAppointmentService,
  createAppointmentService,
  getAppointmentsByIdService,
  getAppointmentsService,
  updateAppointmentService,
  type AppointmentUpdateInput,
} from "../services/appointment.service.js";

/**
 * allowedStatuses
 */
const allowedStatuses: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
];

/**
 * createAppointmentController
 *
 * Async Function
 *
 * HTTP handler for creating a new appointment
 *
 * Intended route:
 *  - POST /api/appointments
 *
 * Required Fields:
 *  - patientId
 *  - doctorId
 *  - startTime
 *  - endTime
 *
 * Optional Fields:
 *  - reason
 *  - notes
 */
export const createAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { patientId, doctorId, startTime, endTime, reason, notes } =
    req.body ?? {};

  if (!patientId || !doctorId || !startTime || !endTime) {
    throw new ValidationError(
      `Patient ID, doctor ID, start time, and end time are required.`
    );
  }

  const appointment = await createAppointmentService({
    patientId,
    doctorId,
    startTime,
    endTime,
    reason,
    notes,
  });

  res.status(201).json({
    message: `Appointment created successfully.`,
    appointment,
  });
};

/**
 * getAppointmentsController
 *
 * Async Function
 *
 * HTTP handler for fetching a list of appointments
 *
 * Intended route:
 *  - GET /api/appointments
 *
 * Query parameters (all optional):
 *  - patientId: string
 *  - doctorId: string
 *  - status: "scheduled" | "completed" | "cancelled"
 *  - from: ISO date/time string (filter by startTime >= from)
 *  - to: ISO date/time string (filter by startTime <= to)
 */
export const getAppointmentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { patientId, doctorId, status, from, to } = req.query;

  let statusFilter: AppointmentStatus | undefined;

  if (typeof status === "string") {
    if (!allowedStatuses.includes(status as AppointmentStatus)) {
      throw new ValidationError(
        `Invalid status value. Expected on of: ${allowedStatuses.join(", ")}.`
      );
    }
    statusFilter = status as AppointmentStatus;
  }

  const filter = {
    ...(typeof patientId === "string" ? { patientId } : {}),
    ...(typeof doctorId === "string" ? { doctorId } : {}),
    ...{ statusFilter },
    ...(typeof from === "string" ? { from } : {}),
    ...(typeof to === "string" ? { to } : {}),
  };

  const appointments: AppointmentDocument[] = await getAppointmentsService(
    filter
  );

  res.status(200).json({
    count: appointments.length,
    appointments,
  });
};

/**
 * getAppointmentByIdController
 *
 * Async Function
 *
 * HTTP handler for fetching a single appointment by ID
 *
 * Intended route:
 *  - GET /api/appointments/:id
 */
export const getAppointmentByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Appointment ID is required.`);
  }

  const appointment = await getAppointmentsByIdService(id);

  if (!appointment) {
    throw new NotFoundError(`Appointment not found.`);
  }

  res.status(200).json({
    appointment,
  });
};

/**
 * updateAppointmentController
 *
 * Async Function
 *
 * HTTP handler for partially updating an appointment
 *
 * Intended route:
 *  - PATCH /api/appointments/:id
 */
export const updateAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Appointment ID required.`);
  }

  const allowedFields = [
    "startTime",
    "endTime",
    "reason",
    "notes",
    "status",
  ] as const;

  const updates: AppointmentUpdateInput = {};

  const body = req.body as Record<string, unknown>;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = body[field];
      if (value !== undefined) {
        (updates as unknown as Record<string, unknown>)[field] = value;
      }
    }
  }

  if (Object.keys(updates).length == 0) {
    throw new ValidationError(`No updatable fields provided.`);
  }

  const appointment = await updateAppointmentService(id, updates);

  if (!appointment) {
    throw new NotFoundError(`Appointment not found.`);
  }

  res.status(200).json({
    message: "Appointment updated successfully.",
    appointment: appointment,
  });
};

/**
 * cancelAppointmentController
 *
 * Async Function
 *
 * HTTP handler for cancelling an appointment
 *
 * Intended route:
 *  - POST /api/appointments/:id/cancel
 */
export const cancelAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Appointment ID is required.`);
  }

  const cancel = await cancelAppointmentService(id);

  if (!cancel) {
    throw new NotFoundError(`Appointment not found.`);
  }

  res.status(200).json({
    message: `Appointment successfully cancelled.`,
    appointment: cancel,
  });
};

/**
 * completeAppointmentController
 *
 * Async Function
 *
 * HTTP handler for marking an appointment as completed
 *
 * Intended route:
 *  - POST /api/appointments/:id/complete
 */
export const completeAppointmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Appointment ID required.`);
  }

  const complete = await completeAppointmentService(id);

  if (!complete) {
    throw new NotFoundError(`Appointment not found`);
  }

  res.status(200).json({
    message: `Appointment marked as complete.`,
    appointment: complete,
  });
};
