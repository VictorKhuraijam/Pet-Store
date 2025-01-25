import {User} from "../models/user.model.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'


// add products to user cart
const addToCart = asyncHandler(async (req, res) => {
    const {itemId} = req.body
    const userId = req.user?._id

    const user = await User.findById(userId)

    let cartData = user.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    const itemInCart = await User.findByIdAndUpdate(userId, {cartData},
        {new: true}
    );

    const newCartData = itemInCart.cartData

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                newCartData
            },
            "Item added to cart"
        )
    )
})

// update user cart
const updateCart = asyncHandler(async (req, res) => {

    const userId = req.user?._id
    const {itemId, quantity} = req.body

    if(isNaN(quantity) || typeof quantity !== 'number'){
        throw new ApiError(400, "Enter a valid nuber")
    }

    const user = await User.findById(userId)

    let cartData = await user.cartData;

    cartData[itemId] = quantity

    const updatedCartData = await User.findByIdAndUpdate(userId, {cartData},{new: true})

    const newCartData = updatedCartData.cartData

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {newCartData},
            "Cart Data updated"
        )
    )

})

// get user cart data
const getUserCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(401, "Unauthorized entry")
    }

    const user = await User.findById(userId)

    let cartData = await user.cartData;

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            cartData,
            "User Cart data"
        )
    )
})

export {
    addToCart,
    updateCart,
    getUserCart
}
