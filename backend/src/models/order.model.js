import mongoose from 'mongoose'
import { Product } from './product.model.js';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: {
    type: Number,
    required: true
  }
});

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
    paymentMethod: {
      type: String,
      enum: ['CASH_ON_DELIVERY', 'CASH_AT_STORE'],
      required: true,
    },
    payment: {
      type: Boolean,
      default: false },
  },
  {timestamps: true}
);


export const Order = mongoose.model("Order", orderSchema)
