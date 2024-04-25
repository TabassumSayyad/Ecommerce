const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.json({
        success: false,
        error: "Please Login to access this resource",
      });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.json({
        success: false,
        error: `Role: ${req.user.role} is not allowed to access this resouce `,
      });
    }
    next();
  };
};
