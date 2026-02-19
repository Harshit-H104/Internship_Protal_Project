require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserModel = require('./models/formDataSchema');
const InternshipApplication = require('./models/Application');

const app = express();
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'Mynameismarvin';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB successfully connected'))
.catch(err => console.log('MongoDB connection error:', err));


// ================= AUTH MIDDLEWARE =================

const authenticateUser = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


// ================= REGISTER =================

app.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= LOGIN =================

app.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: '4h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.status(200).json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= PROFILE (FIXED - NEW) =================

app.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= LOGOUT (NEW) =================

app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: "Logged out successfully" });
});


// ================= HOME =================

app.get('/home', authenticateUser, (req, res) => {
  res.status(200).json({ message: "Authorized" });
});


// ================= APPLY =================

app.post('/apply', authenticateUser, async (req, res) => {
  try {
    const { opportunity, phone, email, resumeLink } = req.body;
    const userId = req.user.userId;

    const newApplication = new InternshipApplication({
      userId,
      company: opportunity.company,
      role: opportunity.role,
      location: {
        office: opportunity.location?.office,
        stipend: opportunity.location?.stipend
      },
      phone,
      email,
      resumeLink
    });

    await newApplication.save();

    await UserModel.findByIdAndUpdate(userId, {
      $push: { applications: newApplication._id }
    });

    res.status(200).json({ message: "Application submitted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= APPLIED =================

app.get('/applied', authenticateUser, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).populate('applications');
    res.status(200).json(user.applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
