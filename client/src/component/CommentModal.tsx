import React, { useEffect, useState, useRef } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchPostComments, addComment } from '../store/comment/comment.slice';
import CommentItem from './CommentItem';
import toast from 'react-hot-toast';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading } = useSelector((state: RootState) => state.comment);
  const { user } = useSelector((state: RootState) => state.user);
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && post?._id) {
      dispatch(fetchPostComments(post._id));
    }
  }, [isOpen, post?._id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;

    try {
      await dispatch(addComment({ content: commentText, postId: post._id })).unwrap();
      setCommentText('');
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    }
  };

  const renderPostPreview = () => {
    if (!post) return null;
    return (
      <div className="mb-6 pb-6 border-b border-[#222]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#3d3d3e] border border-[#333] flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
            {post.user?.avatar ? <img src={post.user.avatar} alt="" className="w-full h-full object-cover" /> : post.user?.name?.[0] || 'U'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-100">{post.user?.name || 'Unknown User'}</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Original Author</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-[#333] bg-black max-h-[200px] w-full flex items-center justify-center">
            {post.mediaType === 'video' ? (
              <video src={post.images[0]} className="max-w-full max-h-[200px] object-contain" />
            ) : (
              <img src={post.images[0]} alt="" className="max-w-full max-h-[200px] object-contain" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-xl bg-[#1c1c1c] rounded-t-[2.5rem] md:rounded-[2.5rem] border-t md:border border-[#333] relative z-10 overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#222] bg-[#1c1c1c] z-20">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
                    <MessageSquare size={18} className="text-blue-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Post Feed</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
              {renderPostPreview()}
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Discussions</span>
                <span className="text-[10px] font-bold text-blue-500/80">{comments.length} Comments</span>
              </div>

              {loading && comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No thoughts yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} postId={post._id} />
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="p-4 md:px-8 md:pb-8 bg-[#1c1c1c] border-t border-[#222]">
              <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#0a0a0a] p-2 pr-4 rounded-[1.5rem] border border-[#333] focus-within:border-blue-500/50 transition-all shadow-inner">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden flex-shrink-0 ml-1">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0] || 'U'}
                </div>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-gray-600 outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || loading}
                  className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors disabled:opacity-30"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;
