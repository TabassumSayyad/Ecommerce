const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
//Register User
exports.registerUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const useremail = await User.findOne({ email: req.body.email });
    if (useremail) {
      return res.json({ success: false, error: "Email already exist" });
    }
    const createUser = await user.save();
    res.status(201).json({ success: true, createUser });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//Login User
exports.loginUser = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, error: "Email and Password Required" });
    }
    const useremail = await User.findOne({ email: req.body.email });
    if (!useremail) {
      return res.json({ success: false, error: "Email is incorrect" });
    }
    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateJWTToken();
    if (isMatch) {
      // console.log(process.env.JWT_EXPIRE)
      return res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .json({ success: true, user: useremail, token: token });
    } else {
      return res.json({ success: false, error: "Password is incorrect" });
    }
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//logout User
exports.logout = async(req,res)=>
{
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
}

//Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: false,
      error: "User with the given email does not exist",
    });
  }
  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
  const resetPasswordUrl = `${req.protocol}://localhost:5173/reset_Pwd/${resetToken}`;
  const message = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
      }
      .reset-link {
        color: #007bff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Password Reset Request</h2>
      </div>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password for your Ecommerce account.</p>
      <p>If you did not make this request, you can ignore this email.</p>
      <p>To reset your password, click the following link or copy and paste it into your browser</p>
      <p><a href="${resetPasswordUrl}" class="reset-link" target="_blank">${resetPasswordUrl}</a></p>
      <p>This link will expire in 10 mins for security reasons.</p>
      <div class="footer">
        <p>Thank you,</p>
        <p>The Kharido Yaar Team</p>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Reset Request for Your Ecommerce Account`,
      message,
      contentType: "text/html", // Set the content type to HTML
    });

    res.status(200).json({
      success: true,
      message: `An email has been sent to ${user.email}. Please check your inbox.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return res.json({
      success: false,
      error: "Failed to send email. Please try again later.",
    });
  }
};

// //Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        error: "Reset Password Token is invalid or has been expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.json({
        success: false,
        error: "Password and confirm Password not matched",
      });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return res.json({ success: true, message: "Password reset successful" });
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
};

//get User Details
exports.getuserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    req.body.updatedAt = Date.now();
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      updatedUser,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

//get All User Details(Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    console.log("token ", req.cookies);
    const usersData = await User.find();
    res.status(201).json({ success: true, usersData });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//get Single User Details(Admin)
exports.getSingleUser = async (req, res, next) => {
  try {
    const userData = await User.findById({ _id: req.params.id });
    if (!userData) {
      return res.json({ success: false, error: "user not found" });
    }
    res.status(201).json({ success: true, userData });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//Delete User(Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.json({ success: false, error: "User not Found" });
    }
    return res.json({ success: true, deletedUser });
  } catch (error) {
    return res.json({ success: false, error });
  }
};
