import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, resendOTP } from '../store/user/user.thunk';
import { clearError, resetSuccess } from '../store/user/user.slice';
import type { AppDispatch, RootState } from '../store/store';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/eGrowth 4.svg';

const VerifyOTP: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const email = location.state?.email || useSelector((state: RootState) => state.user.verificationEmail);
    const { isLoading, error, success, user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (success && user) {
            toast.success("Verification successful!");
            navigate('/');
            dispatch(resetSuccess());
        } else if (success) {
             toast.success("OTP Resent!");
             dispatch(resetSuccess());
        }
    }, [error, success, user, dispatch, navigate]);

    const handleChange = (index: number, value: string) => {
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

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }
        dispatch(verifyOTP({ email, otp: otpString }));
    };

    const handleResend = () => {
        if (timer > 0) return;
        dispatch(resendOTP(email));
        setTimer(60);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden font-outfit text-white">
            <Toaster position="top-center" />
            
            <header className="p-8 relative z-10">
                <img src={logo} alt="Logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 -mt-10">
                <div className="w-full max-w-[440px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#141414] p-10 rounded-[44px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.5)] border border-[#222] relative overflow-hidden"
                    >
                        <div className="flex justify-center mb-8">
                            <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
                                <ShieldCheck className="text-blue-500" size={32} />
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
                            <p className="text-gray-500 text-sm">
                                We've sent a code to <span className="text-gray-300 font-medium">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 bg-[#0d0d0d] border border-[#222] rounded-xl text-center text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Verify Account</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-[#222] pt-6 flex flex-col items-center gap-4">
                            <p className="text-sm text-gray-500">
                                Didn't receive the code?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={timer > 0 || isLoading}
                                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${timer > 0 ? 'text-gray-700' : 'text-blue-500 hover:text-blue-400'}`}
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code Now'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default VerifyOTP;
