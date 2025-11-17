import { Router } from "express";
import {
  createDoctorController,
  deactivateDoctorController,
  getDoctorByIdController,
  getDoctorsController,
  updateDoctorController,
} from "../controllers/doctor.controller.js";

/**
 * doctorRouter
 *
 * Defines all HTTP routes related to Doctor resources.
 *
 * Intended to be mounted under a base path, e.g.:
 *   app.use("/api/doctors", doctorRouter);
 *
 * Which yields:
 *   POST   /api/doctors
 *   GET    /api/doctors
 *   GET    /api/doctors/:id
 *   PATCH  /api/doctors/:id
 *   DELETE /api/doctors/:id
 */
const doctorRouter = Router();

// Create a new doctor
// POST /api/doctors
doctorRouter.post("/", createDoctorController);

// Get list of doctors (optionally filtered via ?isActive= and/or ?specialty=)
// GET /api/doctors
doctorRouter.get("/", getDoctorsController);

// Get a single doctor by ID
// GET /api/doctors/:id
doctorRouter.get("/:id", getDoctorByIdController);

// Partially update a doctor
// PATCH /api/doctors/:id
doctorRouter.patch("/:id", updateDoctorController);

// Soft delete / deactivate a doctor
// DELETE /api/doctors/:id
doctorRouter.delete("/:id", deactivateDoctorController);

export default doctorRouter;
