import validator from "validator";
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {deleteFromCloudinary, uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const options = {
    httpOnly: true,// Prevents JavaScript access to the cookie, reducing XSS risks
    secure: true,//Ensures the cookie is sent only over HTTPS connections.
    sameSite: "Strict" // Prevents the cookie from being sent with cross-site requests (mitigates CSRF(Cross Site Request Forgery ) attacks)

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
const registerUserWithEmailOrPhone = asyncHandler(async (req, res) => {
    const { name, email, phone, password, loginType } = req.body;

    // Validate input for email or phone registration
    if (loginType === "email") {
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        if (!validator.isEmail(email)) {
            throw new ApiError(400, "Please enter a valid email");
        }
    } else if (loginType === "phone") {
        if (!phone || !password) {
            throw new ApiError(400, "Phone and password are required");
        }
        if (!validator.isMobilePhone(phone)) {
            throw new ApiError(400, "Please enter a valid phone number");
        }
    } else {
        throw new ApiError(400, "Invalid login type for email/phone registration");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({
        $or: [
            { email: email?.toLowerCase() },
            { phone },
        ],
    });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // Hash the password
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    let imageLocalPath;
    if(req.files && Array.isArray(req.files.image) && req.files. image.length > 0){
        imageLocalPath = req.files.image[0].path
    }

    const image = await uploadOnCloudinary(imageLocalPath)

    // Create the user
    const user = await User.create({
        username,
        email: email?.toLowerCase(),
        phone,
        password,
        ...(image && {
            image:{
                url: image.url,
                public_id: image.public_id
            }
        }),
        loginType,
    });

     //remove password and refresh Token from response
     const createdUser = await User.findById(user._id).select(
    '-password -refreshToken -image.public_id'
     )

    if (!createdUser) {
        throw new ApiError(500, "Error while registering user");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully")
    );
});

const registerUserWithGoogle = asyncHandler(async (req, res) => {
    const { googleAccessToken } = req.body;

    if (!googleAccessToken) {
        throw new ApiError(400, "Google access token is required");
    }

    // Verify Google token
    let googleData;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: googleAccessToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        googleData = ticket.getPayload();
    } catch (error) {
        throw new ApiError(400, "Invalid Google token");
    }

    const { email, name, picture } = googleData;

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // Handle avatar upload if provided in Google data
    let imageUrl = picture;

    // Create the user
    const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        loginType: "google",
        image: imageUrl
            ? {
                  url: imageUrl,
              }
            : undefined,
        isGoogleVerified: true, // Google login implies verified email
    });

    if (!newUser) {
        throw new ApiError(500, "Error while registering user");
    }

    // Respond with the user details (excluding sensitive fields)
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken "
    );

    return res
        .status(201)
        .json(
        new ApiResponse(
                201,
                createdUser,
                "User registered successfully"
            )
    );
});

// Route for user login
const loginUser = asyncHandler(async (req, res) => {


    const { email, phone,  password } = req.body;

    if(!(phone || email)){
        throw new ApiError(400,"Username or phone number is required")
        }

    const user = await User.findOne({
        $or: [
            { email: email?.toLowerCase() },
            { phone },
        ],
    });

    if (!user) {
        throw new ApiError(404, "User does not exits")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -image.public_id")

    return res
    .status(200)
    .cookie("accessToken", accessToken, options) //can be read but only accessable from server
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },//for cases when user want to save access and refresh token on local storage etc
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
            email+password,
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );

        return res
        .status(200)
        .cookie("token",token, options)
        .json(new ApiResponse(
            200,
            {token},
            "Admin logged in sccessfully"
        ))

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
    registerUserWithEmailOrPhone,
    registerUserWithGoogle,
    adminLogin,
    adminLogout
 }
