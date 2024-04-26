const mongoose = require("mongoose");
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
  },
  phone: {
    type: Number,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  repliedStatus: {
    type: Boolean,
    default: false,
  },
});

const Contact = new mongoose.model("Contact", contactSchema);
module.exports = Contact;
