import mongoose from "mongoose";
import config from "./config.js";
import express from "express";

import type { Request, Response } from "express";
import { errorHandler } from "./middleware/error.middleware.js";

/**
 * Connect to MongoDB using Mongoose.
 *
 * - Uses URI from config object
 * - Logs success or failure
 * - Exits the process on failure so a broken server does not run
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB.");
    console.error(error);
    process.exit(1);
  }
};

/**
 * Set up the Express application instance
 *
 * - Registers core middleware (JSON parsing, etc.)
 * - Defines basic routes
 * - Mount API routes
 */
const createServer = () => {
  const app = express();

  // Parse incoming JSON request bodies
  app.use(express.json());

  // Simple health check endpoint to confirm API is alive
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      message: "Doctor booking API is running",
    });
  });

  app.use(errorHandler);

  return app;
};

/**
 * Application startup
 *
 * - Connect to MongoDB
 * - Create Express Server
 * - Start listening on theconfigured port
 */
const start = async (): Promise<void> => {
  await connectDB();

  const app = createServer();

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
};

// void means we ignore the returned promise
void start();
