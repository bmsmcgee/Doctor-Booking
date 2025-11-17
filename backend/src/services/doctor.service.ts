import { ConflictError } from "../errors/http.errors.js";
import type {
  DoctorAttributes,
  DoctorDocument,
} from "../models/doctor.model.js";
import Doctor from "../models/doctor.model.js";

/**
 * DoctorCreateInput
 *
 * Type
 *
 * - Shape of the payload required to create a new doctor
 * - Mirrors DoctorAttributes so that the service API is explicit
 */
export type DoctorCreateInput = DoctorAttributes;

/**
 * DoctorUpdateInput
 *
 * Type
 *
 * - Shape of the payload allowed when updating an existing doctor
 * - All fields are optional because this is a partial update
 */
export type DoctorUpdateInput = Partial<
  DoctorAttributes & { isActive: boolean }
>;

/**
 * DoctorFilter
 *
 * Interface
 *
 * - Simple filter object used when querying for doctors
 * - Can be extended
 */
export interface DoctorFilter {
  isActive?: boolean;
  specialty?: string;
}

/**
 * createDoctor
 *
 * Async Function
 *
 * Service function responsible for creating a new Doctor Document
 */
export const createDoctorService = async (
  input: DoctorCreateInput
): Promise<DoctorDocument> => {
  const email = input.email.toLowerCase();

  const existing = await Doctor.findOne({ email }).exec();

  if (existing) {
    throw new ConflictError("Email already exists!");
  }

  const doctor = await Doctor.create({
    ...input,
    email,
  });

  return doctor;
};

/**
 * getDoctorsService
 *
 * Async Function
 *
 * Service function for fetching a list of doctors, optionally filtered
 *
 * Parameters:
 *  - filter: optional filter object
 *
 * Returns:
 *  - Array of DoctorDocument, sorted by creation date (newest first)
 */
export const getDoctorsService = async (
  filter: DoctorFilter = {}
): Promise<DoctorDocument[]> => {
  const query: Record<string, unknown> = {};

  if (typeof filter.isActive === "boolean") {
    query.isActive = filter.isActive;
  }

  if (filter.specialty) {
    const normalizedSpecialty = filter.specialty.toLowerCase();
    query.specialty = normalizedSpecialty;
  }

  const doctors = await Doctor.find(query).sort({ createdAt: -1 }).exec();

  return doctors;
};

/**
 * getDoctorByIdService
 *
 * Async Function
 *
 * Service function for fetching a single doctor by MongoDB ObjectId
 *
 * Parameters:
 *  - id: the _id string of the doctor document
 *
 * Returns:
 *  - DoctorDocument if found, otherwise null
 */
export const getDoctorByIdService = async (
  id: string
): Promise<DoctorDocument | null> => {
  const doctor = await Doctor.findById(id).exec();

  return doctor;
};

/**
 * updateDoctorService
 *
 * Async Function
 *
 * Service function for partially updating an existing doctor
 *
 * Parameters:
 *  - id: the _id string of the doctor document
 *  - updates: subset of fields to update
 *
 * Return:
 *  - Updated DoctorDocument if found, otherwise null
 */
export const updateDoctorService = async (
  id: string,
  updates: DoctorUpdateInput
): Promise<DoctorDocument | null> => {
  if (updates.email) {
    updates.email = updates.email.toLowerCase();
  }

  const doctor = await Doctor.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).exec();

  return doctor;
};

/**
 * deactivateDoctorService
 *
 * Async Function
 *
 * Implementation detail:
 *  - Sets isActive = false instead of removing the document
 *
 * Parameters:
 *  - id: the _id string of the doctor to deactivate
 *
 * Returns:
 *  - Updated DoctorDocument if found, otherwise null
 */
export const deactivateDoctorService = async (
  id: string
): Promise<DoctorDocument | null> => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  return doctor;
};
