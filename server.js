const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const { PythonShell } = require('python-shell');
const jwt = require('jsonwebtoken');

const profileRoutes = require('./Routes/profileRoutes');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

const app = express();
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:3000'], // allow both
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

const apiRouter = express.Router();
apiRouter.use((req, res, next) => {
  console.log(`Routing to: ${req.originalUrl}`);
  next();
});
apiRouter.use('/', profileRoutes); 
app.use('/api', apiRouter);
// ✅ Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/FutureRemServ';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }
}, { timestamps: true });

const User = require('./Models/user'); 

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
    res.status(201).json({ 
        message: "User signed up successfully!" ,
        user: { 
            _id: newUser._id, 
        firstName: newUser.firstName
    } 
        });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Error signing up user." });
  }
});

// ✅ Sign-In
app.post('/signin', async (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
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

    const token = jwt.sign(
      { id: user._id }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    console.log("🔑 User Logged In:", user.email);
    res.status(200).json({ 
        message: "Login successful!", 
        user: { 
            _id: user._id,
            firstName: user.firstName,
            email: user.email
         } 
        });

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

// AI Recommendation
app.post('/api/ai/get-recommendations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const fs = require('fs');
        if (!fs.existsSync('./ai_service/ai_service.py')) {
            console.warn('⚠️ Python script missing - using fallback recommendations');
            return res.json({ courses: getFallbackRecommendations(user) });
        }

        // Prepare user data for Python
        const userData = {
            careerPaths: user.careerPaths,
            skills: user.skills,
            experience: user.experience,
            certifications: user.certifications,
            devSpecializations: user.devSpecializations,
            engSpecializations: user.engSpecializations
        };
        const options = {
            mode: 'text',
            pythonOptions: ['-u'], // unbuffered stdout
            scriptPath: './ai_service', // path to your python script
            args: [JSON.stringify(userData)]
        };
         PythonShell.run('ai_service.py', options, (err, results) => {
            if (err) {
                console.error('Python error:', err);
                return res.status(500).json({ 
                    error: 'AI service error', 
                    fallback: getFallbackRecommendations(user)
                });
            }
            
            try {
                const recommendations = JSON.parse(results[0]);
                res.json({ recommendations});
            } catch (error) {
                console.error('Parse error:', parseErr);
                res.status(500).json({ message: 'Failed to parse recommendations' });
            }
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Failed to get recommendations', courses: getFallbackRecommendations(user) });
    }
});

// Save the courses based on AI Recommendation
app.post('/api/ai/save-courses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { courses } = req.body;
        
        await User.findByIdAndUpdate(userId, {
            $addToSet: { recommendedCourses: { $each: courses } }
        });
        
        res.json({ message: 'Courses saved successfully' });
    } catch (error) {
        console.error('Save courses error:', error);
        res.status(500).json({ message: 'Failed to save courses' });
    }
});
// Get users coureses
app.get('/api/ai/user-courses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }
        res.json(user.recommendedCourses || []);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ 
            error: 'Failed to get courses',
            fallback: []
         });
    }
});

//JS fallback
function getFallbackRecommendations(user) {
    return [
        {
            id: "js-fallback-1",
            title: "Python Programming",
            provider: "Udemy",
            url: "https://www.udemy.com/topic/python/",
            matchReason: "Basic recommendation based on your profile"
        }
    ];
}

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});