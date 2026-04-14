import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import UserRoutes from "./routes/User.routes.js";
import PostRoutes from "./routes/Post.routes.js";
import CommentRoutes from "./routes/Comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./utils/socket.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(server);

// Connect to DB
await connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "https://egrowthindia.in",
      "https://www.egrowthindia.in",
      "http://localhost:5173",
      "https://community-final-vf8t.vercel.app",
      "https://socialmediacommunity.vercel.app",
      "https://testing.swastixa.in",
      "https://www.testing.swastixa.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Home Check
app.get("/", (req, res) => {
  res.send("Server running! 🚀");
});

// Routes
app.use("/api/users", UserRoutes);
app.use("/api/posts", PostRoutes);
app.use("/api/comments", CommentRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
