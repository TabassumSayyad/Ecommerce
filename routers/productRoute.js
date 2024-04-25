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
  updateDeletedProduct,
} = require("../controller/productController");
const { isAuthenticatedUser,authorizeRoles } = require("../middleware/auth");

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
router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminProducts
);
router.get(
  "/admin/deletedProducts",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getDeletedProducts
);
router.post(
  "/admin/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  upload.array("images", 5),
  addProduct
);
router.put(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  checkProductExists,
  upload.array("images", 5),
  updateProduct
);
router.delete(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router.put(
  "/admin/productStatus/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateDeletedProduct
);

module.exports = router;
