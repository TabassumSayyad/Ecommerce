const Category = require("../models/categoryModel");

//create category
exports.createCategory = async (req, res, next) => {
  try {
    const existingCategory = await Category.findOne({
      category: req.body.category,
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, error: "Category already exists" });
    }

    const newCategory = new Category(req.body);
    const createCategory = await newCategory.save();
    res.status(201).json({ success: true, createCategory });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//get All Categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const categoryNames = categories.map((category) => category.category);
    res.status(200).json({ success: true, categoryNames });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
