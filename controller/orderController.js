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
 
    // Calculate delivery date (current date + 7 days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryDateString = deliveryDate.toLocaleDateString();
 
    const order = await Order.create(orderData);
    // Update stock for each ordered item
    for (const item of orderItems) {
      await updateStock(item.product, item.quantity);
    }
 
    // Send confirmation email to the user
    const confirmationMessage = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
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
     
          .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 14px 20px;
            margin: 8px 0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
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
            <p>Order Id: ${order._id}</p>
            <p>Your order is expected to be delivered by ${deliveryDateString}.</p>
            <p>We'll keep you updated throughout the process, and once your order is shipped, we'll be in touch with you promptly.</p>
            <p>For more details regarding your order, please visit the 'My Orders' section on our website.</p>
            <a href="${process.env.URL}/userOrders" target="_blank" class="btn">My Orders</a>
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
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

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
  const orders = await Order.find({ isDeleted: false, 
    deliveryStatus: { $ne: "Delivered" }}).sort({
    createdAt: -1,
  });

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

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.quantity -= quantity;

  await product.save({ validateBeforeSave: false });
}

//update order (Agent)
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
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status</title>
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
    
        .btn {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 14px 20px;
          margin: 8px 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Status</h2>
          </div>
          <p>Hello ${order.user.name},</p>
          <p>We are thrilled to inform you that your recent order (Order ID:${order._id}) has been successfully Shipped!</p>
          <p>Your eagerly anticipated order is en route and scheduled to arrive at your doorstep within the next 24 hours.</p>
          <p>Check 'My Orders' section on our website</p>
          <a href="${process.env.URL}/userOrders" target="_blank" class="btn">My Orders</a>
          <div class="footer">
            <p>Thank you,</p>
            <p>The Kharido Yaar Team</p>
          </div>
        </div>
      </body>
      </html>
      `;
    } else if (req.body.deliveryStatus === "Out for Delivery") {
      message = `
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
  
      .btn {
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 14px 20px;
        margin: 8px 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
      }
    </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Status</h2>
          </div>
          <p>Hello ${order.user.name},</p>
          <p>We are pleased to inform you that your recent order (Order ID: ${order._id}) is now out for delivery!</p>
          <p>Your order is expected to arrive within the next 4-5 hours today.</p>
          <p>Check 'My Orders' section on our website</p>
          <a href="${process.env.URL}/userOrders" target="_blank" class="btn">My Orders</a>
          <p>Thank you for choosing Kharido Yaar.</p>
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
  
      .btn {
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 14px 20px;
        margin: 8px 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
      }
    </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Status</h2>
          </div>
          <p>Hello ${order.user.name},</p>
          <p>We are pleased to inform you that your recent order (Order ID:${order._id}) has been successfully ,Delivered!</p>
          <p>Check 'My Orders' section on our website</p>
          <a href="${process.env.URL}/userOrders" target="_blank" class="btn">My Orders</a>
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
    if (
      req.body.deliveryStatus === "Shipped" ||
      req.body.deliveryStatus === "Out for Delivery"
    ) {
      await sendEmail({
        email: order.user.email,
        subject: `Order Delivery Status`,
        message,
        contentType: "text/html",
      });
    }

    if (req.body.deliveryStatus === "Delivered") {
      let currentDate = new Date();
      let sevenDaysLater = new Date(
        currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      order.deliveredAt = currentDate;
      order.exhangedTill = sevenDaysLater;
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

// delay order logic(Automatic trigger mail)
exports.orderDelayNotification = async function () {
  try {
    const orders = await Order.find({
      deliveryStatus: { $ne: "Delivered" },
    }).populate("user", "name email");

    for (const order of orders) {
      const scheduledDeliveryTime = new Date(
        order.createdAt.getTime() + 2 * 60 * 1000
      );
      const currentTime = new Date();
      console.log(order.deliveryStatus);
      console.log(currentTime >= scheduledDeliveryTime);
      if (currentTime >= scheduledDeliveryTime) {
        const message = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delay Notification</title>
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
      
          .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 14px 20px;
            margin: 8px 0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
          }
        </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Order Delay Notification</h2>
            </div>
            <p>Dear ${order.user.name},</p>
            <p>We apologize for the delay in delivering your order.</p>
            <p>Your order with ID ${order._id} has not been delivered within the expected timeframe.</p>
            <p>Sorry for the inconvenience. Your order is expected to be delivered within the next 2 days.</p>
            <p>Thank you for your patience.</p>
            <a href="${process.env.URL}/userOrders" target="_blank" class="btn">My Orders</a>
            <div class="footer">
              <p>Best Regards,</p>
              <p>The Kharido Yaar Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

        await sendEmail({
          email: order.user.email,
          subject: `Order Delay Status`,
          message,
          contentType: "text/html", // Set the content type to HTML
        });
      }
    }
  } catch (error) {
    console.error("Error occurred while processing orders:", error);
  }
};

//check validity of exchange order
exports.validateExchange = async (req,res,next)=>
{
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    const exchangeStillDate = new Date(order.exhangedTill); 
    const currentDate = new Date(); 
    // console.log(exchangeStillDate)
    // console.log(currentDate)
    // console.log(currentDate > exchangeStillDate)
    if (currentDate > exchangeStillDate) {
      return res.status(200).json({ success: false, error: "Exchange period has expired" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
}

//Exchange Order
exports.exchangeOrder = async (req, res, next) => {
  try {
    const { issue } = req.body;
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    const orderItem = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found in order" });
    }
    const exchangeStillDate = new Date(order.exhangedTill); 
    const currentDate = new Date(); 
    if (currentDate > exchangeStillDate) {
      return res.status(200).json({ success: false, error: "Exchange period has expired" });
    }
    orderItem.issue = issue;
    await order.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

//Accept Exchanged Order
exports.acceptProductExchange = async (req, res, next) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const orderItem = order.orderItems.find(item => item.product.toString() === productId);

    if (!orderItem) {
      return res.status(404).json({ success: false, error: "Product not found in order" });
    }

    let currentDate = new Date();
    orderItem.isAccepted = true;
    let fiveDaysLater = new Date(
      currentDate.getTime() + 5 * 24 * 60 * 60 * 1000
    );
    orderItem.exchangedAt = fiveDaysLater;
    await order.save();
    res.status(200).json({ success: true, message: 'Product exchange accepted successfully',orderItem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

//Reject Exchanged Order
exports.rejectProductExchange = async (req, res, next) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const orderItem = order.orderItems.find(item => item.product.toString() === productId);

    if (!orderItem) {
      return res.status(404).json({ success: false, error: "Product not found in order" });
    }

    orderItem.isAccepted = false;
    await order.save();

    res.status(200).json({ success: true, message: 'Product exchange reject successfully',orderItem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

//get Delivered Orders
exports.getDeliveredOrders= async(req,res,next)=>{
  const orders = await Order.find({ isDeleted: false, 
    deliveryStatus:  "Delivered" }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
}
