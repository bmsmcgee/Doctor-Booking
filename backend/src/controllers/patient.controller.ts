import type { Request, Response, NextFunction } from "express";
import Patient, { type PatientDocument } from "../models/patient.model.js";

/**
 * createPatient
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
export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, phoneNumber, dateOfBirth, notes } =
      req.body ?? {};

    if (!firstName || !lastName || !email || !phoneNumber || dateOfBirth) {
      res.status(400).json({
        error:
          "firstName, lastName, email, phone number, and D.O.B. are required.",
      });
      return;
    }

    const existingPatient = await Patient.findOne({ email }).exec();

    if (existingPatient) {
      res.status(400).json({
        error: "A patient with this email already exists.",
      });
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      notes,
    };

    const patient = await Patient.create(payload);

    res.status(201).json({
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getPatients
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
export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.query;

    const filter: Record<string, unknown> = {};

    if (typeof isActive === "string") {
      if (isActive === "true") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    const patients: PatientDocument[] = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getPatientById
 *
 * HTTP handler for fetching a single patient by MongoDB ObjectID.
 *
 * Intended Route:
 *    GET /api/patients/:id
 */
export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).exec();

    if (!patient) {
      res.status(404).json({
        error: "Patient not found.",
      });
      return;
    }

    res.status(200).json({
      patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * updatePatient
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
export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "notes",
      "isActive",
    ] as const;

    const updates: Partial<Record<(typeof allowedFields)[number], unknown>> =
      {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();

    if (!updatedPatient) {
      res.status(404).json({
        error: "Patient not found.",
      });
      return;
    }

    res.status(200).json({
      message: "Patient updated successfully.",
      patient: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * deactivatePatient
 *
 * Soft delete / deactivate a patient by setting isActive = false
 *
 * Intended Routes:
 *    DELETE /api/patients/:id
 */
export const deactivatedPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { isActive: false },
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!updatePatient) {
      res.status(404).json({
        error: "Patient not found",
      });
      return;
    }

    res.status(200).json({
      error: "Patient deactivated successfully.",
      patient: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};
