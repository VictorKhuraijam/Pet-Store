import {Router} from 'express'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {registerUserWithEmailOrPhone, registerUserWithGoogle} from '../controllers/user.controller.js'


const router = Router()

router.route('/register')
.post(
  upload.single("image"),
  registerUserWithEmailOrPhone
)
.post(
  upload.single("image"),
  registerUserWithGoogle
)


export default router
