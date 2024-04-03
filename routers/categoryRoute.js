const express = require("express");
const router = express.Router();

const{createCategory,getAllCategories}=require('../controller/categoryController')
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/category",createCategory)
router.get("/category",getAllCategories)

module.exports = router;