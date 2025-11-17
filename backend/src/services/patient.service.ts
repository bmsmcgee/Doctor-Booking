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
 */
export interface PatientFilter {
  isActive?: boolean;
}

/**
 * createPatient
 *
 * Async Function
 *
 * Service function responsible for creating a new patient document
 *
 * Responsibilities:
 *  - Check for uniqueness on email
 *  - Delegate the actual creation to Mongoose
 *
 * Throws:
 *  - Error with with a message that a patient with the same
 *    email already exists
 */
export const createPatient = async (
  input: PatientCreateInput
): Promise<PatientDocument> => {
  // Normalize email to lowercase for consistent uniqueness check
  const email = input.email.toLowerCase();

  const existing = await Patient.findOne({ email }).exec();

  if (existing) {
    const error = new Error("PATIENT_EMAIL_EXISTS");
    throw error;
  }

  const patient = await Patient.create({
    ...input,
    email,
  });

  return patient;
};

/**
 * getPatients
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
export const getPatients = async (
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
 * getPatientById
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
export const getPatientById = async (
  id: string
): Promise<PatientDocument | null> => {
  const patient = await Patient.findById(id).exec();

  return patient;
};

/**
 * getPatientByEmail
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
export const getPatientByEmail = async (
  email: string
): Promise<PatientDocument | null> => {
  const normalizeEmail = email.toLowerCase();

  const patient = await Patient.findOne({ email: normalizeEmail }).exec();

  return patient;
};

/**
 * updatePatient
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
export const updatePatient = async (
  id: string,
  updates: PatientUpdateInput
): Promise<PatientDocument | null> => {
  // Normalize email if part of update
  if (updates.email) {
    updates.email = updates.email.toLowerCase();
  }

  const patient = await Patient.findByIdAndUpdate(id, updatePatient, {
    new: true, // return the updated document instead of the original
    runValidators: true, // ensure updates respect schema validation rules
  }).exec();

  return patient;
};

/**
 * deactivatePatient
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
export const deactivatePatient = async (
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
