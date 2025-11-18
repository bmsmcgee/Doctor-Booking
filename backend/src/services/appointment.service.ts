import { ConflictError, ValidationError } from "../errors/http.errors.js";
import type {
  AppointmentDocument,
  AppointmentStatus,
} from "../models/appointment.model.js";
import Appointment from "../models/appointment.model.js";

/**
 * AppointmentCreateInput
 *
 * Interface
 *
 * - Shape of the payload required to create a new appointment
 */
export interface AppointmentCreateInput {
  patientId: string;
  doctorId: string;
  startTime: Date | string;
  endTime: Date | string;
  reason?: string;
  notes?: string;
}

/**
 * AppointmentUpdateInput
 *
 * Interface
 *
 * - Shape of the payload allowed when updating an existing appointment
 */
export interface AppointmentUpdateInput {
  startTime?: Date | string;
  endTime?: Date | string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

/**
 * AppointmentFilter
 *
 * Interface
 *
 * - Used to query appointments
 * - Can filter by:
 *    - patientId
 *    - doctorId
 *    - status
 *    - time range
 */
export interface AppointFilter {
  patientId?: string;
  doctorId?: string;
  status?: string;
  from?: Date | string;
  to?: Date | string;
}

/**
 * createAppointmentService
 *
 * Async Function
 *
 * Responsibilities:
 *  - Normalize dates
 *  - Validate that endTime is after startTime
 *  - Ensure there is no overlapping appointment for the same doctor
 *    in the requested time range
 *  - Persist the new appointment document
 */
export const createAppointmentService = async (
  input: AppointmentCreateInput
): Promise<AppointmentDocument> => {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError(`Appointment time is invalid.`);
  }

  if (end <= start) {
    throw new ValidationError(`Appointment end time must be after start time.`);
  }

  // Check for overlapping appointments for the same doctor
  const existing = await Appointment.findOne({
    doctorId: input.doctorId,
    startTime: { $lt: end },
    endTime: { $gt: start },
    status: { $ne: "cancelled" },
  }).exec();

  if (existing) {
    throw new ConflictError(`Appointment has time conflict.`);
  }

  const appointment = await Appointment.create({
    patientId: input.patientId,
    doctorId: input.doctorId,
    startTime: start,
    endTime: end,
    reason: input.reason,
    notes: input.notes,
    status: "scheduled",
  });

  return appointment;
};

/**
 * getAppointmentsService
 *
 * Async Function
 *
 * Service function for fethcing appointments with optional filters
 *
 * Parameters:
 *  - filter:
 *    - patientId?
 *    - doctorId?
 *    - status?
 *    - from?
 *    - to?
 */
export const getAppointmentsService = async (
  filter: AppointFilter = {}
): Promise<AppointmentDocument[]> => {
  const query: Record<string, unknown> = {};

  if (filter.patientId) {
    query.patientId = filter.patientId;
  }

  if (filter.doctorId) {
    query.doctorId = filter.doctorId;
  }

  if (filter.status) {
    query.status = filter.status;
  }

  if (filter.from || filter.to) {
    const startTimeRange: Record<string, Date> = {};

    if (filter.from) {
      const fromDate = new Date(filter.from);
      if (!Number.isNaN(fromDate.getTime())) {
        startTimeRange.$gte = fromDate;
      }
    }

    if (filter.to) {
      const toDate = new Date(filter.to);
      if (!Number.isNaN(toDate.getTime())) {
        startTimeRange.$lte = toDate;
      }
    }

    if (Object.keys(startTimeRange).length > 0) {
      query.startTime = startTimeRange;
    }
  }

  const appointments = await Appointment.find(query)
    .sort({ startTime: 1 })
    .exec();

  return appointments;
};

/**
 * getAppointmentsByIdService
 *
 * Async Function
 *
 * Service function for fetching a single appointment by its ID
 *
 * Parameters:
 *  - id: the _id string of the appointment document
 *
 * Returns:
 *  - AppointmentDocument if found, otherwise null
 */
export const getAppointmentsByIdService = async (
  id: string
): Promise<AppointmentDocument | null> => {
  const appointment = await Appointment.findById(id).exec();
  return appointment;
};

/**
 * updateAppointmentService
 *
 * Async Function
 *
 * Service function for partially updating an appointment
 *
 * Parameters:
 *  - id: the _id string of the appointment to update
 *  - updates: subset of appointment fields to update
 *
 * Returns:
 *  - Updated AppointmentDocument if found, otherwise null
 */
export const updateAppointmentService = async (
  id: string,
  updates: AppointmentUpdateInput
): Promise<AppointmentDocument | null> => {
  const patch: Record<string, unknown> = {};

  if (updates.startTime !== undefined) {
    const start = new Date(updates.startTime);

    if (Number.isNaN(start.getTime())) {
      throw new ValidationError(`Invalid appointment start time.`);
    }

    patch.startTime = start;
  }

  if (updates.endTime !== undefined) {
    const end = new Date(updates.endTime);

    if (Number.isNaN(end.getTime())) {
      throw new ValidationError(`Invalid appointment end time.`);
    }

    patch.endTime = end;
  }

  if (updates.reason !== undefined) {
    patch.reason = updates.reason;
  }

  if (updates.notes !== undefined) {
    patch.notes = updates.notes;
  }

  if (updates.status !== undefined) {
    patch.status = updates.status;
  }

  const appointment = await Appointment.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  }).exec();

  return appointment;
};

/**
 * cancelAppointmentService
 *
 * Async Function
 *
 * Convenience function for marking an appointment cancelled
 *
 * Parameters:
 *  - id: the _id string of the appointment to cancel
 *
 * Returns:
 *  - Updated AppointmentDocument if found, otherwise null
 */
export const cancelAppointmentService = async (
  id: string
): Promise<AppointmentDocument | null> => {
  const appointment = Appointment.findByIdAndUpdate(
    id,
    { status: "cancelled" satisfies AppointmentStatus },
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  return appointment;
};

/**
 * completeAppointmentService
 *
 * Async Function
 *
 * Convenience function for marking an appointment complete
 *
 * Parameters:
 *  - id: the _id string of the appointment to cancel
 *
 * Returns:
 *  - Updated AppointmentDocument if found, otherwise null
 */
export const completeAppointmentService = async (
  id: string
): Promise<AppointmentDocument | null> => {
  const appointment = Appointment.findByIdAndUpdate(
    id,
    { status: "completed" satisfies AppointmentStatus },
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  return appointment;
};
