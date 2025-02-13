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
    otp: {
      type: String,
      sparse: true
    },
    otpExpires: {
      type: Date,
      sparse: true
    },
    isRegistrationComplete: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long']
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
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1m"
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
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "1h"
     }
   )
 } catch (error) {
  console.error("Error generating refresh token:", error.message);
  throw new Error(" Could not generate refresh token");
 }
}

export const User = mongoose.model("User", userSchema)
