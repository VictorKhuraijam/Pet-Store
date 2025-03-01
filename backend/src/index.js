
import connectDB from './db/index.js'
import { app } from './app.js';
import { startCronJobs } from './utils/cleanupDb.js';



const startServer = async () => {
  try {
      await connectDB(); // Database connection using await

      startCronJobs(); // Cron job initialization

      app.on("error", (error) => {
          console.error("Error: Application encountered an error", error);
          throw error;
      });

      app.get('/', (req, res) => {
        res.json({ success: true, message: "Connection establised! " });

      });

      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
          console.log(`Server is running at port: ${PORT}`);
      });
  } catch (err) {
      console.error("MongoDB connection failed!", err);
      process.exit(1); // Exit process if database connection fails
  }
};

startServer();
