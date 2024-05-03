const express = require("express");
const cors = require("cors");
const cron = require('node-cron');
const app = express();
const userRoute = require("./routers/userRoute");
const productRoute = require("./routers/productRoute");
const contactRoute = require("./routers/contactRoute");
const categoryRoute = require("./routers/categoryRoute");
const orderRoute = require("./routers/orderRoute");
const paymentRoute = require("./routers/paymentRoute");
const {orderDelayNotification}= require("./controller/orderController")
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "./config/config.env"),
});
const dbConnection = require("./db/conn");
const { config } = require("dotenv");
dbConnection();
const port = process.env.PORT || 8000;

app.use("/uploads/images", express.static("uploads/images"));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

cron.schedule("0 10 * * *", orderDelayNotification);

app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", contactRoute);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);

app.listen(port, () => {
  console.log(`Connection is setup at port ${port}`);
});
