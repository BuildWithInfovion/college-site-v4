require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Use helmet for security headers
app.use(helmet());

// 2. Logger middleware
app.use(morgan("combined"));

// 3. CORS with expanded allowed origins for frontend and admin panel
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      "http://127.0.0.1:5500", // for local admin panel dev server
      "http://localhost:5500",
    ],
    credentials: true,
  })
);

// 4. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Route imports
const noticeRoutes = require("./routes/notices");
const eventRoutes = require("./routes/events");
const queriesRoute = require("./routes/queries");
const authRoutes = require("./routes/auth");

// 6. Route mounting
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/queries", queriesRoute);
app.use("/api/auth", authRoutes);

// 7. Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "backend",
    time: new Date().toISOString(),
  });
});

// 8. Root route
app.get("/", (req, res) => {
  res.send("Hello from backend server - MongoDB Connected!");
});

// 9. 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint not found" });
});

// 10. Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  const statusCode =
    err.status ||
    err.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// 11. Database connect & server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// 12. Graceful shutdown on SIGINT and SIGTERM
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down gracefully`);
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
