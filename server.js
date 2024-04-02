const express = require("express");
const cors = require("cors");
const app = express();
require("./db/conn");
const userRoute = require("./routers/userRoute");
const productRoute=require("./routers/productRoute");
const contactRoute=require("./routers/contactRoute");
const cookieParser=require('cookie-parser')
const path = require("path")
require('dotenv').config({path:path.resolve(__dirname,"./config/config.env")})
const dbConnection= require("./db/conn")
dbConnection();

// console.log(process.env.PORT)
const port = process.env.PORT || 8000;

console.log(__dirname)

app.use("/uploads/images",express.static("uploads/images"))
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/v1",userRoute);
app.use("/api/v1",productRoute);
app.use("/api/v1",contactRoute);

app.listen(port, () => {
    console.log(`Connection is setup at port ${port}`);
  });

