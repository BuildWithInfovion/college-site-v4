const express = require("express");
const router = express.Router();
const Query = require("../models/Query");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Rate limiter for public route to prevent spam
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // max 20 requests per IP
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

// Middleware to verify admin JWT token
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin)
      return res.status(403).json({ status: "error", message: "Forbidden" });
    req.admin = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
}

// GET all queries (admin protected)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json({ status: "success", data: queries });
  } catch (err) {
    next(err);
  }
});

// POST create new query (public, rate limited)
router.post("/", limiter, async (req, res, next) => {
  const { name, email, subject, message, priority } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      status: "error",
      message: "Please provide all required fields.",
    });
  }

  const query = new Query({ name, email, subject, message, priority });

  try {
    const newQuery = await query.save();
    res.status(201).json({ status: "success", data: newQuery });
  } catch (err) {
    next(err);
  }
});

// DELETE a query by ID (admin protected)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Query.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Query not found" });
    res.json({ status: "success", message: "Query deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
