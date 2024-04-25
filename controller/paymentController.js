const Razorpay = require("razorpay");
const crypto = require("crypto");
exports.checkout = async (req, res, next) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });
  try {
    // console.log(instance);
    const options = req.body;
    const order = await instance.orders.create(options);
    if (!order) {
      return res.status(500).json({ success: false, error: "error" });
    }
    // console.log(order);
    return res.status(200).json({ success: true, order });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
};

exports.paymentVerification = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET);
    // order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: "Transaction is not legit" });
    }
    return res
      .status(200)
      .json({
        success: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
};

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// exports.processPayment = async (req, res, next) => {
//   try{
//   const { products } = req.body;
//   console.log(products)
//   const lineItems = products.map((product) => ({
//     price_data:{
//         currency:"inr",
//         product_data:{
//             name:product.title
//         },
//         unit_amount:product.price*100,
//     },
//     quantity:product.quantity
//   }));
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items:lineItems,
//     mode: "payment",
//     success_url: "http://localhost:5173/success",
//     cancel_url: "http://localhost:5173/cancel",
//   });

//   res.json({id:session.id})
// }
// catch(e)
// {
//   res.status(400).json({success:false,e})
// }
// };
