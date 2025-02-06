import {Router} from 'express'
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middleware/auth.middleware.js";
import adminAuth from '../middleware/adminAuth.middleware.js'
import {
    registerUserWithEmail,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    verifyEmail,
    resendEmailVerification,
    deleteUser,
    adminLogin,
    getAdminAuthStatus,
    adminLogout,



} from '../controllers/user.controller.js'


const router = Router()

router.route('/register')
.post(
  upload.single("image"),
  registerUserWithEmail
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/change-username").post(verifyJWT, updateAccountDetails)

router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/delete-user").get(verifyJWT, deleteUser)

router.route('/verify-email/:token').get(verifyEmail);
router.route("/resend-verification").post(
  resendEmailVerification
);

// router.route("/verify-phone").post( verifyJWT, verifyPhone);
// router.route("/resend-otp").post( verifyJWT, resendPhoneOTP);

router.route('/admin/login').post(adminLogin)
router.route('/admin/check-auth').get(adminAuth, getAdminAuthStatus)
router.route('/admin/logout').post(adminAuth, adminLogout)


export default router
