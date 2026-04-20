
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const API_URL = '/posts';

export const fetchPosts = createAsyncThunk('post/fetchPosts', async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data.data.posts;
});

export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData: { content: string; images?: string[]; mediaType?: 'image' | 'video' | 'pdf' | 'gif' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, postData);
      return response.data.data.post;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/${postId}`, { content });
      return response.data.data.post;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk('post/fetchUserPosts', async (userId: string) => {
  const response = await axiosInstance.get(`${API_URL}/user/${userId}`);
  return response.data.data.posts;
});

export const fetchLikedPosts = createAsyncThunk('post/fetchLikedPosts', async (userId: string) => {
  const response = await axiosInstance.get(`${API_URL}/liked/${userId}`);
  return response.data.data.posts;
});

export const fetchPostById = createAsyncThunk('post/fetchPostById', async (postId: string) => {
  const response = await axiosInstance.get(`${API_URL}/${postId}`);
  return response.data.data.post;
});

interface PostState {
  posts: any[];
  userPosts: any[];
  likedPosts: any[];
  loading: boolean;
  error: string | null;
  isPostModalOpen: boolean;
}

const initialState: PostState = {
  posts: [],
  userPosts: [],
  likedPosts: [],
  loading: false,
  error: null,
  isPostModalOpen: false,
};

export const likePost = createAsyncThunk('post/likePost', async (postId: string, { getState }) => {
  const response = await axiosInstance.post(`${API_URL}/${postId}/like`, {});
  const state = getState() as { user: { user: { _id?: string } | null } };
  return { postId, likes: response.data.data.likes, currentUserId: state.user.user?._id };
});

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    addPostToFeed: (state, action: PayloadAction<any>) => {
      const exists = state.posts.some(p => p._id === action.payload._id);
      if (!exists) {
        state.posts.unshift(action.payload);
      }
    },
    setPostModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPostModalOpen = action.payload;
    },
    updatePostLikes: (state, action: PayloadAction<{ postId: string, likes: string[] }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) post.likes = action.payload.likes;
      
      const userPost = state.userPosts.find(p => p._id === action.payload.postId);
      if (userPost) userPost.likes = action.payload.likes;

      const likedPost = state.likedPosts.find(p => p._id === action.payload.postId);
      if (likedPost) likedPost.likes = action.payload.likes;
    },
    addNewPost: (state, action: PayloadAction<any>) => {
      const exists = state.posts.some(p => p._id === action.payload._id);
      if (!exists) {
        state.posts.unshift(action.payload);
      }
    },
    incrementCommentCount: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p._id === action.payload);
      if (post) post.commentsCount = (post.commentsCount || 0) + 1;
      
      const userPost = state.userPosts.find(p => p._id === action.payload);
      if (userPost) userPost.commentsCount = (userPost.commentsCount || 0) + 1;
    },
    updatePostInState: (state, action: PayloadAction<any>) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) state.posts[index] = action.payload;
      
      const userIndex = state.userPosts.findIndex(p => p._id === action.payload._id);
      if (userIndex !== -1) state.userPosts[userIndex] = action.payload;

      const likedIndex = state.likedPosts.findIndex(p => p._id === action.payload._id);
      if (likedIndex !== -1) state.likedPosts[likedIndex] = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        const exists = state.posts.some(p => p._id === action.payload._id);
        if (!exists) {
          state.posts.unshift(action.payload);
        }
        state.isPostModalOpen = false;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.posts[index] = action.payload;
        
        const userIndex = state.userPosts.findIndex(p => p._id === action.payload._id);
        if (userIndex !== -1) state.userPosts[userIndex] = action.payload;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      })
      .addCase(fetchLikedPosts.fulfilled, (state, action) => {
        state.likedPosts = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
        const userPost = state.userPosts.find(p => p._id === action.payload.postId);
        if (userPost) {
          userPost.likes = action.payload.likes;
        }
        const likedPost = state.likedPosts.find(p => p._id === action.payload.postId);
        if (likedPost) {
          likedPost.likes = action.payload.likes;
        }

        const stillLikedByCurrentUser = !!action.payload.currentUserId && action.payload.likes.includes(action.payload.currentUserId);
        if (likedPost && !stillLikedByCurrentUser) {
          state.likedPosts = state.likedPosts.filter(p => p._id !== action.payload.postId);
        }
      })
      .addMatcher(
        (action) => action.type === 'comment/addComment/fulfilled',
        (state, action: any) => {
          const { postId, parentComment } = action.payload;
          if (!parentComment) { // Only increment for top-level comments if desired, or all? Let's do all.
            const post = state.posts.find(p => p._id === postId);
            if (post) post.commentsCount = (post.commentsCount || 0) + 1;
            
            const userPost = state.userPosts.find(p => p._id === postId);
            if (userPost) userPost.commentsCount = (userPost.commentsCount || 0) + 1;

            const likedPost = state.likedPosts.find(p => p._id === postId);
            if (likedPost) likedPost.commentsCount = (likedPost.commentsCount || 0) + 1;
          }
        }
      );
  },
});


export const { addPostToFeed, setPostModalOpen, updatePostLikes, addNewPost, incrementCommentCount, updatePostInState } = postSlice.actions;
export default postSlice.reducer;
