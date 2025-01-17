import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: true
    },
    cartData: {
      type: Object,
      default: {}
    },
    refreshToken: {
      type: String
    }
  },
  {timestamps: true}
);

userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
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
       fullName: this.fullName
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
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "20d"
     }
   )
 } catch (error) {
  console.error("Error generating refresh token:", error.message);
  throw new Error(" Could not generate refresh token");
 }
}


export const User = mongoose.model("User", userSchema)
