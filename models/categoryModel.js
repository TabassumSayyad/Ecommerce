const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  subcategories: [
    {
      type: String,
    },
  ],
});

const Category = new mongoose.model("Category", categorySchema);
module.exports = Category;
