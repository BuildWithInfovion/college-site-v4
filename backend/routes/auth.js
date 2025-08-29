const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Please provide username and password",
      });
  }

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });

    // JWT payload
    const payload = {
      userId: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Sign JWT - expires in 8 hours
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      token,
      user: { username: user.username, isAdmin: user.isAdmin },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Server error during login" });
  }
});

module.exports = router;
