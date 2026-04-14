import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from '../utils/socket';
import { addNewPost, updatePostLikes, incrementCommentCount } from '../store/post/post.slice';
import { addNewCommentLocally, updateCommentLikes } from '../store/comment/comment.slice';
import type { AppDispatch } from '../store/store';

const SocketListener: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Post Events
    socket.on('newPost', (post) => {
      dispatch(addNewPost(post));
    });

    socket.on('postLiked', ({ postId, likes }) => {
      dispatch(updatePostLikes({ postId, likes }));
    });

    // Comment Events
    socket.on('newComment', ({ comment, postId }) => {
      dispatch(addNewCommentLocally({ comment, postId }));
      dispatch(incrementCommentCount(postId));
    });

    socket.on('commentLiked', ({ commentId, likes }) => {
      dispatch(updateCommentLikes({ commentId, likes }));
    });

    return () => {
      socket.off('newPost');
      socket.off('postLiked');
      socket.off('newComment');
      socket.off('commentLiked');
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default SocketListener;
