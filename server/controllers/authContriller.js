const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, saIdNumber, email, phoneNumber, password } = req.body;

  try {
    // 1. Validation
    if (!firstName || !lastName || !saIdNumber || !email || !password) {
      res.status(400);
      throw new Error("Please include all fields");
    }

    // 2. Check if user exists (ID or Email)
    const userExists = await User.findOne({ 
        $or: [{ saIdNumber }, { email }] 
    });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this ID or Email");
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate Bank Details
    // Random 10-digit Account Number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    // Random 16-digit Card Number (spaced)
    const cardNumRaw = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    const cardNumber = cardNumRaw.match(/.{1,4}/g).join(" ");

    // 5. Create User
    const user = await User.create({
      firstName,
      lastName,
      saIdNumber,
      email,
      phoneNumber,
      password: hashedPassword,
      accountNumber,
      cardNumber,
      balances: { savings: 0, checking: 0, business: 0, investment: 0 }
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { saIdNumber, password } = req.body;

  try {
    // 1. Check for user by ID
    const user = await User.findOne({ saIdNumber });

    // 2. Validate password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};