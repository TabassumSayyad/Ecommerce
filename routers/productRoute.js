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
  getAdminProducts,
  getDeletedProducts,
  updateDeletedProduct
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
router.get("/admin/products",isAuthenticatedUser,getAdminProducts)
router.get("/admin/deletedProducts",isAuthenticatedUser,getDeletedProducts)
router.post("/admin/product/new",isAuthenticatedUser,upload.array("images", 5), addProduct);
router.put("/admin/product/:id",isAuthenticatedUser,checkProductExists,upload.array("images", 5),updateProduct);
router.delete("/admin/product/:id",isAuthenticatedUser, deleteProduct);
router.put("/admin/productStatus/:id",isAuthenticatedUser,updateDeletedProduct)

module.exports = router;
