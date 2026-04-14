import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const API_URL = '/comments';

export const fetchPostComments = createAsyncThunk('comment/fetchPostComments', async (postId: string) => {
  const response = await axiosInstance.get(`${API_URL}/post/${postId}`);
  return response.data.data.comments;
});

export const addComment = createAsyncThunk('comment/addComment', async (commentData: { content: string; postId: string; parentCommentId?: string }) => {
  const response = await axiosInstance.post(API_URL, commentData);
  return response.data.data.comment;
});

interface CommentState {
  comments: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

export const likeComment = createAsyncThunk('comment/likeComment', async (commentId: string) => {
  const response = await axiosInstance.post(`${API_URL}/${commentId}/like`, {});
  return { commentId, likes: response.data.data.likes };
});

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    addNewCommentLocally: (state, action: PayloadAction<{ comment: any; postId: string }>) => {
      const newComment = { ...action.payload.comment, repliesData: [] };
      if (newComment.parentComment) {
        const addReply = (comments: any[]) => {
          for (let comment of comments) {
            if (comment._id === newComment.parentComment) {
              if (!comment.repliesData) comment.repliesData = [];
              const exists = comment.repliesData.some((r: any) => r._id === newComment._id);
              if (!exists) comment.repliesData.push(newComment);
              return true;
            }
            if (comment.repliesData && addReply(comment.repliesData)) return true;
          }
          return false;
        };
        addReply(state.comments);
      } else {
        const exists = state.comments.some(c => c._id === newComment._id);
        if (!exists) state.comments.push(newComment);
      }
    },
    updateCommentLikes: (state, action: PayloadAction<{ commentId: string, likes: string[] }>) => {
      const findAndUpdate = (comments: any[]) => {
        for (let comment of comments) {
          if (comment._id === action.payload.commentId) {
            comment.likes = action.payload.likes;
            return true;
          }
          if (comment.repliesData && findAndUpdate(comment.repliesData)) return true;
        }
        return false;
      };
      findAndUpdate(state.comments);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostComments.pending, (state) => { state.loading = true; })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.loading = false;
        const allComments = action.payload;
        const commentMap: { [key: string]: any } = {};
        const rootComments: any[] = [];

        // First pass: create objects with repliesData field
        allComments.forEach((comment: any) => {
          commentMap[comment._id] = { ...comment, repliesData: [] };
        });

        // Second pass: build the tree
        allComments.forEach((comment: any) => {
          const currentComment = commentMap[comment._id];
          if (comment.parentComment && commentMap[comment.parentComment]) {
            commentMap[comment.parentComment].repliesData.push(currentComment);
          } else if (!comment.parentComment) {
            rootComments.push(currentComment);
          }
        });
        
        state.comments = rootComments;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const newComment = { ...action.payload, repliesData: [] };
        if (newComment.parentComment) {
          // Find parent and add to its repliesData if it exists
          const addReply = (comments: any[]) => {
            for (let comment of comments) {
              if (comment._id === newComment.parentComment) {
                if (!comment.repliesData) comment.repliesData = [];
                comment.repliesData.push(newComment);
                return true;
              }
              if (comment.repliesData && addReply(comment.repliesData)) return true;
            }
            return false;
          };
          addReply(state.comments);
        } else {
          state.comments.push(newComment);
        }
      })
      .addCase(likeComment.fulfilled, (state, action) => {
          // Find in main comments or nested replies
          const findAndUpdate = (comments: any[]) => {
              for (let comment of comments) {
                  if (comment._id === action.payload.commentId) {
                      comment.likes = action.payload.likes;
                      return true;
                  }
                  if (comment.repliesData && findAndUpdate(comment.repliesData)) {
                      return true;
                  }
              }
              return false;
          };
          findAndUpdate(state.comments);
      });
  },
});


export const { addNewCommentLocally, updateCommentLikes } = commentSlice.actions;
export default commentSlice.reducer;