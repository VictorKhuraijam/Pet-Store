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
    httpOnly: true,
    secure: true
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

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await User.create({
        name,
        email: email?.toLowerCase(),
        phone,
        password: hashedPassword,
        loginType,
    });

    if (!newUser) {
        throw new ApiError(500, "Error while registering user");
    }

    // Respond with the user details (excluding sensitive fields)
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
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
    let avatarUrl = picture;
    let avatarPublicId;

    if (req.files?.avatar) {
        const avatarLocalPath = req.files.avatar[0].path;
        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar) {
            throw new ApiError(500, "Error while uploading avatar");
        }

        avatarUrl = avatar.url;
        avatarPublicId = avatar.public_id;
    }

    // Create the user
    const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        loginType: "google",
        avatar: avatarUrl
            ? {
                  url: avatarUrl,
                  public_id: avatarPublicId,
              }
            : undefined,
        isEmailVerified: true, // Google login implies verified email
    });

    if (!newUser) {
        throw new ApiError(500, "Error while registering user");
    }

    // Respond with the user details (excluding sensitive fields)
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken -avatar.public_id"
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


// Route for admin login
const adminLogin = async (req, res) => {
    try {

        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


export { loginUser, registerUser, adminLogin }
