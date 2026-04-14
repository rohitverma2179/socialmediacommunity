import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchPosts, addPostToFeed, fetchPostById } from '../store/post/post.slice';
import socket from '../utils/socket';
import PostCard from '../component/PostCard';
import MainLayout from '../component/MainLayout';
import CommentModal from '../component/CommentModal';
import { useParams, useNavigate } from 'react-router-dom';

const Community: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Get postId from URL
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.post);
  const [selectedPostForModal, setSelectedPostForModal] = React.useState<any>(null);

  useEffect(() => {
    dispatch(fetchPosts());

    socket.on('newPost', (post) => {
      dispatch(addPostToFeed(post));
    });

    return () => {
      socket.off('newPost');
    };
  }, [dispatch]);

  // Handle opening modal from URL
  useEffect(() => {
    if (postId) {
      const existingPost = posts.find(p => p._id === postId);
      if (existingPost) {
        setSelectedPostForModal(existingPost);
      } else {
        // Fetch specific post if it's not in the initial feed
        dispatch(fetchPostById(postId)).then((action: any) => {
          if (action.payload) {
             setSelectedPostForModal(action.payload);
          }
        });
      }
    } else {
      setSelectedPostForModal(null);
    }
  }, [postId, posts, dispatch]);

  const handleCloseModal = () => {
    setSelectedPostForModal(null);
    if (postId) {
      navigate('/'); // Remove the ID from URL when closing
    }
  };

  return (
    <MainLayout>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {selectedPostForModal && (
        <CommentModal 
          isOpen={true} 
          onClose={handleCloseModal} 
          post={selectedPostForModal} 
        />
      )}
    </MainLayout>
  );
};

export default Community;
