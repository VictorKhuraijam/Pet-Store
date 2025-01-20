import {Router} from 'express'
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUserWithEmailOrPhone,
  registerUserWithGoogle,
  resendEmailVerification,
  verifyEmail,
  verifyOTP,
  resendOTP


} from '../controllers/user.controller.js'


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

router.route('/verify-email/:token ').get(verifyEmail);
router.route("/resend-verification").post(
  verifyJWT,
  resendEmailVerification
);

router.route("/verify-phone").post( verifyJWT, verifyOTP);
router.route("/resend-otp").post( verifyJWT, resendOTP);


export default router
