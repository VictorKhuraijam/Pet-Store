import {User} from "../models/user.model.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'


// add products to user cart
const addToCart = asyncHandler(async (req, res) => {
    const {itemId} = req.body
    const {userId} = req.user?._id

    const userData = await User.findById(userId)

    let cartData = userData.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    const itemInCart = await User.findByIdAndUpdate(userId, {cartData});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                itemInCart
            },
            "Item added to cart"
        )
    )
})

// update user cart
const updateCart = async (req,res) => {
    try {

        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {

        const { userId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }
