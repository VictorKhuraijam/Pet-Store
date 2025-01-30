import mongoose from "mongoose";
import {Order} from "../models/order.model.js";
import {Product} from '../models/product.model.js'
import {User} from "../models/user.model.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'



// All Orders data for Admin Panel
const allOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            {orders},
            "Orders fetched"
        )
    )
})

// update order status from Admin Panel
const updateStatus = asyncHandler(async(req, res) => {
    const {orderId, status, payment} = req.body

    const order = await Order.findByIdAndUpdate(orderId, {status,payment},{new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {order},
            "Status updated"
        )
    )
})

// User Order Data For Forntend
const userOrders = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const orders = await Order.find({customer: new mongoose.Types.ObjectId(userId)}).populate({
        path: 'orderItems.productId',
        model: 'Product',
        select: 'name price images.url' //Fields to include in the response
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {orders},
            "User Orders fetched successfully"
        )
    )
})

// Placing orders
const placeOrder = asyncHandler(async(req, res) => {

    const userId = req.user._id
    const { items, amount, address, deliveryType, paymentMethod  } = req.body

    console.log("Received Order Data:", req.body);

    if(!userId){
        throw new ApiError(401, "Unauthorized access")
    }

    // Input validation
    if (!items || !amount) {
        throw new ApiError(400, "Missing required fields: items and amount are required");
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items must be a non-empty array");
    }

    // Validate if address is provided for delivery
    if (!address ) {
        throw new ApiError(400, "Address is required");
    }

     // Validate items exist in the database
     const validatedItems = await Promise.all(
        items.map(async (item) => {
            console.log("Processing item:", item); // Debugging line


            if (!item._id) {
                throw new ApiError(400, "Each item must have a productId");
            }

            const product = await Product.findById(item._id);

            if (!product) {
                throw new ApiError(404, `Product ${item.productId} not found`);
            }

            return {
                productId: product._id,
                quantity: item.quantity,
            };
     }));

    const order = await Order.create({
        customer: userId,
        orderItems: validatedItems,
        orderPrice: amount,
        address,
        deliveryType: deliveryType || 'PICKUP',
        paymentMethod: paymentMethod || 'CASH_AT_STORE',
        payment: "NOT_PAID",
        status: 'PENDING'
    })

    await User.findByIdAndUpdate(userId, {cartData:{}})

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            order,
            "New Order Placed"
        )
    )
})

export {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus
}
