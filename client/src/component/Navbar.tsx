import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { User as UserIcon, } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { setPostModalOpen } from '../store/post/post.slice';
import { AnimatePresence, motion } from 'framer-motion';
import { logoutUser } from '../store/user/user.thunk';

import logo from '../assets/eGrowth 4.svg';
import home from '../assets/icons/Home.svg';
import job from '../assets/icons/job.svg';
import shoping from '../assets/icons/Shopping.svg';
import library from '../assets/icons/library.svg';
import search from '../assets/icons/search.svg';
import plus from '../assets/icons/Pluse.svg';

const Navbar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = React.useState(false);

  const isHome = location.pathname === '/';

  const handlePostClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(setPostModalOpen(true));
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // ✅ Navigation items (future ready for pages)
  const navItems = [
    { path: '/', icon: home, alt: 'Home' },
    { path: '/library', icon: library, alt: 'Library' },
    { path: '/shopping', icon: shoping, alt: 'Shopping' },
    { path: '/jobs', icon: job, alt: 'Job' },
  ];

  return (

    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#262626] border-b border-b-[#A0A0A0] shadow-2xl z-[1000] flex items-center">
  <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-4 sm:px-6">
    
    {/* Logo */}
    <div className="flex items-center flex-shrink-0">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </Link>
    </div>

    {/* Center Navigation */}
    <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`h-9 w-10 sm:w-11 flex items-center justify-center rounded-xl border-b-2 transition-all duration-200
              ${
                isActive
                  ? 'text-orange-500 border-orange-500 scale-105'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
          >
            <img src={item.icon} alt={item.alt} className="w-5 h-5" />
          </button>
        );
      })}
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
      
      {/* Search (Responsive Width) */}
      <div className="relative hidden sm:block w-[220px] md:w-[280px] lg:w-[380px] xl:w-[480px]">
        <input
          type="text"
          placeholder="Find anything..."
          className="w-full h-9 bg-[#1e1e1e] border-2 border-[#EC8035] focus:border-[#ff710b] rounded-2xl pl-4 pr-10 outline-none transition-all placeholder:text-[#8BA2AD] text-sm text-white"
        />
        <img
          src={search}
          alt="Search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
        />
      </div>

      {/* Post Button */}
      {isHome && (
        <button
          onClick={handlePostClick}
          className="h-9 px-3 sm:px-4 bg-[#3EAFE3] hover:bg-[#0ea5e9] text-black rounded-full font-bold text-[13px] sm:text-[14px] flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap hidden sm:flex"
        >
          <span>Post</span>
          <img src={plus} alt="Post" className="w-4 h-4" />
        </button>
      )}

      {/* Auth */}
      {!user ? (
        <button
          onClick={() => navigate('/login')}
          className="h-9 px-4 sm:px-6 bg-white hover:bg-gray-200 text-black rounded-full font-bold text-xs sm:text-sm transition-all"
        >
          Login
        </button>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Avatar */}
          <div
            onClick={() => navigate('/profile')}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-[#333] cursor-pointer hover:border-[#EC8035] transition-all overflow-hidden bg-[#222] flex items-center justify-center"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-white font-bold">
                {user?.name?.[0] || <UserIcon size={16} />}
              </div>
            )}
          </div>
 
          {/* Dropdown */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl py-2"
              >
                <div className="px-4 py-2 border-b border-[#333] mb-1">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-[#252525]"
                >
                  <UserIcon size={16} />
                  View Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10"
                >
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  </div>
</nav>

  );
};

export default Navbar;