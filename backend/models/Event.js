const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true }, // Cloudinary public ID for deletion
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

// Index to optimize queries sorting by createdAt (same as uploadedAt)
EventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Event", EventSchema);
