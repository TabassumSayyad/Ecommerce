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
  getExchangeRequestOrders,
  exchangeOrder,
  validateExchange,
  acceptExchangeRequest,
  rejectExchangeRequest,
  acceptExchangedProduct,
  rejectExchangedProduct,
  filterDeliveryStatus,
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
  "/admin/filter/orders",
  isAuthenticatedUser,
  authorizeRoles("admin","agent"),
  filterDeliveryStatus
);

router.get(
  "/admin/exchangeRequest/orders",
  isAuthenticatedUser,
  authorizeRoles("admin", "agent"),
  getExchangeRequestOrders
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
  acceptExchangeRequest
);
router.put(
  "/order/reject/:orderId/:productId",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  rejectExchangeRequest
);

//Delivery Agent
router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("agent"),
  updateOrder
);
router.put(
  "/order/accept/product/:orderId/:productId",
  isAuthenticatedUser,
  authorizeRoles("agent"),
  acceptExchangedProduct
);
router.put(
  "/order/reject/product/:orderId/:productId",
  isAuthenticatedUser,
  authorizeRoles("agent"),
  rejectExchangedProduct
);
module.exports = router;
