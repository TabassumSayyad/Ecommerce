const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../utils/sendEmail");
//create new Order
exports.newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    discountPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  try {
    // Create the order object
    // Create the order object
    const orderData = {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      discountPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: req.user._id,
    };

    if (paymentInfo.mode === "COD") {
      orderData.paidAt = undefined; // If payment mode is COD, leave paidAt undefined
      paymentInfo.id = undefined;
    } else {
      orderData.paidAt = new Date(); // If payment mode is not COD, set paidAt to current date
    }

    const order = await Order.create(orderData);
    // console.log(order);

    // Update stock for each ordered item
    for (const item of orderItems) {
      await updateStock(item.product, item.quantity);
    }
    // Send confirmation email to the user
    const confirmationMessage = `
    <html>
    <head>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
    
        .header {
          background-color: #f0f0f0;
          padding: 10px;
          border-bottom: 1px solid #ccc;
        }
    
        h2 {
          margin: 0;
        }
    
        .footer {
          margin-top: 20px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Order Confirmation</h2>
        </div>
        <p>Dear ${req.user.name},</p>
        <p>Thank you for placing your order with us.</p>
        <p>Your order has been confirmed, and we're delighted to serve you.</p>
        <p>Order Id:${order._id}
        <p>We'll keep you updated throughout the process, and once your order is shipped, we'll be in touch with you promptly.</p>
        <p>For more details regarding your order, please visit the 'My Orders' section on our website.</p>
        <p>Thank you for choosing us. We appreciate your trust and look forward to delivering an exceptional experience.</p>
        <div class="footer">
          <p>Best Regards,</p>
          <p>The Kharido Yaar Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await sendEmail({
      email: req.user.email,
      subject: "Order Confirmation",
      message: confirmationMessage,
      contentType: "text/html",
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//get my orders(logged in users)
exports.myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  // .populate({
  //   path: "orderItems",
  //   populate: {
  //     path: "product",
  //     select: "name price images",
  //   },
  // });

  res.status(200).json({
    success: true,
    orders,
  });
};

//get single order
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    // .populate({
    //   path: "orderItems",
    //   populate: {
    //     path: "product",
    //     select: "name price images",
    //   },
    // });

    if (!order) {
      return res.json({
        success: false,
        error: "Order not found with this Id",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

//get All Orders(Admin)
exports.getAllOrders = async (req, res, next) => {
  const orders = await Order.find({ isDeleted: false });

  res.status(200).json({
    success: true,
    orders,
  });
};

//get deleted order(Admin)
exports.getDeletedOrders = async (req, res, next) => {
  const orders = await Order.find({ isDeleted: true });

  res.status(200).json({
    success: true,
    orders,
  });
};

//delete the order (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const deleteOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deleteOrder) {
      return res.json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, deleteOrder });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

//update order (Admin)
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.json({
        success: false,
        error: "Order not found with this Id",
      });
    }
    console.log(order.user.email);
    if (order.deliveryStatus === "Delivered") {
      return res.json({
        success: false,
        error: "You have already delivered this order",
      });
    }
    let message;

    if (req.body.deliveryStatus === "Shipped") {
      message = `
      <html>
      <head>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Status</h2>
          </div>
          <p>Hello ${order.user.name},</p>
          <p>We are thrilled to inform you that your recent order (Order ID:${order._id}) has been successfully Shipped!</p>
          <p>Your eagerly anticipated order is en route and scheduled to arrive at your doorstep within the next 24 hours.</p>
          <div class="footer">
            <p>Thank you,</p>
            <p>The Kharido Yaar Team</p>
          </div>
        </div>
      </body>
    </html>
    `;
    } else if (req.body.deliveryStatus === "Delivered") {
      message = `
      <html>
      <head>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Status</h2>
          </div>
          <p>Hello ${order.user.name},</p>
          <p>We are pleased to inform you that your recent order (Order ID:${order._id}) has been successfully Delivered!</p>
          <p>Thank you for choosing Kharido Yaar.</p>
          <div class="footer">
            <p>Thank you,</p>
            <p>The Kharido Yaar Team</p>
          </div>
        </div>
      </body>
    </html>
    `;
    }

    order.deliveryStatus = req.body.deliveryStatus;
    if (req.body.deliveryStatus === "Shipped") {
      await sendEmail({
        email: order.user.email,
        subject: `Order Delivery Status`,
        message,
        contentType: "text/html", // Set the content type to HTML
      });
    }

    if (req.body.deliveryStatus === "Delivered") {
      order.deliveredAt = Date.now();
      if (order.paymentInfo.mode === "COD") {
        order.paidAt = Date.now();
      }
      await sendEmail({
        email: order.user.email,
        subject: `Order Delivery Status`,
        message,
        contentType: "text/html", // Set the content type to HTML
      });
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (e) {
    res.status(400).json({ success: false, e });
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.quantity -= quantity;

  await product.save({ validateBeforeSave: false });
}
