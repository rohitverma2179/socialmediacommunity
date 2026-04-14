import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { addComment, likeComment } from '../store/comment/comment.slice';
import { useNavigate } from 'react-router-dom';
import { renderFormattedContent } from '../utils/formatContent';

interface CommentItemProps {
  comment: any;
  postId: string;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);

  const isLiked = user && comment.likes?.includes(user._id);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;

    await dispatch(addComment({
      content: replyText,
      postId,
      parentCommentId: comment._id
    }));

    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const handleLikeComment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(likeComment(comment._id));
  };

  return (
    <div className="relative group">
      {/* Visual Threading Line (Vertical) */}
      {depth > 0 && (
        <div className="absolute left-[-22px] top-[-16px] bottom-0 w-[1.5px] bg-[#3f3f3f] group-last:bottom-auto group-last:h-8" />
      )}

      {/* Visual Threading Hook (Horizontal) */}
      {depth > 0 && (
        <div className="absolute left-[-22px] top-4 w-4 h-5 border-l-[1.5px] border-b-[1.5px] border-[#3f3f3f] rounded-bl-xl" />
      )}

      <div className={`flex gap-3 ${depth > 0 ? 'mt-3 pl-3' : 'mt-6'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 relative z-10">
          <div className={`${depth > 0 ? 'w-6 h-6' : 'w-10 h-10'} rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden`}>
            {comment.user?.avatar ? (
              <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              comment.user?.name?.[0] || '?'
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-bold text-gray-100 ${depth > 0 ? 'text-[11px]' : 'text-[13px]'}`}>
              @{comment.user?.name?.toLowerCase().replace(/\s/g, '') || 'user'}
            </span>
            <span className="text-[11px] text-gray-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <p className={`${depth > 0 ? 'text-[13px]' : 'text-[14px]'} text-gray-300 leading-normal mb-1`}>
            {renderFormattedContent(comment.content)}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-5 mt-1">
            <div className="flex items-center gap-1.5 min-w-[24px]">
              <button
                onClick={handleLikeComment}
                className={`p-1 hover:bg-[#2a2a2a] rounded-full transition-colors ${isLiked ? 'text-white' : 'text-gray-400'}`}
              >
                <ThumbsUp size={depth > 0 ? 12 : 14} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <span className="text-[11px] text-gray-500">{comment.likes?.length || 0}</span>
            </div>

            <button className="p-1 hover:bg-[#2a2a2a] rounded-full text-gray-400">
              <ThumbsDown size={depth > 0 ? 12 : 14} />
            </button>

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-[11px] font-bold text-gray-400 hover:bg-[#2a2a2a] px-3 py-1 rounded-full transition-all"
            >
              Reply
            </button>
          </div>

          {/* Reply Input Form */}
          {showReplyInput && (
            <form onSubmit={handleReply} className="mt-3 flex flex-col gap-2 max-w-xl">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add a reply..."
                className="w-full bg-transparent border-b border-[#3f3f3f] py-1 text-sm outline-none focus:border-white transition-all text-gray-200"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowReplyInput(false)} className="text-xs font-bold text-gray-400 px-3 py-1.5 hover:bg-[#2a2a2a] rounded-full">Cancel</button>
                <button type="submit" className="bg-[#3ea6ff] text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#65b8ff] disabled:opacity-50" disabled={!replyText.trim()}>Reply</button>
              </div>
            </form>
          )}

          {/* YouTube Style Nested Replies Toggle */}
          {comment.repliesData && comment.repliesData.length > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="mt-2 text-[#3ea6ff] text-[13px] font-bold hover:bg-[#3ea6ff]/10 px-3 py-1.5 rounded-full flex items-center gap-2"
            >
              <CornerDownRight size={14} />
              {comment.repliesData.length} {comment.repliesData.length === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Actual Nested Replies */}
          {showReplies && (
            <div className={`mt-1 border-stone-800 ${depth === 0 ? 'ml-2 md:ml-6' : 'ml-0'}`}>
              <div className="space-y-0">
                {comment.repliesData.map((reply: any) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    depth={depth + 1}
                  />
                ))}
              </div>
              {depth === 0 && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="mt-2 text-[#3ea6ff] text-[13px] font-bold hover:bg-[#3ea6ff]/10 px-3 py-1.5 rounded-full"
                >
                  Hide replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
