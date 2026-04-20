import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const signupUser = createAsyncThunk(
  "user/signup",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/signup", userData);
      console.log("Signup response:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "Signup failed" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/login", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/google-login", { accessToken });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Google Login failed");
    }
  }
);

export const facebookLogin = createAsyncThunk(
  "user/facebookLogin",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/facebook-login", { accessToken });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Facebook Login failed");
    }
  }
);

export const getMe = createAsyncThunk(
  "user/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Session expired");
    }
  }
);

export const toggleSavePost = createAsyncThunk(
  "user/toggleSavePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users/saved/${postId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update saved posts");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get("/users/logout");
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "user/verifyOTP",
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/verify-otp", otpData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "OTP verification failed");
    }
  }
);

export const resendOTP = createAsyncThunk(
  "user/resendOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/resend-otp", { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to resend OTP");
    }
  }
);
