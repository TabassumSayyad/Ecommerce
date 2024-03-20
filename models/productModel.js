const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
   title:String,
   description:String,
   category:String,
   subCategory:String,
   price:Number,
   quantity:Number,
   createAt:
   {
      type:Date,
      default:Date.now()
   },
   updatedAt:{
      type:Date,
      default:Date.now()
   },
   images: [String] ,
   isDeleted:
   {
      type:Boolean,
      default:false
   }
})


const Product = new mongoose.model("Product", productSchema)

module.exports = Product