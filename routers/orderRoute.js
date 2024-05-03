const express = require("express");
const router = express.Router();

const {
  newOrder,
  myOrders,
  getSingleOrder,
  getAllOrders,
  deleteOrder,
  updateOrder,
  getDeletedOrders,
  getDeliveredOrders,
  exchangeOrder,
  validateExchange,
  acceptProductExchange,
  rejectProductExchange,
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/order/new", isAuthenticatedUser, newOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);
router.get("/order/:id", isAuthenticatedUser, getSingleOrder);

router.get(
  "/order/validate/exchange/:orderId",
  isAuthenticatedUser,
  validateExchange
);
router.put(
  "/order/exchange/:orderId/:productId",
  isAuthenticatedUser,
  exchangeOrder
);

//Admin
router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin", "agent"),
  getAllOrders
);

router.get(
  "/admin/delivered/orders",
  isAuthenticatedUser,
  authorizeRoles("admin", "agent"),
  getDeliveredOrders
);

router.get(
  "/admin/deletedOrders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getDeletedOrders
);

router.delete(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteOrder
);

router.put(
  "/order/accept/:orderId/:productId",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  acceptProductExchange
);
router.put(
  "/order/reject/:orderId/:productId",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  rejectProductExchange
);

//Delivery Agent
router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("agent"),
  updateOrder
);
module.exports = router;
