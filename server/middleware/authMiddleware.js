const jwt = require("jsonwebtoken");
const User = require("../models/User");

// debugging
console.log("--- AUTH MIDDLEWARE FILE LOADED ---");

const protect = async (req, res, next) => {
  let token;

  // 1 Check if authorization header exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2 If no token, STOP here
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4 Attach user to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 5 Continue to protected route
    next();

  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };