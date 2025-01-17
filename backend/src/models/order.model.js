import mongoose from 'mongoose'

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
    orderPrice: {
      type: Number,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    orderItems: {
      types: [orderItemSchema]
      /*
      or type:[
        {
           productId: {
             type: mongoose.Schema.Types.ObjectId,
             ref: "Product"
        },
            quantity: {
              type: Number,
              required: true
            }
        }
      ]
      */
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
      enum: ["PENDING", "CANCELLED", "DELIVERED"],
      //enum:user can only choose from the three strings
      default: "PENDING"
    },
    paymentMethod: {
      type: String,
      type: String,
      enum: ['CASH_ON_DELIVERY', 'CASH_AT_STORE', 'GPAY'],
      required: true,
    },
    payment: {
      type: Boolean,
      default: false },
  },
  {timestamps: true}
);

export const Order = mongoose.model("Order", orderSchema)
