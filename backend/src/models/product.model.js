import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    description:{
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    productImage: {
      type: String
    },
    price: {
      type: Number,
      default: 0
    },
    category:{
      type: String,
      require: true
    },
    type: {
      type: String,
      require: true
    },
    bestseller: {
      type: Boolean
    }
  },
  {timestamps: true}
);

export const Product = mongoose.model("Product", productSchema)
