const express = require("express");
const router = express.Router();

const{newOrder,myOrders,getSingleOrder, getAllOrders, deleteOrder, updateOrder, getDeletedOrders}=require('../controller/orderController')
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/order/new",isAuthenticatedUser, newOrder);
router.get("/orders/me",isAuthenticatedUser,myOrders);
router.get("/order/:id",isAuthenticatedUser,getSingleOrder);

//Admin
router.get("/admin/orders",isAuthenticatedUser,getAllOrders)
router.get("/admin/deletedOrders",isAuthenticatedUser,getDeletedOrders)
router.delete("/admin/order/:id",isAuthenticatedUser,deleteOrder)
router.put("/admin/order/:id",isAuthenticatedUser,updateOrder)
module.exports = router;
