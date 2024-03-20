const express = require("express");
const router = express.Router();

const {
  registerUser,
  getAllUsers,
  loginUser,
  getSingleUser,deleteUser
} = require("../controller/userController");

router.post("/register", registerUser);
router.get("/users", getAllUsers);
router.get("/admin/user/:id", getSingleUser);

router.post("/login", loginUser);
router.delete("/admin/user/:id",deleteUser)
module.exports = router;
