import {Router} from 'express'
import {
  placeOrder,
  allOrders,
  userOrders,
  updateStatus
} from '../controllers/order.controller.js'
import adminAuth from '../middleware/adminAuth.middleware.js'
import {verifyJWT} from '../middleware/auth.middleware.js'

const router = Router()

router.route('/list').get(adminAuth, allOrders)
router.route('/status').post(adminAuth, updateStatus)

router.route('/placeOrder').post(verifyJWT, placeOrder)
router.route('/userOrders').get(verifyJWT, userOrders)

export default router
