import React, { useState, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  Video as VideoIcon,
  Film,
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { createPost } from "../store/post/post.slice";
import { motion, AnimatePresence } from "framer-motion";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostMediaItem = {
  url: string;
  type: "image" | "video" | "pdf" | "gif";
};


const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PostMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<
    "image" | "video" | "pdf" | "gif"
  >("image");
  const dispatch = useDispatch<AppDispatch>();
  //

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = pastedText.match(urlRegex);

    if (urls && urls.length > 0) {
      const newMediaItems: PostMediaItem[] = [];

      urls.forEach((url) => {
        const lowerUrl = url.toLowerCase();
        const withoutQuery = lowerUrl.split("?")[0];
        let type: "image" | "video" | "pdf" | "gif" | null = null;

        if (withoutQuery.endsWith(".pdf")) type = "pdf";
        else if (withoutQuery.match(/\.(mp4|webm|ogg|mov)$/)) type = "video";
        else if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
          const ytMatch = url.match(
            /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
          );
          if (ytMatch && ytMatch[1]) {
            type = "image";
            url = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
          }
        } else if (url.includes("instagram.com/")) {
          const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/?#&]+)/);
          if (match && match[1]) {
            type = "video";
            url = `https://www.instagram.com/p/${match[1]}/embed`;
          }
        } else if (url.includes("linkedin.com/")) {
          const match = url.match(/([0-9]{19})/);
          if (match && match[1]) {
            type = "video";
            url = `https://www.linkedin.com/embed/feed/update/urn:li:share:${match[1]}`;
          }
        } else if (url.includes("/video/upload/")) type = "video";
        else if (withoutQuery.endsWith(".gif")) type = "gif";
        else if (withoutQuery.match(/\.(jpeg|jpg|png|webp|avif|bmp|svg)$/))
          type = "image";
        else if (lowerUrl.match(/\.(jpeg|jpg|png|webp|avif)\?/)) type = "image";
        else if (
          url.includes("img.freepik.com") ||
          url.includes("unsplash.com")
        )
          type = "image";

        if (type && !media.some((m) => m.url === url)) {
          newMediaItems.push({ url, type });
        }
      });

      if (newMediaItems.length > 0) {
        setMedia((prev) => {
          const isMultiImage =
            newMediaItems[0].type === "image" ||
            newMediaItems[0].type === "gif";
          if (!isMultiImage && prev.length > 0) return prev; // Avoid mixing different types if limits apply
          const limit = isMultiImage ? 4 : 1;
          return [...prev, ...newMediaItems].slice(0, limit);
        });
        setUploadType(newMediaItems[0].type);
      }
    }
  };

  // Cloudinary Config
  const CLOUDINARY_API_KEY = "517894626762537";
  const CLOUDINARY_API_SECRET = "rXm8MYjTJu1JDrz87vnBeCFsqAE";
  const CLOUDINARY_CLOUD_NAME = "diwsdon3e";

  const generateSignature = async (timestamp: number, publicId?: string) => {
    const stringToSign = publicId
      ? `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
      : `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const msgBuffer = new TextEncoder().encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const removeMediaAtIndex = (indexToRemove: number) => {
    setMedia((currentMedia) =>
      currentMedia.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const isMultiImageUpload = uploadType === "image" || uploadType === "gif";
    const existingCount = isMultiImageUpload ? media.length : 0;
    const maxAllowed = isMultiImageUpload ? 4 : 1;

    if (!isMultiImageUpload && selectedFiles.length > 1) {
      setError("Only one video or PDF can be uploaded at a time");
      setTimeout(() => setError(""), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (existingCount + selectedFiles.length > maxAllowed) {
      setError(
        `You can upload up to ${maxAllowed} ${uploadType === "image" ? "images" : uploadType === "gif" ? "GIFs" : "files"} per post`,
      );
      setTimeout(() => setError(""), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const limit = uploadType === "video" ? 60 * 1024 * 1024 : 8 * 1024 * 1024;
    const oversizedFile = selectedFiles.find((file) => file.size > limit);
    if (oversizedFile) {
      const typeDisplay =
        uploadType === "video"
          ? "Video"
          : uploadType === "pdf"
            ? "Document"
            : "Image";
      const sizeDisplay = uploadType === "video" ? "60MB" : "8MB";
      setError(`${typeDisplay} file too large (Maximum ${sizeDisplay})`);
      setTimeout(() => setError(""), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Determine Cloudinary resource_type
      let resourceType = "image";
      if (uploadType === "video") resourceType = "video";
      if (uploadType === "pdf") resourceType = "auto"; // auto handles raw/pdf

      const uploadedMedia: PostMediaItem[] = [];

      for (const file of selectedFiles) {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const dotIndex = file.name.lastIndexOf(".");
        const originalName =
          dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
        const safeName =
          originalName
            .replace(/[&=?#]/g, "_")
            .trim()
            .substring(0, 150) || "file";
        const randomStr = Math.random().toString(36).substring(2, 8);
        const publicId = `posts/${randomStr}/${safeName}`;

        const signature = await generateSignature(timestamp, publicId);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", CLOUDINARY_API_KEY);
        formData.append("timestamp", timestamp.toString());
        formData.append("public_id", publicId);
        formData.append("signature", signature);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await response.json();
        if (!data.secure_url) {
          throw new Error(data.error?.message || "Upload failed");
        }

        uploadedMedia.push({ url: data.secure_url, type: uploadType });
      }

      setMedia((currentMedia) =>
        isMultiImageUpload
          ? [...currentMedia, ...uploadedMedia]
          : uploadedMedia,
      );
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error uploading. Please check connection.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (type: "image" | "video" | "pdf" | "gif") => {
    setUploadType(type);

    if ((type === "video" || type === "pdf") && media.length > 0) {
      setMedia([]);
    }

    if (fileInputRef.current) {
      // Set accept string based on type
      let accept = "image/*";
      if (type === "video") accept = "video/*";
      if (type === "pdf") accept = ".pdf";
      if (type === "gif") accept = "image/gif";
      fileInputRef.current.accept = accept;
      fileInputRef.current.multiple = type === "image" || type === "gif";
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isUploading || isPosting) return;
    setIsPosting(true);
    try {
      await dispatch(
        createPost({
          content,
          images: media.map((item) => item.url),
          mediaType: media[0]?.type || "image",
        } as any),
      ).unwrap();

      setContent("");
      setMedia([]);
      onClose();
    } catch (err: any) {
      setError("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg max-h-[90vh] bg-[#1a1a1a] rounded-3xl border border-[#333] relative z-10 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#333] flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Post</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 min-h-0 flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent border-none outline-none resize-none text-lg min-h-[120px] placeholder:text-gray-600"
                  autoFocus
                />

                {media.length > 0 && (
                  <div
                    className={`mt-4 grid gap-3 ${media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                  >
                    {media.map((item, index) => (
                      <div
                        key={`${item.url}-${index}`}
                        className="relative group rounded-2xl overflow-hidden border border-[#333] bg-[#0a0a0a] min-h-[10rem]"
                      >
                        {item.type === "video" ? (
                          item.url.includes("youtube.com/") ||
                          item.url.includes("youtu.be/") ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/)?.[1]}`}
                              className="w-full h-40 object-cover"
                              allowFullScreen
                            />
                          ) : item.url.includes("instagram.com/") ? (
                            <iframe
                              src={item.url}
                              className="w-full min-h-[400px] bg-white rounded-xl"
                              frameBorder="0"
                              scrolling="no"
                              allowTransparency={true}
                            />
                          ) : item.url.includes("linkedin.com/") ? (
                            <iframe
                              src={item.url}
                              className="w-full min-h-[400px] bg-white rounded-xl"
                              frameBorder="0"
                              allowFullScreen
                              title="Embedded post"
                            />
                          ) : (
                            <video
                              src={item.url}
                              controls
                              className="w-full h-40 object-cover"
                            />
                          )
                        ) : item.type === "pdf" ? (
                          <div className="p-8 h-40 flex flex-col items-center justify-center gap-3">
                            <FileText size={48} className="text-blue-500" />
                            <span className="text-sm font-bold truncate max-w-full px-4">
                              {decodeURIComponent(
                                item.url.split("/").pop()?.split("?")[0] || "",
                              )}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaAtIndex(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="border-t border-[#222] bg-[#1a1a1a] p-6 pt-4">
                <div className="flex border-t border-[#222] pt-4 items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Add Media
                  </span>

                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="text-xs font-bold text-gray-500 uppercase tracking-widest"
                  />

                  <div className="flex gap-1">
                    {[
                      {
                        icon: <ImageIcon size={20} />,
                        label: "Image",
                        type: "image",
                      },
                      { icon: <Film size={20} />, label: "GIF", type: "gif" },
                      {
                        icon: <VideoIcon size={20} />,
                        label: "Video",
                        type: "video",
                      },
                      {
                        icon: <FileText size={20} />,
                        label: "PDF",
                        type: "pdf",
                      },
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        type="button"
                        onClick={() => triggerUpload(btn.type as any)}
                        disabled={isUploading}
                        title={btn.label}
                        className={`p-3 rounded-xl transition-all ${uploadType === btn.type && media.length > 0 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"}`}
                      >
                        {isUploading && uploadType === btn.type ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          btn.icon
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {(uploadType === "image" || uploadType === "gif") && (
                  <p className="text-xs text-gray-500">
                    You can upload up to 4{" "}
                    {uploadType === "gif" ? "GIFs" : "images"} in one post.
                  </p>
                )}

                <button
                  disabled={!content.trim() || isUploading || isPosting}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20"
                >
                  {isPosting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  <span>{isPosting ? "Posting..." : "Create Post"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostModal;