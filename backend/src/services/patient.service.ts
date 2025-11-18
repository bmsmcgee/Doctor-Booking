import { ConflictError } from "../errors/http.errors.js";
import type {
  PatientAttributes,
  PatientDocument,
} from "../models/patient.model.js";
import Patient from "../models/patient.model.js";

/**
 * PatientCreateInput
 *
 * Type
 *
 * - Shape of the payload required to create a new patient
 * - Similar to PatientAttributes, but explicitly typed so that
 *    the service is decoupled from any future changes to the
 *    model's internal types if needed
 */
export type PatientCreateInput = PatientAttributes;

/**
 * PatientUpdateInput
 *
 * Type
 *
 * - Shape of the payload allowed when updating an existing patient.
 * - All fields are optional because this is a partial update
 */
export type PatientUpdateInput = Partial<
  PatientAttributes & { isActive: boolean }
>;

/**
 * PatientFilter
 *
 * Interface
 *
 * - Simple filter object used when querying for patients
 * - Can be extended
 */
export interface PatientFilter {
  isActive?: boolean;
}

/**
 * createPatientService
 *
 * Async Function
 *
 * Service function responsible for creating a new patient document
 *
 * Responsibilities:
 *  - Check for uniqueness on email
 *  - Delegate the actual creation to Mongoose
 */
export const createPatientService = async (
  input: PatientCreateInput
): Promise<PatientDocument> => {
  // Normalize email to lowercase for consistent uniqueness check
  const email = input.email.toLowerCase();

  const existing = await Patient.findOne({ email }).exec();

  if (existing) {
    throw new ConflictError("Email already exists!");
  }

  const patient = await Patient.create({
    ...input,
    email,
  });

  return patient;
};

/**
 * getPatientsService
 *
 * Async Function
 *
 * Service function for fetching a list of patients, optionally filtered
 *
 * Parameters
 *  - filter: optional filter object
 *
 * Returns:
 *  - Array of PatientDocument, sorted by creation date
 */
export const getPatientsService = async (
  filter: PatientFilter = {}
): Promise<PatientDocument[]> => {
  const query: Record<string, unknown> = {};

  if (typeof filter.isActive === "boolean") {
    query.isActive = filter.isActive;
  }

  const patients = await Patient.find(query).sort({ createdAt: -1 }).exec();

  return patients;
};

/**
 * getPatientByIdService
 *
 * Async Funtion
 *
 * Service function for fetching a single patient by MongoDB ObjectId
 *
 * Parameters:
 *  - id: the _id string of the patient document
 *
 * Returns:
 *  - PatientDocument if found, otherwise null
 */
export const getPatientByIdService = async (
  id: string
): Promise<PatientDocument | null> => {
  const patient = await Patient.findById(id).exec();

  return patient;
};

/**
 * getPatientByEmailService
 *
 * Async Function
 *
 * Service function for fetching asingle patient by email
 *
 * Useful for login flows or duplicate checks in higher layers
 *
 * Parameters:
 *  - email: patient's email
 *
 * Returns:
 *  - PatientDocument if found, otherwise null
 */
export const getPatientByEmailService = async (
  email: string
): Promise<PatientDocument | null> => {
  const normalizedEmail = email.toLowerCase();

  const patient = await Patient.findOne({ email: normalizedEmail }).exec();

  return patient;
};

/**
 * updatePatientService
 *
 * Async Function
 *
 * Service function for partially updating an existing patient
 *
 * Parameters:
 *  - id: the _id string of the patient to update
 *  - updates: the subset of fields to update
 *
 * Returns:
 *  - Updated PatientDocument if found, otherwise null
 */
export const updatePatientService = async (
  id: string,
  updates: PatientUpdateInput
): Promise<PatientDocument | null> => {
  const patch: PatientUpdateInput = { ...updates };
  if (patch.email) {
    patch.email = patch.email.toLowerCase();
  }

  const patient = await Patient.findByIdAndUpdate(id, patch, {
    new: true, // return the updated document instead of the original
    runValidators: true, // ensure updates respect schema validation rules
  }).exec();

  return patient;
};

/**
 * deactivatePatientService
 *
 * Async Function
 *
 * Service function for deactivating a patient
 *
 * Parameters:
 *  - id: the _id string of the patient
 *
 * Returns:
 *  - Updated PatientDocument if found, otherwise null
 */
export const deactivatePatientService = async (
  id: string
): Promise<PatientDocument | null> => {
  const patient = await Patient.findByIdAndUpdate(
    id,
    {
      isActive: false, // set isActive to false
    },
    {
      new: true, // return the updated document instead of the original
      runValidators: true, // ensure updates respect schema validation rules
    }
  ).exec();

  return patient;
};
