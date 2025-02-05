import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: {
    type: Number,
    default: 1,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  image:{
    url: {
      type: String, // cloudinary url
      required: true,
    },
  }
},{ _id: false });

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    orderPrice: {
      type: Number,
      required: true
    },
    orderItems:{
      type: [orderItemSchema]
    },
    deliveryType: {
      type: String,
      enum: ['DELIVERY', 'PICKUP'],
      required: true,
      default: 'DELIVERY',
    },
    address: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED", "PACKED", "OUT FOR DELIVERY"],
      default: "PENDING"
    },
    payment: {
      type: String,
      enum: ['PAID', 'NOT_PAID'],
      default: 'NOT_PAID'
    },
  },
  {timestamps: true}
);


export const Order = mongoose.model("Order", orderSchema)
