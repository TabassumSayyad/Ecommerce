const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.processPayment = async (req, res, next) => {
  try{
  const { product } = req.body;
  const lineItems = product.map((product) => ({
    price_data:{
        currency:"inr",
        product_data:{
            name:product.title
        },
        unit_amount:product.price*100,
    },
    quantity:product.quantity
  }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items:lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  res.json({id:session.id})
}
catch(e)
{
  res.status(400).json({success:false,e})
}
};
