const express = require("express");
const router = express.Router();

const {
  registerUser,
  getAllUsers,
  loginUser,
  getuserDetails,
  getSingleUser,
  deleteUser,
  forgotPassword,
  validateToken, 
  resetPassword, 
  updateProfile ,
  logout
} = require("../controller/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout",logout);
router.post("/password/forgot",forgotPassword);
router.patch("/password/reset/:token",resetPassword);
router.get("/me", isAuthenticatedUser, getuserDetails);
router.put("/me/update",isAuthenticatedUser,updateProfile)
//admin
router.get("/admin/users", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.get(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getSingleUser
);
router.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteUser
);
module.exports = router;
