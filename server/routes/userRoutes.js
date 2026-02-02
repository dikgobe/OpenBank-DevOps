const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/user/profile
// @desc    Get current user profile, balances, and card info
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user contact details
// @access  Private
router.put("/profile", protect, async (req, res) => {
  const { email, phoneNumber, twoFactorEnabled } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

module.exports = router;