import type { Request, Response } from "express";
import type { PatientDocument } from "../models/patient.model.js";
import { NotFoundError, ValidationError } from "../errors/http.errors.js";
import {
  createPatientService,
  deactivatePatientService,
  getPatientByEmailService,
  getPatientByIdService,
  getPatientsService,
  updatePatientService,
  type PatientUpdateInput,
} from "../services/patient.service.js";

/**
 * createPatientController
 *
 * HTTP handler for creating a new patient.
 *
 * Intended route:
 *    POST /api/patients
 *
 * Expected JSON body:
 *   {
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john.doe@example.com",
 *     "phoneNumber": "+1-555-123-4567",
 *     "dateOfBirth": "1990-05-10",
 *     "notes": "Prefers morning appointments"// optional
 *   }
 */
export const createPatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, phoneNumber, dateOfBirth, notes } =
    req.body ?? {};

  if (!firstName || !lastName || !email || !phoneNumber || !dateOfBirth) {
    throw new ValidationError(
      "firstName, lastName, email, phone number, and D.O.B. are required."
    );
  }

  const patient = await createPatientService({
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    notes,
  });

  res.status(201).json({
    message: "Patient created successfully",
    patient,
  });
};

/**
 * getPatientsController
 *
 * HTTP handler for fetching a list of patients.
 *
 * Intended route:
 *    GET /api/patients
 *
 * Query params (all optional):
 *    isActive: "true" | "false"
 *
 * Example:
 *    GET /api/patients?isActive=true
 */
export const getPatientsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { isActive } = req.query;

  let isActiveFilter: boolean | undefined;

  if (typeof isActive === "string") {
    if (isActive === "true") {
      isActiveFilter = true;
    } else if (isActive === "false") {
      isActiveFilter = false;
    } else {
      throw new ValidationError(
        'Invalid value for isActive. Expected "true" or "false".'
      );
    }
  }

  const filter =
    typeof isActiveFilter === "boolean" ? { isActive: isActiveFilter } : {};

  const patients: PatientDocument[] = await getPatientsService(filter);

  res.status(200).json({
    count: patients.length,
    patients,
  });
};

/**
 * getPatientByIdController
 *
 * HTTP handler for fetching a single patient by MongoDB ObjectID.
 *
 * Intended Route:
 *    GET /api/patients/:id
 */
export const getPatientByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError("Patient ID is required.");
  }

  const patient = await getPatientByIdService(id);

  if (!patient) {
    throw new NotFoundError("Patient is not found.");
  }

  res.status(200).json({
    patient,
  });
};

/**
 * getPatientByEmailController
 *
 * HTTP handler for fetching a single patient by email
 *
 * Intended Route:
 *    GET /api/patients/:email
 */
export const getPatientByEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.params;

  if (!email) {
    throw new ValidationError("Patient email is required.");
  }

  const patient = await getPatientByEmailService(email);

  if (!patient) {
    throw new NotFoundError("Patient is not found.");
  }

  res.status(200).json({
    patient,
  });
};

/**
 * updatePatientController
 *
 * HTTP handler for partially updating a patient.
 *
 * Intended Route:
 *    PATCH /api/patients/:id
 *
 * Body can include any subset of:
 *   {
 *     "firstName": "...",
 *     "lastName": "...",
 *     "email": "...",
 *     "phoneNumber": "...",
 *     "dateOfBirth": "...",
 *     "notes": "...",
 *     "isActive": true/false
 *   }
 */
export const updatePatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError("Patient ID is required.");
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "dateOfBirth",
    "notes",
    "isActive",
  ] as const;

  const updates: PatientUpdateInput = {};
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
    throw new ValidationError("No updatable fields provided.");
  }

  const patient = await updatePatientService(id, updates);

  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }

  res.status(200).json({
    message: "Patient updated successfully.",
    patient: patient,
  });
};

/**
 * deactivatePatientController
 *
 * Soft delete / deactivate a patient by setting isActive = false
 *
 * Intended Routes:
 *    DELETE /api/patients/:id
 */
export const deactivatePatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError("Patient ID is required.");
  }

  const patient = await deactivatePatientService(id);

  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }

  res.status(200).json({
    message: "Patient deactivated successfully.",
    patient: patient,
  });
};
