// server.js - FIXED & STABLE VERSION (Node 22 compatible)

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const promBundle = require("express-prom-bundle");
const client = require("prom-client");
const dbMetricsMiddleware = require("./src/middleware/dbMetrics");

// Centralized metrics import
const {
  transactionCounter,
  activeUsersGauge,
  httpRequestDuration,
  errorCounter,
  apiRequestsCounter,
  responseSizeHistogram,
  databaseConnectionGauge,
  incrementTransactionCounter,
  recordError,
  getActiveUsersCount
} = require("./src/metrics");

dotenv.config();

const app = express();

// ----------------------------------------------------
// Database Connection
// ----------------------------------------------------
connectDB();

// ----------------------------------------------------
// CORS Configuration
// ----------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://localhost:3001"
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "X-Auth-Token",
    "X-CSRF-Token"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
};

app.use(dbMetricsMiddleware);
app.use(cors(corsOptions));

// ----------------------------------------------------
// Prometheus Middleware
// ----------------------------------------------------
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: {
    project_name: "openbank",
    environment: process.env.NODE_ENV || "development"
  },
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000,
      prefix: "openbank_nodejs_"
    }
  }
});

app.use(metricsMiddleware);

// ----------------------------------------------------
// Active Users Tracking
// ----------------------------------------------------
const activeUsers = new Map();

app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  let responseBody = "";

  res.send = function (body) {
    if (typeof body === "string") responseBody = body;
    else if (Buffer.isBuffer(body)) responseBody = body.toString();
    else if (typeof body === "object") responseBody = JSON.stringify(body);
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestDuration
      .labels(req.method, req.path, res.statusCode, "api")
      .observe(duration);

    apiRequestsCounter.inc({
      method: req.method,
      endpoint: req.path,
      status_code: res.statusCode
    });

    if (responseBody) {
      responseSizeHistogram
        .labels(req.path)
        .observe(Buffer.byteLength(responseBody, "utf8"));
    }
  });

  if (req.user?.id) {
    activeUsers.set(req.user.id, Date.now());
    activeUsersGauge.set(activeUsers.size);
  }

  next();
});

// ----------------------------------------------------
// Database Status Metric
// ----------------------------------------------------
const updateDatabaseStatus = () => {
  databaseConnectionGauge.set(
    mongoose.connection.readyState === 1 ? 1 : 0
  );
};

mongoose.connection.on("connected", updateDatabaseStatus);
mongoose.connection.on("disconnected", updateDatabaseStatus);

// ----------------------------------------------------
// Metrics Endpoint
// ----------------------------------------------------
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    recordError("metrics_error", "/metrics", 500);
    res.status(500).json({ error: "Failed to load metrics" });
  }
});

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    activeUsers: activeUsers.size
  });
});

// ----------------------------------------------------
// Body Parser & Routes
// ----------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend is working" });
});

// ----------------------------------------------------
// Error Handler (FIXED)
// ----------------------------------------------------
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  recordError("server_error", req.path, statusCode);

  res.status(statusCode).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});

// ----------------------------------------------------
// 404 Handler
// ----------------------------------------------------
app.use((req, res) => {
  recordError("not_found", req.path, 404);
  res.status(404).json({ message: "Route not found" });
});

// ----------------------------------------------------
// Server Startup
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  updateDatabaseStatus();
  console.log(`🚀 OpenBank Backend running on port ${PORT}`);
});

// ----------------------------------------------------
// Graceful Shutdown (UPDATED for Mongoose 7+)
// ----------------------------------------------------
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received: shutting down gracefully...`);
  
  // Close the HTTP server
  server.close(async () => {
    console.log("HTTP server closed");
    
    try {
      // Close MongoDB connection using promise (no callback)
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down:");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));