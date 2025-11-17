import { Router } from "express";
import {
  createPatientController,
  deactivatePatientController,
  getPatientByEmailController,
  getPatientByIdController,
  getPatientsController,
  updatePatientController,
} from "../controllers/patient.controller.js";

/**
 * patientRouter
 *
 * Defines all HTTP routes related to Patient resources
 *
 * Intended to be mounted under a base path, e.g.:
 *    app.use("/api/patients", patientRouter);
 *
 * Which results in the following:
 *    POST      /api/patients
 *    GET       /api/patients
 *    GET       /api/patients/:id
 *    GET       /api/patients/:email
 *    PATCH     /api/patients/:id
 *    DELETE    /api/patients/:id
 */
const patientRouter = Router();

// Create new patient
// POST /api/patients
patientRouter.post("/", createPatientController);

// Get a list of patients
// GET /api/patients
patientRouter.get("/", getPatientsController);

// Get a single patient by ID
// GET /api/patients/:id
patientRouter.get("/:id", getPatientByIdController);

// Get a single patient by ID
// GET /api/patients/:email
patientRouter.get("/:email", getPatientByEmailController);

// Partially update a patients information
// PATCH /api/patients/:id
patientRouter.patch("/:id", updatePatientController);

// Deactivate a patient
// DELETE /api/patients/:id
patientRouter.delete("/:id", deactivatePatientController);

export default patientRouter;
