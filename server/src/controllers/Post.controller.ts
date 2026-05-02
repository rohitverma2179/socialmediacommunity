import type { Request, Response } from "express";
import Post from "../models/Post.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getIO } from "../utils/socket.js";

export const createPost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { content, images, mediaType } = req.body;
    const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];

    if (!content) {
      return res.status(400).json({ status: "fail", message: "Post content is required" });
    }

    if (normalizedImages.length > 4) {
      return res.status(400).json({ status: "fail", message: "You can upload up to 4 images per post" });
    }

    if ((mediaType === "video" || mediaType === "pdf") && normalizedImages.length > 1) {
      return res.status(400).json({ status: "fail", message: `Only one ${mediaType} can be uploaded per post` });
    }

    const newPost = await Post.create({
      user: req.user._id,
      content,
      images: normalizedImages,
      mediaType: mediaType || 'image'
    });

    const populatedPost = await newPost.populate("user", "name email");

    // Emit real-time update
    const io = getIO();
    io.emit("newPost", populatedPost);

    res.status(201).json({
      status: "success",
      data: { post: populatedPost },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("user", "name email");

    if (!post) {
      return res.status(404).json({ status: "fail", message: "Post not found" });
    }

    res.status(200).json({
      status: "success",
      data: { post },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};




export const getPosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: { posts },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};




export const getUserPosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId } as any)
      .populate("user", "name email")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: { posts },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getLikedPosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ likes: userId } as any)
      .populate("user", "name email")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: { posts },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
export const likePost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: "fail", message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like
      post.likes.push(userId);
    } else {
      // Unlike
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    // Emit real-time update
    const io = getIO();
    io.emit("postLiked", { postId, likes: post.likes });

    res.status(200).json({
      status: "success",
      data: { likes: post.likes },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ status: "fail", message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ status: "fail", message: "You can only edit your own posts" });
    }

    post.content = content || post.content;
    await post.save();

    const populatedPost = await post.populate("user", "name email");

    // Emit real-time update
    const io = getIO();
    io.emit("postUpdated", populatedPost);

    res.status(200).json({
      status: "success",
      data: { post: populatedPost },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
