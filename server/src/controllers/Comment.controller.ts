import type { Request, Response } from "express";
import Comment from "../models/Comment.model.js";
import Post from "../models/Post.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getIO } from "../utils/socket.js";

export const createComment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { content, postId, parentCommentId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ status: "fail", message: "Content and postId are required" });
    }

    const newComment = await Comment.create({
      user: req.user._id,
      post: postId,
      parentComment: parentCommentId || null,
      content,
    });

    // Increment post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await newComment.populate("user", "name email");

    // Emit real-time update
    const io = getIO();
    io.emit("newComment", { comment: populatedComment, postId });

    res.status(201).json({
      status: "success",
      data: { comment: populatedComment },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getPostComments = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    
    // Fetch all comments for this post
    const comments = await Comment.find({ post: postId } as any)
      .populate("user", "name email")
      .sort("-createdAt");


    res.status(200).json({
      status: "success",
      results: comments.length,
      data: { comments },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
export const likeComment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ status: "fail", message: "Comment not found" });
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    
    // Emit real-time update
    const io = getIO();
    io.emit("commentLiked", { commentId, likes: comment.likes });

    res.status(200).json({
      status: "success",
      data: { likes: comment.likes },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
