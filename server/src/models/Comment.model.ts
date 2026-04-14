import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment: mongoose.Types.ObjectId | null;
  content: string;
  likes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for replies to easily fetch children
CommentSchema.virtual("repliesData", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

export default mongoose.model<IComment>("Comment", CommentSchema);
