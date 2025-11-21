import * as z from "zod";
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
import {
  createPatientSchema,
  emailParamSchema,
  getPatientsQuerySchema,
  idParamSchema,
  updatePatientSchema,
  type CreatePatientSchema,
  type GetPatientsQuery,
  type UpdatePatientInput,
} from "../validation/patient.validation.js";

/**
 * createPatientController
 *
 * HTTP handler for creating a new patient.
 *
 * Intended route:
 *    POST /api/patients
 */
export const createPatientController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createPatientSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid patient data.`,
      z.flattenError(parsed.error)
    );
  }

  const input: CreatePatientSchema = parsed.data;

  const patient = await createPatientService({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneNumber: input.phoneNumber,
    dateOfBirth: input.dateOfBirth,
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
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
  const parsed = getPatientsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid query parameter for isActive. Expected "true" or "false"`,
      z.flattenError(parsed.error)
    );
  }

  const query: GetPatientsQuery = parsed.data;

  let isActiveFilter: boolean | undefined;

  if (typeof query.isActive === "string") {
    isActiveFilter = query.isActive === "true";
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
  const parsed = idParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid patient ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

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
  const parsed = emailParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid patient email.",
      z.flattenError(parsed.error)
    );
  }

  const { email } = parsed.data;

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
  const idParsed = idParamSchema.safeParse(req.body);

  if (!idParsed.success) {
    throw new ValidationError(
      `Invalid patient ID`,
      z.flattenError(idParsed.error)
    );
  }

  const { id } = idParsed.data;

  const bodyParsed = updatePatientSchema.safeParse(req.body);

  if (!bodyParsed.success) {
    throw new ValidationError(
      `Invalid update payload`,
      z.flattenError(bodyParsed.error)
    );
  }

  const updatesFromSchema: UpdatePatientInput = bodyParsed.data;

  const update: PatientUpdateInput =
    updatesFromSchema as unknown as PatientUpdateInput;

  const patient = await updatePatientService(id, update);

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
  const parsed = idParamSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new ValidationError(
      `Invalid patient ID`,
      z.flattenError(parsed.error)
    );
  }

  const { id } = parsed.data;

  const patient = await deactivatePatientService(id);

  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }

  res.status(200).json({
    message: "Patient deactivated successfully.",
    patient: patient,
  });
};
