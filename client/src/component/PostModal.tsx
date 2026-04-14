import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Send, Loader2, AlertCircle, FileText, Video as VideoIcon, Film } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { createPost } from '../store/post/post.slice';
import { motion, AnimatePresence } from 'framer-motion';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' | 'pdf' | 'gif' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'pdf' | 'gif'>('image');
  const dispatch = useDispatch<AppDispatch>();

  // Cloudinary Config
  const CLOUDINARY_API_KEY = '517894626762537';
  const CLOUDINARY_API_SECRET = 'rXm8MYjTJu1JDrz87vnBeCFsqAE';
  const CLOUDINARY_CLOUD_NAME = 'diwsdon3e';

  const generateSignature = async (timestamp: number) => {
    const stringToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const msgBuffer = new TextEncoder().encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Adjusted limits: Images/PDFs 2MB, Videos 10MB
    const limit = uploadType === 'video' ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > limit) {
      setError(`File too large (Max ${uploadType === 'video' ? '10MB' : '2MB'})`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await generateSignature(timestamp);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      
      // Determine Cloudinary resource_type
      let resourceType = 'image';
      if (uploadType === 'video') resourceType = 'video';
      if (uploadType === 'pdf') resourceType = 'auto'; // auto handles raw/pdf

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        setMedia({ url: data.secure_url, type: uploadType });
        setError('');
      } else {
        setError(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading. Please check connection.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (type: 'image' | 'video' | 'pdf' | 'gif') => {
    setUploadType(type);
    if (fileInputRef.current) {
      // Set accept string based on type
      let accept = 'image/*';
      if (type === 'video') accept = 'video/*';
      if (type === 'pdf') accept = '.pdf';
      if (type === 'gif') accept = 'image/gif';
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isUploading || isPosting) return;
    setIsPosting(true);
    try {
      await dispatch(createPost({ 
        content, 
        images: media ? [media.url] : [],
        mediaType: media?.type || 'image'
      } as any)).unwrap();
      
      setContent('');
      setMedia(null);
      onClose();
    } catch (err: any) {
      setError('Failed to create post');
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
            className="w-full max-w-lg bg-[#1a1a1a] rounded-3xl border border-[#333] relative z-10 overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-[#333] flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Post</h3>
              <button onClick={onClose} className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent border-none outline-none resize-none text-lg min-h-[120px] placeholder:text-gray-600"
                autoFocus
              />

              {media && (
                <div className="mt-4 relative group rounded-2xl overflow-hidden border border-[#333] bg-[#0a0a0a]">
                  {media.type === 'video' ? (
                    <video src={media.url} controls className="w-full h-48 object-cover" />
                  ) : media.type === 'pdf' ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-3">
                       <FileText size={48} className="text-blue-500" />
                       <span className="text-sm font-bold truncate max-w-full px-4">{media.url.split('/').pop()}</span>
                    </div>
                  ) : (
                    <img src={media.url} alt="Preview" className="w-full h-48 object-cover" />
                  )}
                  <button 
                    type="button"
                    onClick={() => setMedia(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                  >
                    <X size={16} />
                  </button>
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

              <div className="mt-8 flex flex-col gap-6">
                <div className="flex border-t border-[#222] pt-4 items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Add Media</span>
                  <div className="flex gap-1">
                    {[
                      { icon: <ImageIcon size={20} />, label: 'Image', type: 'image' },
                      { icon: <Film size={20} />, label: 'GIF', type: 'gif' },
                      { icon: <VideoIcon size={20} />, label: 'Video', type: 'video' },
                      { icon: <FileText size={20} />, label: 'PDF', type: 'pdf' }
                    ].map((btn) => (
                      <button 
                        key={btn.type}
                        type="button" 
                        onClick={() => triggerUpload(btn.type as any)}
                        disabled={isUploading}
                        title={btn.label}
                        className={`p-3 rounded-xl transition-all ${uploadType === btn.type && media ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'}`}
                      >
                        {isUploading && uploadType === btn.type ? <Loader2 size={20} className="animate-spin" /> : btn.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={!content.trim() || isUploading || isPosting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20"
                >
                  {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  <span>{isPosting ? 'Posting...' : 'Create Post'}</span>
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
