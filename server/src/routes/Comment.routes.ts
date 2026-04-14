import { Router } from "express";
import { createComment, getPostComments, likeComment } from "../controllers/Comment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/post/:postId", getPostComments);
router.post("/", protect, createComment);
router.post("/:commentId/like", protect, likeComment);

export default router;
