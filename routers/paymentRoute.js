const express = require("express");
const router = express.Router();

const{processPayment}= require("../controller/paymentController")
router.post("/create-checkout-session",processPayment)
module.exports = router;