import { Router } from "express";
import {
  cancelAppointmentController,
  completeAppointmentController,
  createAppointmentController,
  getAppointmentByIdController,
  getAppointmentsController,
  updateAppointmentController,
} from "../controllers/appointment.controller.js";

/**
 * appointmentRouter
 *
 * Defines all HTTP routes related to Appointment resources.
 *
 * Intended to be mounted under a base path, e.g.:
 *   app.use("/api/appointments", appointmentRouter);
 *
 * Which yields:
 *   POST   /api/appointments
 *   GET    /api/appointments
 *   GET    /api/appointments/:id
 *   PATCH  /api/appointments/:id
 *   POST   /api/appointments/:id/cancel
 *   POST   /api/appointments/:id/complete
 */
const appointmentRouter = Router();

// Create a new appointment
// POST /api/appointments
appointmentRouter.post("/", createAppointmentController);

// Get list of appointments (with optional filters via query params)
// GET /api/appointments
appointmentRouter.get("/", getAppointmentsController);

// Get a single appointment by ID
// GET /api/appointments/:id
appointmentRouter.get("/:id", getAppointmentByIdController);

// Partially update an appointment
// PATCH /api/appointments/:id
appointmentRouter.patch("/:id", updateAppointmentController);

// Cancel an appointment
// POST /api/appointments/:id/cancel
appointmentRouter.post("/:id/cancel", cancelAppointmentController);

// Mark an appointment as completed
// POST /api/appointments/:id/complete
appointmentRouter.post("/:id/complete", completeAppointmentController);

export default appointmentRouter;
