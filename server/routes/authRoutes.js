// routes/authRoutes.js - FULL UPDATED CODE
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, saIdNumber, email, phoneNumber, password } = req.body;

        // Validation
        if (!firstName || !lastName || !saIdNumber || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please include all required fields"
            });
        }

        // Validate SA ID Number (13 digits)
        if (!/^\d{13}$/.test(saIdNumber)) {
            return res.status(400).json({
                success: false,
                message: "South African ID number must be exactly 13 digits"
            });
        }

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ saIdNumber }, { email }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this ID or Email"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Bank Details
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const cardNumRaw = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
        const cardNumber = cardNumRaw.match(/.{1,4}/g).join(" ");

        // Create User
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

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                accountNumber: user.accountNumber,
                cardNumber: user.cardNumber,
                token: token
            },
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    try {
        const { saIdNumber, password } = req.body;

        // Check for required fields
        if (!saIdNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide ID number and password"
            });
        }

        // Find user by ID number
        const user = await User.findOne({ saIdNumber });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                accountNumber: user.accountNumber,
                cardNumber: user.cardNumber,
                balances: user.balances,
                phoneNumber: user.phoneNumber || "",
                token: token
            },
            message: "Login successful"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// @route   GET /api/auth/test
// @desc    Test auth route
// @access  Public
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Auth routes are working!"
    });
});

module.exports = router;