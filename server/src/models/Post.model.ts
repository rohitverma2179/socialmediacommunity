import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  mediaType: 'image' | 'video' | 'pdf' | 'gif';
  likes: mongoose.Types.ObjectId[];
  commentsCount: number;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  scheduledAt?: Date;
  createdAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    images: {
      type: [{ type: String }],
      validate: {
        validator: (images: string[]) => images.length <= 4,
        message: "A post can contain at most 4 images",
      },
    },
    mediaType: { type: String, enum: ['image', 'video', 'pdf', 'gif'], default: 'image' },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'published', 'failed', 'draft'], default: 'published' },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", PostSchema);
