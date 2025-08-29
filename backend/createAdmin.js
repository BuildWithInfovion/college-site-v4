require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust path if needed

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const username = "admin";
    const password = "YourStrongPassword"; // Must match testing
    const isAdmin = true;

    // Delete old with same username (if exists):
    await User.deleteOne({ username });

    // Create new admin with plain-text password to trigger hashing middleware!
    const newUser = new User({ username, password, isAdmin });
    await newUser.save();

    console.log(
      `Admin user created:\n Username: ${username}\n Password: ${password}`
    );
    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
createAdmin();
