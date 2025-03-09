import validator from "validator";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {Store} from '../models/store.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
// import twilio from 'twilio';

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});



// Generate verification token
// const generateVerificationToken = () => {
//     return crypto.randomBytes(32).toString("hex");
// };

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const options = {
    httpOnly: true,// Prevents JavaScript access to the cookie, reducing XSS risks
    secure: true,//Ensures the cookie is sent only over HTTPS connections.
    sameSite: "None", // Prevents the cookie from being sent with cross-site requests (mitigates CSRF(Cross Site Request Forgery ) attacks)
    path: '/',
  }

const generateAccessTokenAndRefreshToken = async (userId) => {
try {
    const user = await User.findById(userId);

    if (!user) {
    throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})//skips schema validation

    return {
    accessToken,
    refreshToken
    }
} catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
}
}

// Route for user register
const sendOTPEmail = async (user, otp, type = 'registration') => {
    try {
        const isRegistration = type === 'registration'

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: isRegistration
            ? "Your Registration OTP Code"
            : "Reset Your Password - OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333;">
                        ${isRegistration ? "Complete Your Registration" : "Reset Your Password"}
                    </h1>
                    <p>Hello ${user.username},</p>
                    <p>${isRegistration
                        ? "Your OTP code for registration is:"
                        : "Your OTP to reset password is:"}
                    </p>
                    <div style="margin: 30px 0;">
                        <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
                    </div>
                    <p>This OTP code will expire in 10 minutes.</p>
                    <p style="color: #666; margin-top: 20px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `
        };

        await emailTransporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error in sendOTPEmail:", error);
        throw new ApiError(500, "Failed to send OTP email");
    }
};


// Step 1: Initialize registration and send OTP
const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Please enter a valid email");
    }

    const existingUser = await User.findOne({
         email: email.toLowerCase(),
         isRegistrationComplete: true
        });


    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const pendingUser = await User.findOne({
        email: email.toLowerCase(),
        isRegistrationComplete: false
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;

    if (pendingUser) {
        // Update existing pending user
        pendingUser.username = username;
        pendingUser.password = password; // Will be hashed by pre-save middleware
        pendingUser.otp = otp;
        pendingUser.otpExpires = otpExpires;
        user = await pendingUser.save();
    } else {
        // Create new user
        user = await User.create({
            username,
            email: email.toLowerCase(),
            password, // Will be hashed by pre-save middleware
            otp,
            otpExpires,
            isRegistrationComplete: false,
            isEmailVerified: false
        });
    }

    if (!user) {
        throw new ApiError(500, "Error while creating user");
    }

    await sendOTPEmail(user, otp, 'registration');

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            email,
            "OTP sent successfully to your email"
        )
    );
});

// Step 2: Verify OTP and complete registration
const verifyOTPAndRegister = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
        otp,
        otpExpires: { $gt: Date.now() },
        isRegistrationComplete: false
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Complete registration
    user.isRegistrationComplete = true;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate tokens
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const registeredUser = await User.findById(user._id).select(
        "-password -refreshToken -otp -otpExpires"
    );

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: registeredUser,
                    accessToken,
                    refreshToken
                },
                "Registration completed successfully"
            )
        );
});

// Resend OTP if expired
const resendOTP = asyncHandler(async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    let user;

    if (type === "registration") {
        // Find a user with incomplete registration
        user = await User.findOne({
            email: email.toLowerCase(),
            isRegistrationComplete: false
        });

        if (!user) {
            throw new ApiError(404, "No pending registration found for this email");
        }
    } else if (type === "password-reset") {
        // Find a registered user
        user = await User.findOne({
            email: email.toLowerCase(),
            isRegistrationComplete: true // Ensure the user is registered
        });

    if (!user) {
        throw new ApiError(404, "No pending registration found for this email");
      }
    //  else {
    //     throw new ApiError(400, "Invalid OTP")
    // }
}

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000).toLocaleString(); // 10 minutes
    await user.save();

    await sendOTPEmail(user, otp, type);

    return res.status(200).json(
        new ApiResponse(
            200,
            { type},
            "New OTP sent successfully"
        )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const {email, type = "password-reset"} = req.body

    const existingUser = await User.findOne({
        email: email.toLowerCase(),
        isRegistrationComplete: true,
        isEmailVerified: true
       });

    if(!existingUser){
        throw new ApiError(400, "Email is not registered or is not verified")
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    existingUser.otp = otp;
    existingUser.otpExpires = otpExpires;
    const  user = await existingUser.save();

    await sendOTPEmail(user, otp, type)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "OTP sent to the email to change password"
        )
    )
})

const changeForgotPassword = asyncHandler(async (req, res) => {
    const {email, otp, password} = req.body

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
        otp,
        otpExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.password = password
    await user.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )


})

// Route for user login
const loginUser = asyncHandler(async (req, res) => {

    const { email,  password } = req.body;

    if(!email){
        throw new ApiError(400,"Email is required")
        }

    const user = await User.findOne(
            { email: email?.toLowerCase() },
    );

    if (!user) {
        throw new ApiError(404, "User with the email does not exits")
    }

    if (!user.isEmailVerified) {
        await sendVerificationEmail(user);

        throw new ApiError(
            401,
            "Please verify your email before logging in. A new verification email has been sent to your email address."
        );
    }

    // if(user.refreshToken){
    //     throw new ApiError(401," User is already logged in")
    // }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")

    return res
    .status(200)
    .cookie("accessToken", accessToken, options) //can be read but only accessable from server
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        loggedInUser,
        "User logged in successfully"
      )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: "" }
      },
        {
          new: true // Ensures the updated user document is returned
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized request")
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )

      const user = await User.findById(decodedToken?._id)

      if(!user){
        throw new ApiError(401, "Invalid refresh token")
      }

      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token is expired or used")
      }

      const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)



      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken
          },
          "Access token refreshed"
        )
      )
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword,  confirmPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid password")
    }

    user.password = confirmPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Password changed successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {username} = req.body
    const userId = req.user._id

    if(!username){
      throw new ApiError(400, "Username is required")
    }

    const user = await User.findByIdAndUpdate(
        userId,
      {
        $set: {
            username,
        }
      },
      {new: true}
    ).select("-password -refreshToken ")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully" ))

})

const getStoreStatus = asyncHandler(async (req, res) => {
    let status = await Store.findOne()

    if (!status) {
        status = await Store.create({ isOpen: false });
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            status,
            "Fetched Store status"
        ))
})


// const getCurrentUser = asyncHandler(async(req, res) => {
// return res
// .status(200)
// .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
// })

const checkAuthStatus = asyncHandler(async (req, res) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    // console.log("Old refresh token stored in the brower: ", refreshToken)
    // console.log("Old access token stored in the brower: ", accessToken)


    if (!accessToken && !refreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        decodedToken = null;
    }

    let user;

    if (decodedToken) {
        // Access token is valid, Fetch user
        user = await User.findById(decodedToken._id).select("-password");
        // console.log("User through access token:", user)

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {user,

                },
                "User authenticated",
            )
        );
    }

    // If access token is expired but refresh token is valid, generate new tokens
    let decodedRefreshToken;
    if (refreshToken) {
        try {
             decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if(!decodedRefreshToken){
                throw new ApiError(500, "Refresh decoded token problem")
            }

            user = await User.findById(decodedRefreshToken._id);


            if (!user ) {
                throw new ApiError(401, "Invalid refresh token");
            }

            if (user.refreshToken !== refreshToken) {
                console.log("Stored Token:", user.refreshToken);
                console.log("Received Token:", refreshToken);

                throw new ApiError(401, "Refresh token mismatch. Possible session hijacking.");
            }

            //  Generate new access & refresh tokens
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

            console.log("New Refresh Token:", newRefreshToken);
            user = await User.findById(decodedRefreshToken._id).select("-password ");

            console.log("User after refresh token refreshed :", user)

            return res
                .status(200)
                .cookie("accessToken", newAccessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {user
                        },
                        "Access and refresh token refreshed"
                    )
                );
        }  catch (error) {
            return res
            .status(401)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Session expired. Please log in again"))
            }
    }
});





// Send verification email
// const sendVerificationEmail = async (user) => {
//     try {
//         const verificationToken = generateVerificationToken();

//         // Save token to user
//         user.emailVerificationToken = verificationToken;
//         user.emailVerificationExpires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
//         await user.save({ validateBeforeSave: false });

//         const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: user.email,
//             subject: 'Verify Your Email - Account Registration',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//                     <h1 style="color: #333;">Verify Your Email</h1>
//                     <p>Hello ${user.username},</p>
//                     <p>Thank you for registering. Please click the button below to verify your email address:</p>
//                     <div style="margin: 30px 0;">
//                         <a href="${verificationUrl}"
//                            style="background-color: #007bff; color: white; padding: 12px 24px;
//                                   text-decoration: none; border-radius: 4px; display: inline-block;">
//                             Verify Email
//                         </a>
//                     </div>
//                     <p>This link will expire in 24 hours for security reasons.</p>
//                     <p style="color: #666; margin-top: 20px;">
//                         If you didn't create an account, you can safely ignore this email.
//                     </p>
//                     <p style="color: #666; font-size: 12px;">
//                         If the button doesn't work, copy and paste this link into your browser:<br>
//                         ${verificationUrl}
//                     </p>
//                 </div>
//             `
//         };
//         console.log("Sending email to:", user.email);

//         await emailTransporter.sendMail(mailOptions);
//     } catch (error) {
//         console.error("Error in sendVerificationEmail:", error.message, error.stack);

//         // Clean up token if email sending fails
//         user.emailVerificationToken = undefined;
//         user.emailVerificationExpires = undefined;
//         await user.save({ validateBeforeSave: false });

//         throw new ApiError(500, "Failed to send verification email. Please try again.");
//     }
// };

// // Verify email
// const verifyEmail = asyncHandler(async (req, res) => {
//     const { token } = req.params;

//     const user = await User.findOne({
//         emailVerificationToken: token,
//         emailVerificationExpires: { $gt: Date.now() } //greater than
//     });

//     if (!user) {
//         throw new ApiError(400, "Invalid or expired verification token");
//     }

//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     user.emailVerificationTimestamp = undefined;
//     await user.save({ validateBeforeSave: false });

//     const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

//      // Get user data without sensitive fields
//     const verifiedUser = await User.findById(user._id).select(
//         "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
//     );

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 user: verifiedUser,
//                 accessToken,
//                 refreshToken
//             },
//             "Email verified successfully and user logged in")
//     );
// });

// // Resend email verification
// const resendEmailVerification = asyncHandler(async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         throw new ApiError(400, "Email is required");
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     if (user.isEmailVerified) {
//         throw new ApiError(400, "Email already verified");
//     }

//     // Check if we've sent a verification email recently
//     if (user.emailVerificationExpires && user.emailVerificationExpires > Date.now()) {
//         const waitTime = Math.ceil((user.emailVerificationExpires - Date.now()) / 1000 / 60);
//         throw new ApiError(429, `Please wait ${waitTime} minutes before requesting another verification email`);
//     }

//     await sendVerificationEmail(user);

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {},
//             "Verification email sent successfully"
//         )
//     );
// });

// Send OTP via SMS
// const sendOTP = async (user) => {
//    try {
//      const otp = generateOTP();

//      // Save OTP to user
//      user.phoneVerificationOTP = otp;
//      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//      await user.save({ validateBeforeSave: false });

//      await twilioClient.messages.create({
//          body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
//          to: user.phone,
//          from: process.env.TWILIO_PHONE_NUMBER
//      });
//    } catch (error) {
//         console.log("The twilio error message is",error.message)
//    }
// }

// // Verify phone OTP
// const verifyPhone = asyncHandler(async (req, res) => {
//     const { otp } = req.body;
//     const userId = req.user._id;

//     const user = await User.findOne({
//         _id: userId,
//         phoneVerificationOTP: otp,
//         phoneVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//         throw new ApiError(400, "Invalid or expired OTP");
//     }

//     user.isPhoneVerified = true;
//     user.phoneVerificationOTP = undefined;
//     user.phoneVerificationExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     // Generate new tokens

//     const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

//     // Get user data without sensitive fields
//     const verifiedUser = await User.findById(user._id).select(
//         "-password -refreshToken -phoneVerificationOTP -phoneVerificationExpires -otpAttempts"
//     );

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 user: verifiedUser,
//                 accessToken,
//                 refreshToken
//             },
//             "Phone number verified successfully"
//         )
//     );
// });

// // Resend phone OTP
// const resendPhoneOTP = asyncHandler(async (req, res) => {
//     const { phone } = req.body;

//     if (!phone) {
//         throw new ApiError(400, "Phone number is required");
//     }

//     const user = await User.findOne({ phone });

//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     if (user.isPhoneVerified) {
//         throw new ApiError(400, "Phone already verified");
//     }

//     // Check if we've sent an OTP recently
//     if (user.phoneVerificationExpires && user.phoneVerificationExpires > Date.now()) {
//         const waitTime = Math.ceil((user.phoneVerificationExpires - Date.now()) / 1000);
//         throw new ApiError(429, `Please wait ${waitTime} seconds before requesting another OTP`);
//     }

//     await sendOTP(user);

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {},
//             "OTP sent successfully"
//         )
//     );
// });

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { password } = req.body;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Find the user first to ensure they exist
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }


    if (password) {
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid password");
        }
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError(500, "Error while deleting user");
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User deleted successfully"
            )
        );
});

// Route for admin login
const adminLogin = asyncHandler(async (req, res) => {

        const {email,password} = req.body

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            throw new ApiError(400, "Invalid email or password")
        }

        const token = jwt.sign(
            {email },
            process.env.JWT_SECRET,
            { expiresIn: '4h'}
        );

        return res
        .status(200)
        .cookie("token",token, options)
        .json(new ApiResponse(
            200,
            token,
            "Admin logged in sccessfully"
        ))

})

const storeStatus = asyncHandler(async (req, res) => {
    const {isOpen} = req.body

     await Store.findOneAndUpdate(
        {},
        { isOpen },
        { new: true}
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Store Status updated"
            )
        )



})

const getAdminAuthStatus = asyncHandler(async (req, res) => {
    if(!req.admin || !req.admin.isAdmin){
        throw new ApiError(403, "Admin authentication required")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.admin,
            "Admin is authecticated"
        )
    )
})

const adminLogout = asyncHandler(async (req, res) => {
    res
    .status(200)
    .clearCookie("token", options)
    .json(
        new ApiResponse(
            200,
            null,
            "Admin logged out successfully"
        )
    )
})



export {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPassword,
    changeForgotPassword,
    updateAccountDetails,
    getStoreStatus,
    checkAuthStatus,
    verifyOTPAndRegister,
    resendOTP,
    deleteUser,
    adminLogin,
    storeStatus,
    getAdminAuthStatus,
    adminLogout
 }
