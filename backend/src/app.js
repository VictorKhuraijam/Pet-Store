
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  // origin: process.env.CORS_ORIGIN,
  origin: 'http://127.0.0.1:5173',
  credentials: true
}))

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

  if (err instanceof ApiError) {
      return res
        .status(err.statusCode)
        .json({
          success: false,
          message: err.message,
          errors: err || []
      });
  }

  return res
    .status(500)
    .json({
      success: false,
      message: "Internal Server Error"
  });
});



export {
  app
}
