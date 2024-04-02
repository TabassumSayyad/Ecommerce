const express = require("express");
const router = express.Router();

const{createContact,getAllContacts}=require('../controller/contactController')
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/contact",isAuthenticatedUser, createContact);


router.get("/contact",isAuthenticatedUser,authorizeRoles("admin"),getAllContacts)

module.exports = router;