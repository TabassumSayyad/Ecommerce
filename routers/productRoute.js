const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addProduct,getAllProducts,getproductDetails,updateProduct,deleteProduct,checkProductExists } = require("../controller/productController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+file.originalname);
  },
});


const upload = multer({ storage: storage });

router.post("/product/new", upload.array("productImages", 5), addProduct);
router.get("/product",getAllProducts)
router.put("/product/:id",checkProductExists, upload.array("productImages", 5),updateProduct );
router.get("/product/:id",getproductDetails)

router.delete("/product/:id",deleteProduct)


module.exports = router;
