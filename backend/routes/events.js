const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { upload, cloudinary } = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Rate limiter to prevent abuse on sensitive routes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 requests per windowMs
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

// GET /api/events - list all event images (admin protected)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ status: "success", data: events });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// POST /api/events - upload event image (admin protected, rate limited)
router.post(
  "/",
  requireAdmin,
  limiter,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ status: "error", message: "No image file uploaded" });
      }

      // Get image URL and public ID from the uploaded file as returned by Cloudinary
      const imageUrl = req.file.secure_url || req.file.path;
      const publicId = req.file.public_id || req.file.filename;

      if (!imageUrl || !publicId) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid file upload data" });
      }

      const newEvent = new Event({ imageUrl, publicId });
      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (err) {
      console.error("Error saving event:", err);
      res
        .status(500)
        .json({ status: "error", message: "Server error saving event" });
    }
  }
);

// DELETE /api/events/:id - delete image from cloudinary + DB (admin protected, rate limited)
router.delete("/:id", requireAdmin, limiter, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event image not found" });
    }

    try {
      if (event.publicId) {
        await cloudinary.uploader.destroy(event.publicId);
      }
    } catch (cloudErr) {
      console.error("Cloudinary deletion failed:", cloudErr);
      // Proceed to delete DB record even if cloudinary fails
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      message: "Event image deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res
      .status(500)
      .json({ status: "error", message: "Server error deleting event" });
  }
});

module.exports = router;
