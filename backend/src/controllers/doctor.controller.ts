import * as z from "zod";
import type { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../errors/http.errors.js";
import {
  createDoctorService,
  deactivateDoctorService,
  getDoctorByIdService,
  getDoctorsService,
  updateDoctorService,
  type DoctorUpdateInput,
} from "../services/doctor.service.js";
import type { DoctorDocument } from "../models/doctor.model.js";
import {
  createDoctorSchema,
  doctorIdParamSchema,
  getDoctorQuerySchema,
  updateDoctorSchema,
  type CreateDoctorSchema,
  type GetDoctorQuerySchema,
  type UpdateDoctorSchema,
} from "../validation/doctor.validation.js";

/**
 * createDoctorController
 *
 * HTTP handler for creating anew doctor
 *
 * Intended route:
 *  - POST /api/doctors
 *
 * Required Fields:
 *  - firstName
 *  - lastName
 *  - email
 *  - specialty
 *
 * Optional Fields:
 *  - phoneNumber
 *  - clinicName
 *  - notes
 */
export const createDoctorController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createDoctorSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid doctor data`,
      z.flattenError(parsed.error)
    );
  }

  const input: CreateDoctorSchema = parsed.data;

  const doctor = await createDoctorService({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    specialty: input.specialty,
    ...(input.phoneNumber !== undefined
      ? { phoneNumber: input.phoneNumber }
      : {}),
    ...(input.clinicName !== undefined ? { clinicName: input.clinicName } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  res.status(201).json({
    message: "Doctor created successfully",
    doctor,
  });
};

/**
 * getDoctorsController
 *
 * Async Function
 *
 * HTTP handler for fetching a list of doctors
 *
 * Intended route:
 *  - GET /api/doctors
 *
 * Query parameters (all optional):
 *  - isActive: "true" | "false"
 *  - specialty: string
 *
 * Examples:
 *  - GET /api/doctors
 *  - GET /api/doctors?isActive=true
 *  - GET /api/doctors?specialty=Family%20Medicine
 */
export const getDoctorsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = getDoctorQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid query parameters`,
      z.flattenError(parsed.error)
    );
  }

  const query: GetDoctorQuerySchema = parsed.data;

  let isActiveFilter: boolean | undefined;

  if (typeof query.isActive === "string") {
    isActiveFilter = query.isActive === "true";
  }

  const filter = {
    ...(typeof isActiveFilter === "boolean"
      ? { isActive: isActiveFilter }
      : {}),
    ...(typeof query.specialty === "string"
      ? { specialty: query.specialty }
      : {}),
  };

  const doctors: DoctorDocument[] = await getDoctorsService(filter);

  res.status(200).json({
    count: doctors.length,
    doctors,
  });
};

/**
 * getDocterByIdController
 *
 * Async Function
 *
 * HTTP handler for fethcing a single doctor by MongoDB ObjectId
 *
 * Intended route:
 *  - GET /api/doctors/:id
 */
export const getDoctorByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = doctorIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid doctor ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

  const doctor = await getDoctorByIdService(id);

  if (!doctor) {
    throw new NotFoundError(`Doctor is not found.`);
  }

  res.status(200).json({
    doctor,
  });
};

/**
 * updateDoctorController
 *
 * Async Function
 *
 * HTTP handler for partially updating a doctor
 *
 * Intended route:
 *  - PATCH /api/doctors/:id
 *
 * Body can include any subset of:
 *   {
 *     "firstName": "...",
 *     "lastName": "...",
 *     "email": "...",
 *     "specialty": "...",
 *     "phoneNumber": "...",
 *     "clinicName": "...",
 *     "notes": "...",
 *     "isActive": true/false
 *   }
 */
export const updateDoctorController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const idParsed = doctorIdParamSchema.safeParse(req.params);

  if (!idParsed.success) {
    throw new ValidationError(
      `Invalid doctor ID`,
      z.flattenError(idParsed.error)
    );
  }

  const { id } = idParsed.data;

  const bodyParsed = updateDoctorSchema.safeParse(req.body);

  if (!bodyParsed.success) {
    throw new ValidationError(
      `Invalid update payload`,
      z.flattenError(bodyParsed.error)
    );
  }

  const updateFromSchema: UpdateDoctorSchema = bodyParsed.data;

  const updates: DoctorUpdateInput =
    updateFromSchema as unknown as DoctorUpdateInput;

  const doctor = await updateDoctorService(id, updates);

  if (!doctor) {
    throw new NotFoundError(`Doctor not found.`);
  }

  res.status(200).json({
    message: "Doctor updated successfully.",
    doctor: doctor,
  });
};

/**
 * deactivateDoctorController
 *
 * Soft delete / deactivate a doctor by setting isActive = false
 *
 * Intended route:
 *  - DELETE /api/doctors/:id
 */
export const deactivateDoctorController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = doctorIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid doctor ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

  const doctor = await deactivateDoctorService(id);

  if (!doctor) {
    throw new NotFoundError(`Doctor not found.`);
  }

  res.status(200).json({
    message: `Doctor deactivated successfully.`,
    doctor: doctor,
  });
};
