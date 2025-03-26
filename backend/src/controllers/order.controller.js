import mongoose from "mongoose";
import {Order} from "../models/order.model.js";
import {Product} from '../models/product.model.js'
import {User} from "../models/user.model.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import nodemailer from 'nodemailer';



const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});



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

    const order = await Order.findByIdAndUpdate(orderId,
         {status,payment},
         {new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            order,
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

const sendOrderEmail = async (order, user) => {
    try {
        // Validate inputs
        if (!order || !user) {
            throw new ApiError(400, "Order and user details are required");
        }

        // Calculate total items and total price
        const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);


        const mailOptions = {
            from: user.email,
            to: process.env.EMAIL_FROM, // Send to admin's email
            subject: `New Order Placed - by #${user.username}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333;">New Order Received</h1>

                    <h2>Order Details</h2>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Customer Name:</strong> ${user.username}</p>
                    <p><strong>Customer Email:</strong> ${user.email}</p>
                    <p><strong>Delivery Type:</strong> ${order.deliveryType}</p>
                    <p><strong>Delivery Address:</strong> ${order.address.street}</p>
                    <p><strong>Customer Number:</strong> ${order.address.phone}</p>

                    <h3>Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"> ${item.price?.toFixed(2)}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"> ${(item.quantity * item.price)?.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h3>Order Summary</h3>
                    <p><strong>Total Items:</strong> ${totalItems}</p>
                    <p><strong>Total Amount:</strong> ₹ ${order.orderPrice}</p>
                    <p><strong>Payment Status:</strong> ${order.payment}</p>
                    <p><strong>Order Status:</strong> ${order.status}</p>

                    <p style="margin-top: 20px; color: #666;">
                        Please process this order in the admin dashboard.
                    </p>
                </div>
            `
        };

        // Send email
        await emailTransporter.sendMail(mailOptions);

        console.log(`Order email sent for Order #${user.username}`);
    } catch (error) {
        console.error("Error in sendOrderEmail:", error);
        throw new ApiError(500, "Failed to send order confirmation email to admin");
    }
};


// Placing orders
const placeOrder = asyncHandler(async(req, res) => {

    const userId = req.user._id
    const { items, amount, address, deliveryType } = req.body

    // console.log("Received Order Data:", req.body);

    if(!userId){
        throw new ApiError(401, "Unauthorized access")
    }

     // Find the user placing the order
     const user = await User.findById(userId);
     if (!user) {
         throw new ApiError(404, "User not found");
     }

    // Input validation
    if (!items || !amount) {
        throw new ApiError(400, "Missing required fields: items and amount are required");
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items must be a non-empty array");
    }

    if ( !address ) {
        throw new ApiError(400, "Address is required");
    }

     // Validate items exist in the database
     const validatedItems = await Promise.all(
        items.map(async (item) => {
            // console.log("Processing item:", item); // Debugging line

            if (!item._id) {
                throw new ApiError(400, "Each item must have a productId");
            }

            const product = await Product.findById(item._id);

            if (!product) {
                throw new ApiError(404, `Product ${item._id} not found`);
            }

            return {
                productId: product._id,
                quantity: item.quantity,
                name: item.name,
                price: item.price,
                image: {
                    url: item.images[0]?.url
                }
            };
     }));
    //  console.log("Validated Items :", validatedItems)

    const order = await Order.create({
        customer: userId,
        orderItems: validatedItems,
        orderPrice: amount,
        address,
        deliveryType: deliveryType || 'PICKUP',
        payment: "NOT_PAID",
        status: 'PENDING'
    })

    await User.findByIdAndUpdate(userId, {cartData:{}})


    await sendOrderEmail(order, user);


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
