const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FutureRemServ', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB database: FutureRemServ");
});

// ✅ User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ✅ Newsletter Schema
const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true }
});
const NewsletterSubscriber = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);

// ✅ Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your Gmail
    pass: process.env.GMAIL_PASS        // your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Sign-Up
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    console.log("📦 User saved:", newUser.email);
    res.status(200).json({ message: "User signed up successfully!" });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Error signing up user." });
  }
});

// ✅ Sign-In
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    console.log("🔑 User Logged In:", user.email);
    res.status(200).json({ message: "Login successful!", user: { firstName: user.firstName } });

  } catch (error) {
    console.error("❌ Sign-in error:", error);
    res.status(500).json({ error: "Server error during sign-in." });
  }
});

// ✅ Newsletter Subscription
app.post("/newsletter-signup", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already subscribed." });
    }

    const newSubscriber = new NewsletterSubscriber({ email });
    await newSubscriber.save();

    // Send confirmation email
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "You're Subscribed!",
      text: "Thank you for signing up. Stay ahead of the market.",
      html: "<p>Thank you for signing up. <strong>Stay ahead of the market.</strong></p>",
    });

    console.log("📨 Newsletter confirmation sent to:", email);
    res.status(200).json({ message: "Thanks for subscribing!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "You’ve already subscribed." });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
});

// ✅ Forgot Password (Reset)
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("🔄 Password reset for:", user.email);

    // Optional: Send email notification
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your password has been reset",
      text: "Your password was successfully updated.",
      html: "<p>Your password has been successfully updated.</p>",
    });

    res.status(200).json({ message: "Password updated successfully!" });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Error resetting password." });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});