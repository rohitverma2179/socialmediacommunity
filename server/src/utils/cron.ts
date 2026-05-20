import cron from "node-cron";
import Post from "../models/Post.model.js";
import { getIO } from "./socket.js";

export const initCronJobs = () => {
  console.log("[Cron] Initializing cron jobs...");
  
  // Check every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Find posts where scheduledAt is less than or equal to now and status is 'scheduled'
      const postsToPublish = await Post.find({
        status: "scheduled",
        scheduledAt: { $lte: now },
      });

      if (postsToPublish.length > 0) {
        const postIds = postsToPublish.map((p) => p._id);
        
        await Post.updateMany(
          { _id: { $in: postIds } },
          { $set: { status: "published" } }
        );

        // Fetch them again with populated users to emit to clients
        const publishedPosts = await Post.find({ _id: { $in: postIds } }).populate("user", "name email");

        const io = getIO();
        for (const post of publishedPosts) {
          io.emit("newPost", post);
        }
        
        console.log(`[Cron] Published ${postsToPublish.length} scheduled posts.`);
      }
    } catch (error) {
      console.error("[Cron] Error processing scheduled posts:", error);
    }
  });
};
