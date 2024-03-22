const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addProduct,
  getAllProducts,
  getproductDetails,
  updateProduct,
  deleteProduct,
  checkProductExists,
  getAdminProducts
} = require("../controller/productController");
const { isAuthenticatedUser } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/products", getAllProducts);
router.get("/product/:id", getproductDetails);

//Admin
router.get("/admin/products",getAdminProducts)
router.post("/admin/product/new", upload.array("images", 5), addProduct);
router.put("/admin/product/:id",checkProductExists,upload.array("images", 5),updateProduct);
router.delete("/admin/product/:id", deleteProduct);

module.exports = router;
