const express = require("express");
const router = express.Router();

const {
  registerUser,
  getAllUsers,
  loginUser,
  getuserDetails,
  getSingleUser,
  deleteUser,
} = require("../controller/userController");

const { isAuthenticatedUser } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me",isAuthenticatedUser, getuserDetails);

//admin
router.get("/admin/users", isAuthenticatedUser, getAllUsers);
router.get("/admin/user/:id", isAuthenticatedUser, getSingleUser);
router.delete("/admin/user/:id", isAuthenticatedUser, deleteUser);
module.exports = router;
