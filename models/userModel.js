const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// require('dotenv').config({path:'./config/.env'});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  phone: {
    type: Number,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    default:"user"
  },
  createdAt:
  {
    type:Date,
    default:Date.now()
  },
  updatedAt:
  {
    type:Date,
    default:Date.now()
  }
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    // console.log(`The current password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    // console.log(`The Hashed password is ${this.password}`);
  }
});


//JWT Token
userSchema.methods.generateJWTToken = function () {
  // console.log(process.env.JWT_SECRET);
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
  };

const User = new mongoose.model("User", userSchema);

module.exports = User;
