import {User} from '../models/user.model.js'
import {Order} from '../models/order.model.js'
import cron from 'node-cron'

//Function to clean up unverified users
const cleanupUnverifiedUsers = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Delete users where `isEmailVerified` is false and timestamp is older than 24 hours
      const result = await User.deleteMany({
          isEmailVerified: false,
          createdAt: { $lte: twentyFourHoursAgo },
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
      // Get all orders for this user
      const userOrderCount = await Order.countDocuments({ customer: user._id });

      // If user has more than 15 orders, delete the 5 oldest paid orders
      if (userOrderCount > 15) {
        // Find the 5 oldest paid orders for this user
        const oldestPaidOrders = await Order.find({
          customer: user._id,
          payment: 'PAID'
        })
        .sort({ createdAt: 1 })
        .limit(5);

        // If we found any paid orders to delete
        if (oldestPaidOrders.length > 0) {
          const orderIds = oldestPaidOrders.map(order => order._id);

          // Delete these 5 oldest paid orders
          const result = await Order.deleteMany({ _id: { $in: orderIds } });
          totalOrdersDeleted += result.deletedCount;

          console.log(`Deleted ${result.deletedCount} oldest paid orders for user ${user._id}`);
        } else {
          console.log(`User ${user._id} has more than 15 orders but no paid orders to delete`);
        }
      }
    }

    console.log(`Trimmed orders: ${totalOrdersDeleted} oldest PAID orders removed.`);
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

      // New job to remove orphaned orders (run everyday at 10 a.m.)
      const orphanedOrdersJob = cron.schedule("0 10 * * *", async () => {
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
