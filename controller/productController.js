const Product = require("../models/productModel");
const fs = require('fs');
const path = require('path');
exports.addProduct = async (req, res) => {
  const { title, description, category, subCategory,price, quantity } = req.body;
  try {
    const filenames = req.files.map((file) => file.path);

    const product = new Product({
      title,
      description,
      category,
      subCategory,
      price,
      quantity,
      images: filenames,
    });

    const createProduct = await product.save();
    res.status(201).json({success:true,createProduct});
  } catch (e) {
    res.status(400).json({success:false,e});
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const productsData = await Product.find();
    res.status(201).json({ success: true, productsData });
  } catch (e) {
    res.status(400).json({success:false,e});
  }
};

exports.getproductDetails = async (req, res) => {
  try {
    const product = await Product.findById({ _id: req.params.id });
    if (!product) {
      return res.json({ success: false, error: "product not found" });
    }
    if(product.isDeleted)
    {
      return res.json({ success: false, error: "This product is deleted already" });
    }
    res.json({ success: true, product });
  } catch (e) {
    res.status(404).json({ success: false, e });
  }
};


exports.checkProductExists = async (req, res, next) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct || existingProduct.isDeleted) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    next(); // Proceed to next middleware if product exists
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    // console.log(path.join(__dirname,'..'));
    
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      existingProduct.images.forEach((imagePath) => {
        fs.unlinkSync(path.join(__dirname, '..', imagePath)); // Remove old image file
      });

      // Save new image filenames
      const filenames = req.files.map((file) => file.path);
      req.body.images = filenames;
    }

    // Update updatedAt field
    req.body.updatedAt = Date.now();

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, updatedProduct });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};


  exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProduct) {
      return res.json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, deletedProduct });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

