const mongoose = require('mongoose')
const validator = require("validator");

const contactSchema = new mongoose.Schema({
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
        required: true,
        validate: {
          validator: function(v) {
            return /^[0-9]{10}$/.test(v);
          },
          message:"Mobile no. must contain 10 digits"
        }
      },
      query: {
        type: String,
        required: true
      }
})


const Contact = new mongoose.model("Contact", contactSchema)

module.exports = Contact