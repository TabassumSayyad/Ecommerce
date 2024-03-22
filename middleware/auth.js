const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
      console.log(token);
    if (!token) {
      return res.json({
        success: false,
        error: "Please Login to access this resource",
      });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedData)
    req.user = await User.findById(decodedData.id);
    // console.log(req.user)
    next();
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
};
