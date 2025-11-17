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
  const {
    firstName,
    lastName,
    email,
    specialty,
    phoneNumber,
    clinicName,
    notes,
  } = req.body ?? {};

  if (!firstName || !lastName || !email || !specialty) {
    throw new ValidationError(
      "First name, last name, email, and specialty are required."
    );
  }

  const doctor = await createDoctorService({
    firstName,
    lastName,
    email,
    specialty,
    phoneNumber,
    clinicName,
    notes,
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
  const { isActive, specialty } = req.query;

  let isActiveFilter: boolean | undefined;

  if (typeof isActive === "string") {
    if (isActive === "true") {
      isActiveFilter = true;
    } else if (isActive === "false") {
      isActiveFilter = false;
    } else
      throw new ValidationError(
        `Invalid value for isActive. Expected "true" or "false".`
      );
  }

  const filter = {
    ...(typeof isActiveFilter === "boolean"
      ? { isActive: isActiveFilter }
      : {}),
    ...(typeof specialty === "string" ? { specialty } : {}),
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
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Doctor ID is required`);
  }

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
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Doctor ID is required`);
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "specialty",
    "phoneNumber",
    "clinicName",
    "notes",
    "isActive",
  ] as const;

  const updates: DoctorUpdateInput = {};

  const body = req.body as Record<string, unknown>;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = body[field];
      if (value !== undefined) {
        (updates as unknown as Record<string, unknown>)[field] = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError(`No updatable fields provided.`);
  }

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
  const { id } = req.params;

  if (!id) {
    throw new ValidationError(`Doctor ID is required.`);
  }

  const doctor = await deactivateDoctorService(id);

  if (!doctor) {
    throw new NotFoundError(`Doctor not found.`);
  }

  res.status(200).json({
    message: `Doctor deactivated successfully.`,
    doctor: doctor,
  });
};
