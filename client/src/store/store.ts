import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/user.slice';
import postReducer from './post/post.slice';
import commentReducer from './comment/comment.slice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    post: postReducer,
    comment: commentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
