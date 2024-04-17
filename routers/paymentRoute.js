const express = require("express");
const router = express.Router();

const{processPayment}= require("../controller/paymentController")
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
router.post("/create-checkout-session",isAuthenticatedUser,processPayment)
module.exports = router;