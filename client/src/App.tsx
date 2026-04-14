import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './store/user/user.thunk';
import type { RootState, AppDispatch } from './store/store';
import Community from './pages/Community';
// import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import AuthPage from './component/Login';
import VerifyOTP from './pages/VerifyOTP';
import SocketListener from './component/SocketListener';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-black"></div>
      </div>
    );
  }


  return (
    <Router>
      <SocketListener />
      <Routes>
        <Route path="/" element={<Community />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/post/:postId" element={<Community />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;