const User = require("../models/User");

// @desc    Get user data and balances
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { email, phoneNumber, twoFactorEnabled } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      
      if (twoFactorEnabled !== undefined) {
          user.twoFactorEnabled = twoFactorEnabled;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        twoFactorEnabled: updatedUser.twoFactorEnabled
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};