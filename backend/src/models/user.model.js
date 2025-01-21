import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      validate: [validator.isEmail, 'Invalid Email'],
      lowercase: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // email verification status
    },
    emailVerificationTimestamp: {
      type: Date,
      default: Date.now
    },
    emailVerificationToken: {
      type: String,
      sparse: true
    },
    emailVerificationExpires: {
      type: Date,
      sparse: true
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false, // phone verification status
    },
    phoneVerificationOTP: {
      type: String,
      sparse: true
    },
    phoneVerificationExpires: {
        type: Date,
        sparse: true
    },
    otpAttempts: {
        type: Number,
        default: 0
    },
    password: {
      type: String,
      required: function () {
        // Password is required if the user is not using Google login.
        return !this.isGoogleVerified;
      },
      minlength: [8, 'Password must be at least 8 characters long']
    },
    // isGoogleVerified: {
    //   type: Boolean,
    //   default: false, // Google login status
    // },
    // googleId: {
    //   type: String,
    //   sparse: true,  // allows empty googleId for users using email/phone only
    // },
    loginType: {
      type: String,
      enum: ["email", "phone", "google"],
      required: true
    },
    cartData: {
      type: Object,
      default: {}
    },
    refreshToken: {
      type: String
    },
  },
  {timestamps: true}
);

userSchema.pre("save", async function(next){
  if(!this.isModified("password") || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password,10)
    next()
  } catch (error) {
    next(error); //pass error to Mongoose
  }
});
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password) // returns true or false. compare password with the encrypted password
}

userSchema.methods.generateAccessToken = function(){
 try {
   return jwt.sign(
     {
       _id: this._id,
       email: this.email,
       username: this.username,
     }, //payload
     process.env.ACCESS_TOKEN_SECRET,
     {
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "12h"
     }
   )
 } catch (error) {
  console.error("Error generating access token:", error.message);
  throw new Error("Could not generate access token")
 }
}

userSchema.methods.generateRefreshToken = function(){
 try {
  return jwt.sign(
     {
       _id: this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "5d"
     }
   )
 } catch (error) {
  console.error("Error generating refresh token:", error.message);
  throw new Error(" Could not generate refresh token");
 }
}

// Method to verify email (can be called when clicking the email verification link)
userSchema.methods.verifyEmail = function () {
  this.isEmailVerified = true;
  return this.save();
};

// Method to verify phone (can be called when OTP is verified)
userSchema.methods.verifyPhone = function () {
  this.isPhoneVerified = true;
  return this.save();
};

// Method to handle Google login (sets googleId and email verification if applicable)
userSchema.methods.googleLogin = function (googleId, email) {
  this.googleId = googleId;
  this.isGoogleVerified = true;
  this.email = email;  // If the user logs in via Google, email is updated.
  return this.save();
};

export const User = mongoose.model("User", userSchema)
