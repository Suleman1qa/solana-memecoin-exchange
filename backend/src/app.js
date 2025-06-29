import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import routes from "./routes/index.js";
import errorMiddleware from "./middleware/error.middleware.js";
import logger from "./utils/logger.js";
import socketService from "./services/socket.service.js";

console.log("Imported mongoose");

// Set strictQuery to suppress Mongoose 7 deprecation warning
mongoose.set("strictQuery", true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add global error handlers to log uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Add debug logs to identify crash points
console.log("Starting app.js execution");

// Add debug logs to confirm execution flow
console.log("Config file loaded successfully");
console.log("MongoDB URI:", config.mongodb.uri);
console.log("Server Port:", config.port);

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket service
socketService.initialize(io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api", routes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: req.headers,
    env: process.env.NODE_ENV,
  });
});

// Static files (if needed)
app.use("/static", express.static(path.join(__dirname, "public")));

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    logger.info("Connected to MongoDB");
    console.log("MongoDB connection successful");

    // Start the server
    console.log("Starting server...");
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
});

export { app, server };
