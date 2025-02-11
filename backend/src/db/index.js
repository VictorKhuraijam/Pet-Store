import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async() => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        serverSelectionTimeoutMS: 5000, // Wait 5 seconds before connecting if failed connection
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      }
    );
        {/*
          In older versions, autoReconnect: true would automatically reconnect to MongoDB if the connection was dropped.
          Newer MongoDB drivers handle reconnections automatically using useUnifiedTopology: true, so this option is no longer needed.
       */}
    console.log(`/n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB CONNECTION FAILED :", error);
    process.exit(1)
  }
}

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Retrying in 5 seconds...");
  setTimeout(connectDB, 5000);
});

export default connectDB
