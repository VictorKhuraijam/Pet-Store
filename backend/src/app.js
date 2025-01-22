import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit: '16kb'}))   //to accept json data
app.use(express.urlencoded({extended: true, limit: "16kb"}))
//to accept data from URL

app.use(cookieParser())  // to perform CRUD operation to the cookie in the user browser from the server



//routes import
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)

export {
  app
}
