import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description:{
      type: String,
      required: true
    },
    images:[
      {
          _id: false,
          url: {
          type: String, // cloudinary url
          required: true,
        },
      }
    ],
    price: {
      type: Number,
      default: 0
    },
    // stock: {
    //   default: 0,
    //   type: Number
    // },
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
