import { Router } from "express";
import {
    addToCart,
    updateCart,
    getUserCart
} from '../controllers/cartController.js'
import {verifyJWT} from '../middleware/auth.middleware.js'

const cartRouter = Router()

cartRouter.route('/get').get(verifyJWT, getUserCart)
cartRouter.route('/add').post(verifyJWT, addToCart)
cartRouter.route('/update').post(verifyJWT, updateCart)

export default cartRouter
