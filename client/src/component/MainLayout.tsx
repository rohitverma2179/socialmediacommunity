import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AdsSidebar from './AdsSidebar';
import PostModal from './PostModal';
import { useDispatch, useSelector } from 'react-redux';
import { setPostModalOpen } from '../store/post/post.slice';
import type { RootState, AppDispatch } from '../store/store';

interface MainLayoutProps {
  children: React.ReactNode;  
}


// update
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isPostModalOpen } = useSelector((state: RootState) => state.post);

  return (
    <div className="min-h-screen bg-[#181818] text-white flex justify-center">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-20 flex gap-6">    
        {/* Left Sidebar - Navigation */}
        <Sidebar />

        {/* Center - Dynamic Content */}
        <div className="flex-1 min-w-0 max-w-[37rem] mx-auto lg:mx-0">
          {children}
        </div>

        {/* Right Sidebar - Ads */}
        <AdsSidebar />
      </main>

      <PostModal isOpen={isPostModalOpen} onClose={() => dispatch(setPostModalOpen(false))} />
    </div>
  );
};

export default MainLayout;
