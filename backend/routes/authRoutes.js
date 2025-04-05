const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
    const { username, email, password, walletAddress } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }
  
    try {
      const userExists = await User.findOne({ email: email.trim() });
      if (userExists) {
        return res.status(400).json({ error: "User already exists." });
      }
  
      const user = new User({
        username: username.trim(),
        email: email.trim(),
        password,
        walletAddress: walletAddress?.trim() || null, // ✅ no more ReferenceError
      });
  
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error registering user." });
    }
  });
  
// Login a user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ email: email.trim() });
        console.log("User found:", user);
        if (!user) {
            console.error("User not found with email:", email);
            return res.status(404).json({ error: "Invalid email or password." });
        }

        // Compare input password with stored hashed password
        const isMatch = await user.comparePassword(password);
        console.log("Password comparison result:", isMatch);
        if (!isMatch) {
            console.error("Password mismatch for email:", email);
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Error logging in." });
    }
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "email",
        pass: "use gmail app password", 
    },
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
            console.error("❌ User not found:", email);
            return res.status(404).json({ error: "User not found." });
        }

        // Generate new temporary password
        const newPassword = crypto.randomBytes(6).toString("hex");
        console.log("🔑 New Password Generated:", newPassword);

        // ✅ Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        console.log("✅ Password Updated in DB for:", email);

        // Send email with new password
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            text: `Your new password is: ${newPassword}\nPlease change it after logging in.`,
        });

        res.json({ message: "A new password has been sent to your email." });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ error: "Failed to reset password." });
    }
});

module.exports = router;
