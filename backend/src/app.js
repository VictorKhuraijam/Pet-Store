import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

console.log('Allowed origins:', allowedOrigins); // Log to verify env variable is properly loaded


app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin); // Debugging
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development purposes, you can add this condition
    // if (process.env.NODE_ENV === 'development') {
    //   return callback(null, true);
    // }

    callback(new Error(`Not allowed by CORS: ${origin} is not allowed`));
  },
  credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({limit: '16kb'}))   //to accept json data
app.use(express.urlencoded({extended: true, limit: "16kb"}))
//to accept data from URL

app.use(cookieParser())  // to perform CRUD operation to the cookie in the user browser from the server



//routes import
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import cartRouter from './routes/cart.routes.js'
import { ApiError } from './utils/ApiError.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/cart", cartRouter)


// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//       success: false,
//       message: err.message || "Internal Server Error",
//   });
// });

app.use((err, req, res, next) => {
  console.error("Error caught:", err);

   // Handle Mongoose validation errors as in password length less tha 8
   if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map((e) => e.message).join(", "),
    });
  }

  if (err instanceof ApiError) {
      return res
        .status(err.statusCode)
        .json({
          success: false,
          message: err.message,
          errors: err || []
      });
  } //known API errors

  return res
    .status(500)
    .json({
      success: false,
      message: "Server down. Please try agian later"
  });
});



export {
  app
}
