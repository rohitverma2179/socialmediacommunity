import { Router } from "express";
import { createPost, getPosts, getUserPosts, getLikedPosts, likePost, getPostById, updatePost, downloadPdf } from "../controllers/Post.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getPosts);
router.get("/download-pdf", protect, downloadPdf);
router.get("/user/:userId", getUserPosts);
router.get("/liked/:userId", getLikedPosts);
router.get("/:postId", getPostById);
router.post("/", protect, createPost);
router.patch("/:postId", protect, updatePost);
router.post("/:postId/like", protect, likePost);

export default router;
