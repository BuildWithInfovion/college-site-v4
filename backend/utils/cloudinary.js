const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer"); // This was missing in your code

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Setup Multer Storage to upload directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Make it explicit
  params: {
    folder: "college-site/events",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    public_id: (req, file) => {
      // Generate unique public_id for each upload
      return Date.now() + "-" + Math.round(Math.random() * 1e9);
    },
    transformation: [
      { width: 1000, height: 1000, crop: "limit" }, // Optional: resize large images
      { quality: "auto" }, // Optional: auto quality optimization
    ],
  },
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = { cloudinary, upload };
