const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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
    console.log(req.body);
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
    // console.log(token);
    if (isMatch) {
      return res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 10000),
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
