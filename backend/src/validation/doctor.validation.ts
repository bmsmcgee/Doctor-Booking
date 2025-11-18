import * as z from "zod";

/**
 * createDoctorSchema
 *
 * Schema for creating a doctor
 */
export const createDoctorSchema = z.object({
  firstName: z.string().trim().min(1, { error: "firstName is required" }),
  lastName: z.string().trim().min(1, { error: "lastName is required" }),
  email: z
    .email({ error: "email is not valid" })
    .min(1, { error: "email is required" })
    .toLowerCase(),
  specialty: z.string().trim().min(1, { error: "specialty is required" }),
  phoneNumber: z.optional(
    z.string().trim().min(7, { error: "Must be a valid phone number" })
  ),
  clinicName: z.optional(z.string().trim()),
  notes: z.optional(
    z
      .string()
      .trim()
      .max(1000, { error: "Notes cannot exceed 1000 characters" })
  ),
});

export type CreateDoctorSchema = z.infer<typeof createDoctorSchema>;

/**
 * getDoctorQuerySchema
 *
 * Schema for doctor list query parameters
 *
 * - isActive must be "true" or "false" if present
 * - specialty is optional, non-empty string if provided
 */
export const getDoctorQuerySchema = z.object({
  isActive: z.optional(z.enum(["true", "false"])),
  specialty: z.optional(z.string().trim().min(1)),
});

export type GetDoctorQuerySchema = z.infer<typeof getDoctorQuerySchema>;

/**
 * doctorIdParamSchema
 *
 * Schema for routes where :id is in params
 */
export const doctorIdParamSchema = z.object({
  id: z.string().trim().min(1, { error: "Doctor ID is required" }),
});

/**
 * updateDoctorSchema
 *
 * Schema for updating a doctor
 *
 * - All fields are optional
 * - isActive boolean allowed
 * - At least one field must be present
 */
export const updateDoctorSchema = createDoctorSchema
  .partial()
  .extend({
    isActive: z.optional(z.boolean()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "No updatable fields provided",
  });

export type UpdateDoctorSchema = z.infer<typeof updateDoctorSchema>;
