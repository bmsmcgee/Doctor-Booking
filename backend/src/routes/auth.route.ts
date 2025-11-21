import { Router } from "express";
import {
  loginUserController,
  registerUserController,
} from "../controllers/auth.controller.js";

/**
 * authRouter
 *
 * Defines all HTTP routes related to auth resources
 *
 * Intended to be mounted under a base path:
 *    app.use("/api/auth", authRouter)
 *
 * Routes:
 *  - POST /api/auth/register
 *  - POST /api/auth/login
 */
const authRouter = Router();

// Register a new user
// POST /api/auth/register
authRouter.post("/register", registerUserController);

// Log in an existing user
// POST /api/auth/login
authRouter.post("/login", loginUserController);

export default authRouter;
