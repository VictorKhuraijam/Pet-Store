import {Order} from "../models/order.model.js";
import {Product} from '../models/product.model.js'
import {User} from "../models/user.model.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'




// Placing orders using COD Method
const placeOrder = asyncHandler(async(req, res) => {

    const {userId} = req.user._id
    const { items, amount, address, deliveryType, paymentMethod  } = req.body

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
    if (!address && deliveryType === 'DELIVERY') {
        throw new ApiError(400, "Address is required for delivery orders");
    }

     // Validate items exist in the database
     const validatedItems = await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new ApiError(404, `Product ${item.productId} not found`);
        }

        return {
            productId: product._id,
            quantity: item.quantity
        };
     }));

    const order = await Order.create({
        customer: userId,
        orderItems: validatedItems,
        orderPrice: amount,
        address,
        deliveryType: deliveryType || 'PICKUP',
        paymentMethod: paymentMethod || 'CASH_AT_STORE',
        payment: false,
        status: 'PENDING'
    })

    await User.findByIdAndUpdate(userId, {cartData:{}})

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {order},
            "New Order Placed"
        )
    )
})


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
    const {orderId, status} = req.body

    await Order.findByIdAndUpdate(orderId, {status})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Status updated"
        )
    )
})

// User Order Data For Forntend
const userOrders = asyncHandler(async (req, res) => {
    const {userId} = req.user?._id

    const orders = await Order.find({userId})

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



export {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus
}
