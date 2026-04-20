import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Share2, MoreHorizontal, ThumbsUp, ThumbsDown, Pencil, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, updatePost, updatePostInState } from '../store/post/post.slice';
import type { RootState, AppDispatch } from '../store/store';
import ShareModal from './ShareModal';
import socket from '../utils/socket';
import { renderFormattedContent } from '../utils/formatContent';
import PostMediaGallery from './PostMediaGallery';
// import CommentModal from './CommentModal';

interface PostCardProps {
  post: any;
  isDetailed?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isDetailed = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user && (post.user?._id === user._id || post.user === user._id);
  const isLiked = user && post.likes?.includes(user._id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    socket.on('postUpdated', (updatedPost: any) => {
      if (updatedPost._id === post._id) {
        dispatch(updatePostInState(updatedPost));
      }
    });
    return () => {
      socket.off('postUpdated');
    };
  }, [post._id, dispatch]);

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    await dispatch(updatePost({ postId: post._id, content: editContent }));
    setIsEditing(false);
    setShowDropdown(false);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(likePost(post._id));
  };

  const renderMedia = () => {
    if (!post.images || post.images.length === 0) return null;
    const mediaType = post.mediaType || 'image';
    const galleryMode = isDetailed && post.images.length > 1 ? 'carousel' : 'grid';
    const galleryHeight = isDetailed ? 'max-h-[560px]' : 'max-h-[420px]';

    return (
      <PostMediaGallery
        images={post.images}
        mediaType={mediaType}
        mode={galleryMode}
        heightClassName={galleryHeight}
        onMediaClick={() => navigate(`/post/${post._id}`)}
      />
    );
  };

  const truncatedContent = (!isDetailed && post.content?.length > 160 && !isExpanded) 
    ? post.content.substring(0, 160) + '...' 
    : post.content;


  return (
    <div className={`bg-[#262626] rounded-2xl overflow-hidden hover:border-[#444] transition-all group shadow-sm border border-[#333] mx-auto w-full ${isDetailed ? 'max-w-full' : 'max-w-[550px]'}`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3d3d3e] border border-[#333] flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
            {post.user?.avatar ? <img src={post.user.avatar} alt="" className="w-full h-full object-cover" /> : post.user?.name?.[0] || 'U'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-100 hover:underline cursor-pointer" onClick={() => navigate('/profile')}>
              {post.user?.name || 'Unknown User'}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <Share2 size={10} />
              <span>Public</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="text-gray-500 hover:text-white p-2 hover:bg-[#2a2a2a] rounded-full transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[#262626] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#333] transition-colors"
                >
                  <Pencil size={14} />
                  <span>Edit Post</span>
                </button>
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete logic here if needed
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-[#333] transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button> */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-0 pb-4">
        <div className="px-4 mb-3">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[#1a1a1b] border border-[#333] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:bg-[#333] transition-all"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all"
                >
                  <Check size={14} />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-gray-200 whitespace-pre-wrap">
              {renderFormattedContent(truncatedContent)}
              {!isDetailed && post.content?.length > 160 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-500 font-bold ml-1 hover:underline text-xs"
                >
                  {isExpanded ? 'Show less' : '...see more'}
                </button>
              )}
            </p>
          )}
        </div>
        {renderMedia()}
      </div>

      {/* Footer / Actions */}
      <div className="px-4 py-2 flex items-center gap-2 border-t border-[#222]">
        <div className="flex items-center bg-[#252526] rounded-full">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold ${isLiked ? 'text-blue-500' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
          >
            <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likes?.length || 0}</span>
          </button>
          <div className="w-[1px] h-4 bg-[#333]" />
          <button className="px-3 py-2 text-gray-400 hover:text-white transition-all">
            <ThumbsDown size={16} />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/post/${post._id}`);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-[#252526] transition-all text-sm font-bold"
        >
          <MessageSquare size={16} />
          <span>{post.commentsCount || 0}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-[#252526] transition-all text-sm font-bold"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        postUrl={`${window.location.origin}/post/${post._id}`}
        postTitle={post.content}
        authorName={post.user?.name}
        imageUrl={post.images?.[0]}
      />
    </div>
  );
};

export default PostCard;
