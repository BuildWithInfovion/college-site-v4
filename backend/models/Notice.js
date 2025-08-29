const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // remove leading/trailing spaces
      maxlength: 255, // good practice to limit size
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// Optional: add index on date for efficient querying by date
NoticeSchema.index({ date: -1 });

module.exports = mongoose.model("Notice", NoticeSchema);
