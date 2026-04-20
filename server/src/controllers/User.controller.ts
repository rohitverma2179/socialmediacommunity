import type { Request, Response } from "express";
import User from "../models/User.model.js";
import type { IUser } from "../models/User.model.js";
import Post from "../models/Post.model.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || "30d",
  });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: true,
    sameSite: "none" as const
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });

    await sendEmail({
      email,
      subject: "Your OTP Code",
      message: `Your OTP is: ${otp}`,
    });

    res.status(201).json({
      status: "success",
      message: "OTP sent to email",
      data: { email },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // ✅ Auto login after verify
    createSendToken(user, 200, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1) Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Please provide email and password" });
    }

    // 2) Find user & include password
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" });
    }

    // 3) Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: "fail",
        message: "Please verify your email to log in",
        needsVerification: true,
        data: { email: user.email },
      });
    }

    // 4) Send token
    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token as any,
      verificationTokenExpires: { $gt: new Date() } as any,
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "Token is invalid or has expired" });
    }

    user.isVerified = true;
    (user as any).verificationToken = undefined;
    (user as any).verificationTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Email verified successfully!" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { credential, accessToken } = req.body;

    let email, name, googleId;

    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID as string,
      });
      const payload = (ticket as any).getPayload();
      if (!payload)
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid Google token" });
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else if (accessToken) {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
      );
      email = data.email;
      name = data.name;
      googleId = data.sub;
    } else {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Google credential or access token is required",
        });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email not provided by Google" });
    }

    let user = await User.findOne({ email });

    if (user) {
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
      });
    }

    createSendToken(user, 200, res);
  } catch (error: any) {
    console.error("Google Login Error:", error.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message:
        error.response?.data?.error_description ||
        error.message ||
        "Google Login failed",
    });
  }
};

export const facebookLogin = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res
        .status(400)
        .json({ status: "fail", message: "Facebook access token is required" });
    }

    const { data } = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
    );

    if (!data || !data.email) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Invalid Facebook token or email missing",
        });
    }

    const { email, name, id: facebookId } = data;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        facebookId,
        isVerified: true,
      });
    }

    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getMe = async (req: any, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedPosts",
      populate: { path: "user", select: "name email" },
    });
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

export const toggleSavedPost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ status: "fail", message: "Post not found" });
    }

    const isAlreadySaved = user.savedPosts.some(
      (savedPostId) => savedPostId.toString() === postId,
    );

    if (isAlreadySaved) {
      user.savedPosts = user.savedPosts.filter(
        (savedPostId) => savedPostId.toString() !== postId,
      );
    } else {
      user.savedPosts.unshift(post._id);
    }

    await user.save();

    const populatedUser = await User.findById(user._id).populate({
      path: "savedPosts",
      populate: { path: "user", select: "name email" },
    });

    res.status(200).json({
      status: "success",
      message: isAlreadySaved ? "Post removed from saved" : "Post saved successfully",
      data: {
        user: populatedUser,
        saved: !isAlreadySaved,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail({
      email,
      subject: "Your New OTP Code",
      message: `Your new OTP is: ${otp}`,
    });

    res.status(200).json({
      status: "success",
      message: "New OTP sent to email",
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
