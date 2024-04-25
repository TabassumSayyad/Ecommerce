const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  updateStatus,
} = require("../controller/contactController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/contact", isAuthenticatedUser, createContact);
router.get(
  "/contact",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllContacts
);
router.put(
  "/contact/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateStatus
);

module.exports = router;
