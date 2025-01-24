import mongoose from 'mongoose'
import { Product } from './product.model.js';

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
      type: String,
      required: function () {
        return this.deliveryType === 'DELIVERY';
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED", "RETRIEVED"],
      //enum:user can only choose from the four strings
      default: "PENDING"
    },
    payment: {
      type: String,
      enum: ['PAID', 'NOT_PAID'],
      default: false
    },
  },
  {timestamps: true}
);


export const Order = mongoose.model("Order", orderSchema)
