import * as z from "zod";
import type { Request, Response } from "express";
import type { AppointmentDocument } from "../models/appointment.model.js";
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
import {
  appointmentIdParamSchema,
  createAppointmentSchema,
  getAppointmentQuerySchema,
  updateAppointmentSchema,
  type CreateAppointmentSchema,
  type GetAppointmentQuerySchema,
  type UpdateAppointmentSchema,
} from "../validation/appointment.validation.js";

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
  const parsed = createAppointmentSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid appointment data`,
      z.flattenError(parsed.error)
    );
  }

  const input: CreateAppointmentSchema = parsed.data;

  const appointment = await createAppointmentService({
    patientId: input.patientId,
    doctorId: input.doctorId,
    startTime: input.startTime,
    endTime: input.endTime,
    ...(input.reason !== undefined ? { reason: input.reason } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
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
  const parsed = getAppointmentQuerySchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid query parameters`,
      z.flattenError(parsed.error)
    );
  }

  const query: GetAppointmentQuerySchema = parsed.data;

  const filter = {
    ...(query.patientId ? { patientId: query.patientId } : {}),
    ...(query.doctorId ? { doctorId: query.doctorId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.from ? { from: query.from } : {}),
    ...(query.to ? { to: query.to } : {}),
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
  const parsed = appointmentIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid appointment ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

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
  const idParsed = appointmentIdParamSchema.safeParse(req.params);

  if (!idParsed.success) {
    throw new ValidationError(
      `Invalid appointment ID`,
      z.flattenError(idParsed.error)
    );
  }

  const { id } = idParsed.data;

  const bodyParsed = updateAppointmentSchema.safeParse(req.body);

  if (!bodyParsed.success) {
    throw new ValidationError(
      `Invalid update payload`,
      z.flattenError(bodyParsed.error)
    );
  }

  const updateFromSchema: UpdateAppointmentSchema = bodyParsed.data;

  const updates: AppointmentUpdateInput =
    updateFromSchema as unknown as AppointmentUpdateInput;

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
  const parsed = appointmentIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid appointment ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

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
  const parsed = appointmentIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid appointment ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

  const complete = await completeAppointmentService(id);

  if (!complete) {
    throw new NotFoundError(`Appointment not found`);
  }

  res.status(200).json({
    message: `Appointment marked as complete.`,
    appointment: complete,
  });
};
