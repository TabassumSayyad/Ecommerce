const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");

//add the product
exports.addProduct = async (req, res) => {
  const { title, description, category, subCategory, price, quantity } =
    req.body;

  try {
    const filenames = req.files.map((file) => file.path);
    // Check if the category exists
    let existingCategory = await Category.findOne({ category });
    // If the category exists, check if the subCategory already exists
    if (!existingCategory.subcategories.includes(subCategory)) {
      // If the subCategory doesn't exist, add it to the subcategories array
      existingCategory.subcategories.push(subCategory);
      await existingCategory.save();
    }
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
    res.status(201).json({ success: true, createProduct });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const startIndex = (page - 1) * limit;

    // Construct the query object
    let query = { isDeleted: false };

    // Add category filter if provided in query parameters
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Add price filter if provided in query parameters
    if (req.query.minPrice && req.query.maxPrice) {
      query.price = {
        $gte: parseInt(req.query.minPrice),
        $lte: parseInt(req.query.maxPrice),
      };
    } else if (req.query.minPrice) {
      query.price = { $gte: parseInt(req.query.minPrice) };
    } else if (req.query.maxPrice) {
      query.price = { $lte: parseInt(req.query.maxPrice) };
    }

    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    console.log(query);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const productsData = await Product.find(query)
      .limit(limit)
      .skip(startIndex);

    // Pagination result object
    const pagination = {};
    if (startIndex + limit < totalProducts) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({
      success: true,
      totalPages: totalPages,
      currentPage: page,
      totalProducts: totalProducts,
      pagination: pagination,
      productsData: productsData,
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//get Product Details
exports.getproductDetails = async (req, res) => {
  try {
    const product = await Product.findById({ _id: req.params.id });
    if (!product) {
      return res.json({ success: false, error: "product not found" });
    }
    if (product.isDeleted) {
      return res.json({
        success: false,
        error: "This product is deleted already",
      });
    }
    res.json({ success: true, product });
  } catch (e) {
    res.status(404).json({ success: false, e });
  }
};

//get All Products(Admin)
exports.getAdminProducts = async (req, res) => {
  try {
    const productsData = await Product.find({ isDeleted: false });
    res.status(201).json({ success: true, productsData });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//get Deleted Products(Admin)
exports.getDeletedProducts = async (req, res) => {
  try {
    const productsData = await Product.find({ isDeleted: true });
    res.status(201).json({ success: true, productsData });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

//for updation check if product is already exists
exports.checkProductExists = async (req, res, next) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct || existingProduct.isDeleted) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

//update product(admin)
exports.updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    const { subCategory, category } = req.body;

    if (subCategory) {
      await Category.findOneAndUpdate(
        { category },
        { $addToSet: { subcategories: subCategory } }
      );
    }
    // Check if new images are uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      existingProduct.images.forEach((imagePath) => {
        fs.unlinkSync(path.join(__dirname, "..", imagePath)); // Remove old image file
      });

      // Save new image filenames
      const filenames = req.files.map((file) => file.path);
      req.body.images = filenames;
    } else {
      req.body.images = existingProduct.images;
    }
    req.body.updatedAt = Date.now();
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

//delete product(admin)
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

//update deleted product status(admin)
exports.updateDeletedProduct = async (req, res) => {
  try {
    const updateDeletedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );

    if (!updateDeletedProduct) {
      return res.json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, updateDeletedProduct });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
