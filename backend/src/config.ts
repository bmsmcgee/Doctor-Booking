import dotenv from "dotenv";

/**
 * Load environment variables from .env file into process.env
 * Should only run once at startup before anything else needs env variables
 */
dotenv.config();

/**
 * Configuration for the backend
 */

const config = {
  // Default to 4000 if PORT is not provided
  port: Number(process.env.PORT ?? 4000),

  // MongoDB connection string must be preset
  mongoUri: process.env.MONGO_URI ?? "",

  jwtSecret: process.env.JWT_SECRET,
};

// Fail fast if MONGO_URI is missing
if (!config.mongoUri) {
  throw new Error("MONGO_URI is missing from environment variables!");
}

// Fail fast if JWT_SECRET is missing
if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is not configured.");
}

export default config;
