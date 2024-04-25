const express = require("express");
const router = express.Router();

const {
  checkout,
  paymentVerification,
} = require("../controller/paymentController");

const { isAuthenticatedUser } = require("../middleware/auth");
router.post("/checkout", isAuthenticatedUser, checkout);
router.post("/paymentVerification", paymentVerification);
module.exports = router;
