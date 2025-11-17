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
