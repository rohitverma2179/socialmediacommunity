import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, loginUser, googleLogin, verifyOTP, resendOTP } from '../store/user/user.thunk';
import { clearError, resetSuccess } from '../store/user/user.slice';
import { useGoogleLogin } from '@react-oauth/google';
import type { AppDispatch, RootState } from '../store/store';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/eGrowth 4.svg';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isLoading, error, success, needsVerification, verificationEmail, user } = useSelector((state: RootState) => state.user);

    const toggleAuth = () => {
        setIsLogin(!isLogin);
        dispatch(clearError());
    };

    useEffect(() => {
        if (needsVerification) {
            setIsVerifying(true);
            // We don't dispatch clearError here immediately because we might want to see why it needs verification
            // but we'll handle the UI transition
        }
    }, [needsVerification]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [resendTimer]);

    useEffect(() => {
        if (error) {
            // Only show error if it's not the "needs verification" one, or handle it specially
            if (error.includes("verify your email")) {
                toast.error("Please enter the OTP sent to your email");
            } else {
                toast.error(error);
            }
            dispatch(clearError());
        }
        if (success) {
            if (isVerifying && user) {
                toast.success("Account verified successfully!");
                navigate('/');
            } else if (!isVerifying && !isLogin) {
                toast.success("OTP sent to your email!");
                setIsVerifying(true);
            } else if (!isVerifying && isLogin && user) {
                toast.success("Logged in successfully!");
                navigate('/');
            }
            
            const timer = setTimeout(() => {
                dispatch(resetSuccess());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success, isVerifying, isLogin, user, dispatch, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const validateForm = () => {
        if (!formData.email.includes('@')) return "Invalid email address";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (!isLogin && formData.password !== formData.confirmPassword) return "Passwords do not match";
        if (!isLogin && !formData.name) return "Name is required";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isVerifying) {
            const otpString = otp.join('');
            if (otpString.length !== 6) {
                toast.error("Please enter a 6-digit OTP");
                return;
            }
            const email = verificationEmail || formData.email;
            dispatch(verifyOTP({ email, otp: otpString }));
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        if (isLogin) {
            dispatch(loginUser({ email: formData.email, password: formData.password }));
        } else {
            dispatch(signupUser(formData));
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        const email = verificationEmail || formData.email;
        dispatch(resendOTP(email));
        setResendTimer(60);
        toast.success("New OTP sent!");
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            dispatch(googleLogin(tokenResponse.access_token));
        },
        onError: () => toast.error("Google Login Failed"),
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden font-outfit text-white">
            <Toaster position="top-center" />

            <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
                <img src="/src/assets/Group 6.svg" className="absolute -bottom-20 -left-20 w-1/2" alt="" />
                <img src="/src/assets/Group 6.svg" className="absolute -top-20 -right-20 w-1/2 rotate-180" alt="" />
            </div>

            <header className="p-8 relative z-10">
                <img src={logo} alt="Bexex Logo" className="h-10 " />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 -mt-10">
                <div className="w-full max-w-[440px]">
                    <motion.div
                        layout
                        className="bg-[#141414] p-10 rounded-[44px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.5)] border border-[#222] relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {isVerifying ? (
                                <motion.div
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
                                                <ShieldCheck className="text-blue-500" size={32} />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Verify it's you</h2>
                                        <p className="text-gray-500 text-sm">
                                            Enter the code sent to <span className="text-gray-300 font-medium">{verificationEmail || formData.email}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 bg-[#0d0d0d] border border-[#222] rounded-xl text-center text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Verify Account</span><ArrowRight size={18} /></>}
                                    </button>

                                    <div className="text-center pt-2">
                                        <button
                                            onClick={handleResend}
                                            disabled={resendTimer > 0 || isLoading}
                                            className={`flex items-center justify-center gap-2 text-sm font-semibold mx-auto transition-colors ${resendTimer > 0 ? 'text-gray-700' : 'text-blue-500 hover:text-blue-400'}`}
                                        >
                                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code Now'}
                                        </button>
                                        <button 
                                            onClick={() => { setIsVerifying(false); dispatch(clearError()); }}
                                            className="mt-4 text-xs text-gray-600 hover:text-gray-400 block w-full"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form 
                                    key="auth-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-5" 
                                    onSubmit={handleSubmit}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative group"
                                            >
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={19} />
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-[#0d0d0d] border border-[#222] px-14 py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-700"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={19} />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full bg-[#0d0d0d] border border-[#222] px-14 py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-700"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={19} />
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className="w-full bg-[#0d0d0d] border border-[#222] px-14 py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-700"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative group"
                                            >
                                                <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={19} />
                                                <input
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    className="w-full bg-[#0d0d0d] border border-[#222] px-14 py-4.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-gray-700"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[#222]"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                            <span className="bg-[#141414] px-4 text-gray-600">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => loginWithGoogle()}
                                            className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-[#222] bg-[#0d0d0d] hover:bg-[#1a1a1a] transition-all font-semibold text-gray-300"
                                        >
                                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                                            <span>Google</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toast.error("Facebook login setup required")}
                                            className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-[#222] bg-[#0d0d0d] hover:bg-[#1a1a1a] transition-all font-semibold text-gray-300"
                                        >
                                            <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                                                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.413c0-3.047 1.807-4.747 4.583-4.747 1.33 0 2.731.239 2.731.239v3.022h-1.542c-1.477 0-1.93.923-1.93 1.887v2.266h3.401l-.544 3.437h-2.857V24C19.612 23.094 24 18.1 24 12.073z" />
                                            </svg>
                                            <span>Facebook</span>
                                        </button>
                                    </div>

                                    <div className="mt-8 text-center border-t border-[#222] pt-6">
                                        <button type="button" onClick={toggleAuth} className="text-sm font-medium text-gray-500 hover:text-white transition-colors">
                                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
