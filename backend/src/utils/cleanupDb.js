import {User} from '../models/user.model.js'
import cron from 'node-cron'

const cleanupUnverifiedUsers = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      // Delete users where `isEmailVerified` is false and timestamp is older than 12 hours
      const result = await User.deleteMany({
          isEmailVerified: false,
          emailVerificationTimestamp: { $lte: twentyFourHoursAgo },
      });

      console.log(`${result.deletedCount} unverified users deleted.`);
  } catch (error) {
      console.error("Error during cleanup:", error.message);
  }
};


export const startCronJobs = () => {
   try {
      // "0 11 * * *" --> min hour (day of the month) (month (1 - 12)) (day of the week (0 - 7, where both 0 and 7 represent Sunday))
     // Run the cleanup job every day at 11 a.m.
     const job = cron.schedule("0 11 * * *", async () => {
         console.log("Running cleanup job for unverified users...");
         await cleanupUnverifiedUsers();
     });

     console.log("Cron jobs initialized!");

     // Graceful shutdown
     //SIGTERM (Signal Terminate) is a signal used to gracefully terminate a process.
     process.on("SIGTERM", () => {
       console.log("Shutting down cron jobs...");
       job.stop();
   })
   } catch (error) {
      console.error("Error during cleanup job:", error.message)
   }
};
