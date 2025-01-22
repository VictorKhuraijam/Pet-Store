import {Router} from 'express'
import {
  placeOrder,
  allOrders,
  userOrders,
  updateStatus
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.middleware.js'
import {verifyJWT} from '../middleware/auth.middleware.js'

const router = Router()

router.route('/list').post(adminAuth, allOrders)
router.route('/status').post(adminAuth, updateStatus)

router.route('/placeOrder').post(verifyJWT, placeOrder)
router.route('/userOrders').post(verifyJWT, userOrders)

export default router
