const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Rate limiter to prevent abuse on sensitive routes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // max 30 requests per window per IP
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

// GET /api/notices - List all notices (admin-protected)
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ status: "success", data: notices });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// POST /api/notices - Create new notice (admin-protected, rate limited)
router.post("/", requireAdmin, limiter, async (req, res) => {
  try {
    const { title, content, date } = req.body;
    if (!title || !content || !date) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields.",
      });
    }
    const newNotice = new Notice({ title, content, date });
    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (err) {
    console.error("Error saving notice:", err);
    res
      .status(500)
      .json({ status: "error", message: "Server error saving notice." });
  }
});

// GET /api/notices/:id - Get single notice (admin-protected)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res
        .status(404)
        .json({ status: "error", message: "Notice not found." });
    }
    res.json(notice);
  } catch (err) {
    console.error("Error fetching notice:", err);
    res
      .status(500)
      .json({ status: "error", message: "Server error fetching notice." });
  }
});

// PUT /api/notices/:id - Update a notice (admin-protected, rate limited)
router.put("/:id", requireAdmin, limiter, async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res
        .status(404)
        .json({ status: "error", message: "Notice not found." });
    }
    notice.title = title ?? notice.title;
    notice.content = content ?? notice.content;
    notice.date = date ?? notice.date;

    const updatedNotice = await notice.save();
    res.json(updatedNotice);
  } catch (err) {
    console.error("Error updating notice:", err);
    res
      .status(500)
      .json({ status: "error", message: "Server error updating notice." });
  }
});

// DELETE /api/notices/:id - Delete a notice (admin-protected, rate limited)
router.delete("/:id", requireAdmin, limiter, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res
        .status(404)
        .json({ status: "error", message: "Notice not found." });
    }
    res.json({ status: "success", message: "Notice deleted." });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res
      .status(500)
      .json({ status: "error", message: "Server error deleting notice." });
  }
});

module.exports = router;
