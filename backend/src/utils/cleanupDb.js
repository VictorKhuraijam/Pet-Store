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



// Function to remove oldest orders when a user has more than 15 orders
const trimUserOrders = async () => {
    try {
      // Find all users
      const users = await User.find({}, '_id');
      let totalOrdersDeleted = 0;

      // Process each user
      for (const user of users) {
        // Get all orders for this user, sorted by creation date (oldest first)
        const userOrders = await Order.find({ customer: user._id })
          .sort({ createdAt: 1 });

        // If user has more than 15 orders, delete the oldest ones
        if (userOrders.length > 15) {
          const ordersToDelete = userOrders.slice(0, userOrders.length - 15);
          const orderIds = ordersToDelete.map(order => order._id);

          // Delete the oldest orders
          const result = await Order.deleteMany({ _id: { $in: orderIds } });
          totalOrdersDeleted += result.deletedCount;
        }
      }

      console.log(`Trimmed orders: ${totalOrdersDeleted} old orders removed.`);
    } catch (error) {
      console.error("Error during order trimming:", error.message);
    }
  };

  // Function to remove orders with non-existent users
  const removeOrphanedOrders = async () => {
    try {
      // Find all distinct customer IDs in orders
      const customerIds = await Order.distinct('customer');

      // Check which users still exist
      const existingUserIds = new Set();
      const existingUsers = await User.find(
        { _id: { $in: customerIds } },
        '_id'
      );

      existingUsers.forEach(user => existingUserIds.add(user._id.toString()));

      // Filter out IDs of non-existent users
      const orphanedUserIds = customerIds.filter(
        id => id && !existingUserIds.has(id.toString())
      );

      // Delete orders with non-existent users
      if (orphanedUserIds.length > 0) {
        const result = await Order.deleteMany({
          customer: { $in: orphanedUserIds }
        });

        console.log(`Removed ${result.deletedCount} orphaned orders.`);
      } else {
        console.log("No orphaned orders found.");
      }
    } catch (error) {
      console.error("Error during orphaned order cleanup:", error.message);
    }
  };


export const startCronJobs = () => {
   try {
      // "0 11 * * *" --> min hour (day of the month) (month (1 - 12)) (day of the week (0 - 7, where both 0 and 7 represent Sunday))
     // Run the cleanup job every day at 11 a.m.
     const cleanupUsersJob = cron.schedule("0 11 * * *", async () => {
        console.log("Running cleanup job for unverified users...");
        await cleanupUnverifiedUsers();
      });

      // New job to trim user orders (run every Monday at 2 a.m.)
      const trimOrdersJob = cron.schedule("0 2 * * 1", async () => {
        console.log("Running job to trim excess user orders...");
        await trimUserOrders();
      });

      // New job to remove orphaned orders (run every Sunday at 3 a.m.)
      const orphanedOrdersJob = cron.schedule("0 3 * * 0", async () => {
        console.log("Running job to remove orphaned orders...");
        await removeOrphanedOrders();
      });

      console.log("All cron jobs initialized!");

      // Graceful shutdown - stop all jobs
      process.on("SIGTERM", () => {
        console.log("Shutting down cron jobs...");
        cleanupUsersJob.stop();
        trimOrdersJob.stop();
        orphanedOrdersJob.stop();
   })
   } catch (error) {
      console.error("Error during cleanup job:", error.message)
   }
};
