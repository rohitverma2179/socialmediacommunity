import { createSlice } from "@reduxjs/toolkit";
import { signupUser, loginUser, googleLogin, facebookLogin, getMe, logoutUser, verifyOTP, resendOTP, toggleSavePost } from "./user.thunk";



interface UserState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  needsVerification: boolean;
  verificationEmail: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  success: false,
  needsVerification: false,
  verificationEmail: null,
};


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Helper to handle loading/success/error
    const handleAuthCases = (thunk: any) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.data?.user || action.payload.user;
          state.success = true;
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.isLoading = false;
          const payload = action.payload as any;
          state.error = payload?.message || action.payload as string;
          state.needsVerification = payload?.needsVerification || false;
          state.verificationEmail = payload?.data?.email || null;
        });


    };

    // Traditional Auth
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.needsVerification = true;
        state.verificationEmail = (action.payload as any)?.data?.email;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        state.error = payload?.message || action.payload as string;
        state.needsVerification = payload?.needsVerification || false;
        state.verificationEmail = payload?.data?.email || null;
      });


    // Login handlers
    handleAuthCases(loginUser);
    handleAuthCases(googleLogin);
    handleAuthCases(facebookLogin);
    handleAuthCases(getMe);
    handleAuthCases(verifyOTP);
    
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || action.payload as string;
      })
      .addCase(toggleSavePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || state.user;
        state.success = true;
      })
      .addCase(toggleSavePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || action.payload as string;
      });



    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.success = false;
      localStorage.removeItem("token");
    });
  },
});

export const { clearError, resetSuccess } = userSlice.actions;
export default userSlice.reducer;
