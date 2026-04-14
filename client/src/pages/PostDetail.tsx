import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchPostComments,
  //   addComment,
  addNewCommentLocally,
} from "../store/comment/comment.slice";
import { fetchPostById } from "../store/post/post.slice";
import socket from "../utils/socket";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import PostCard from "../component/PostCard";
import CommentItem from "../component/CommentItem";
import MainLayout from "../component/MainLayout";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading: commentsLoading } = useSelector(
    (state: RootState) => state.comment,
  );
  const { posts, loading: postLoading } = useSelector(
    (state: RootState) => state.post,
  );
  //   const { user } = useSelector((state: RootState) => state.user);
  //   const [newCommentText, setNewCommentText] = useState("");

  const post = posts.find((p) => p._id === postId);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostComments(postId));
      if (!post) {
        dispatch(fetchPostById(postId));
      }
    }

    socket.on("newComment", (data) => {
      if (data.postId === postId) {
        dispatch(addNewCommentLocally(data));
      }
    });

    return () => {
      socket.off("newComment");
    };
  }, [postId, dispatch, post]);

  // const handleSubmitComment = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (!user) {
  //         alert("Please login to comment");
  //         return;
  //     }
  //     if (!newCommentText.trim() || !postId) return;

  //     await dispatch(addComment({ content: newCommentText, postId }));
  //     setNewCommentText('');
  // };

  const buildCommentTree = (flatComments: any[]) => {
    const commentMap = new Map();
    const tree: any[] = [];

    flatComments.forEach((comment) => {
      commentMap.set(comment._id, { ...comment, repliesData: [] });
    });

    flatComments.forEach((comment) => {
      const current = commentMap.get(comment._id);
      if (comment.parentComment) {
        const parent = commentMap.get(
          typeof comment.parentComment === "string"
            ? comment.parentComment
            : comment.parentComment._id,
        );
        if (parent) {
          parent.repliesData.push(current);
        } else {
          tree.push(current);
        }
      } else {
        tree.push(current);
      }
    });

    return tree;
  };

  const commentTree = buildCommentTree(comments);

  return (
    <MainLayout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>

      {postLoading && !post ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        post && <PostCard post={post} isDetailed={true} />
      )}

      <div className="mt-8 bg-[#1a1a1a] rounded-2xl border border-[#333] p-6 mb-10 text-justify">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-justify text-white">
          <MessageSquare size={24} className="text-blue-500" />
          {/* Comments */}
        </h3>

        {/* New Comment Input */}
        {/* <form onSubmit={handleSubmitComment} className="flex gap-4 mb-10">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold">
                        {user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-[#2a2a2a] border border-[#333] rounded-2xl py-3 px-6 pr-12 outline-none focus:border-blue-500 transition-all font-medium text-white"
                        />
                        <button
                            type="submit"
                            disabled={!newCommentText.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form> */}

        {commentsLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-0">
            {commentTree.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={postId!}
              />
            ))}
            {commentTree.length === 0 && (
              <div className="text-center py-10 text-gray-500 italic">
                No comments yet. Be the first to start the conversation!
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PostDetail;
