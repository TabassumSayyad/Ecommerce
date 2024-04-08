const Order = require("../models/orderModel");
const Product = require("../models/productModel");
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
    } else {
      orderData.paidAt = new Date(); // If payment mode is not COD, set paidAt to current date
    }

    const order = await Order.create(orderData);
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
exports.myOrders = async(req,res,next)=>
{
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
}

//get single order
exports.getSingleOrder =async (req, res, next) => {
  try{  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return res.json({success:false,error:"Order not found with this Id"});
  }

  res.status(200).json({
    success: true,
    order,
  });
}
catch(e)
{
  res.status(400).json({success:false,error:e.message})
}
};

//get All Orders(Admin)
exports.getAllOrders =async (req, res, next) => {
  const orders = await Order.find({isDeleted:false});

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
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.json({success:false,error:"Order not found with this Id"});
  }

  if (order.orderStatus === "Delivered") {
    return res.json({success:false,error:"You have already delivered this order"});
  }

  if (req.body.orderStatus === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.orderStatus;

  if (req.body.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
    if (order.paymentInfo.mode === "COD")
    {
      order.paidAt=Date.now();
    }
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.quantity -= quantity;

  await product.save({ validateBeforeSave: false });
}
