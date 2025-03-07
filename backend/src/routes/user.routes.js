import {Router} from 'express'
import { verifyJWT } from "../middleware/auth.middleware.js";
import adminAuth from '../middleware/adminAuth.middleware.js'
import {
    registerUser,
    verifyOTPAndRegister,
    resendOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPassword,
    changeForgotPassword,
    getStoreStatus,
    checkAuthStatus,
    updateAccountDetails,
    deleteUser,
    adminLogin,
    storeStatus,
    getAdminAuthStatus,
    adminLogout,

} from '../controllers/user.controller.js'


const router = Router()

router.route('/register').post(registerUser)
router.route('/verify-otp').post(verifyOTPAndRegister);
router.route("/resend-otp").post(
  resendOTP
);

router.route("/login").post(loginUser)
router.route("/check-auth").get(checkAuthStatus)
router.route("/store-status").get(getStoreStatus)


//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/forgot-password").post( forgotPassword)
router.route("/change-forgot-password").post( changeForgotPassword)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/change-username").post(verifyJWT, updateAccountDetails)

router.route("/delete-account").delete(verifyJWT, deleteUser)

//admin routes
router.route('/admin/login').post(adminLogin)
router.route('/admin/check-auth').get(adminAuth, getAdminAuthStatus)
router.route('/admin/store-status').post(adminAuth, storeStatus)
router.route('/admin/logout').post(adminAuth, adminLogout)


export default router
