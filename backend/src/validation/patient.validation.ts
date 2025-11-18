import * as z from "zod";

/**
 * createPatientSchema
 *
 * Schema for creating a patient.
 * - All core fields required.
 * - dateOfBirth coerced to a Date.
 */
export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1, { error: "firstName is required" }),
  lastName: z.string().trim().min(1, { error: "lastName is required" }),
  email: z
    .email({
      error: "Email is not valid",
    })
    .min(1, { error: "Email is required" }),
  phoneNumber: z.string().trim().min(1, { error: "phoneNumber is required" }),
  dateOfBirth: z.coerce.date({
    error: "dateOfBirth must be a valid date",
  }),
  notes: z.optional(
    z.string().trim().max(1000, {
      error: "Notes cannot exceed 1000 characters",
    })
  ),
});

export type CreatePatientSchema = z.infer<typeof createPatientSchema>;

/**
 * getPatientsQuerySchema
 *
 * Schema for patient list query parameters.
 *
 * - isActive must be "true" or "false" if present.
 */
export const getPatientsQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
});

export type GetPatientsQuery = z.infer<typeof getPatientsQuerySchema>;

/**
 * idParamSchema
 *
 * Schema for routes where :id is in params.
 */
export const idParamSchema = z.object({
  id: z.string().trim().min(1, { error: "Patient ID is required" }),
});

/**
 * emailParamSchema
 *
 * Schema for routes where :email is in params.
 *
 * IMPORTANT:
 *   - Key must be "email" to match req.params.email.
 */
export const emailParamSchema = z.object({
  email: z.email({ error: "A valid email is required" }),
});

/**
 * updatePatientSchema
 *
 * Schema for updating a patient.
 *
 * - All fields optional.
 * - isActive boolean allowed.
 * - At least one field must be present.
 */
export const updatePatientSchema = createPatientSchema
  .partial()
  .extend({
    isActive: z.optional(z.boolean()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "No updatable fields provided.",
  });

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
