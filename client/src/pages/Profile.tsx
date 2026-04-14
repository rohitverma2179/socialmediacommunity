import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchUserPosts } from '../store/post/post.slice';
import PostCard from '../component/PostCard';
import Navbar from '../component/Navbar';
import { Share2, PlusCircle, Edit3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { userPosts, loading } = useSelector((state: RootState) => state.post);
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = ['Profile', 'Questions', 'Answers', 'Post', 'Like', 'Saved', 'Shared'];

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserPosts(user._id));
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p className="text-xl font-bold">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20">
        <div className="bg-[#1a1a1b] rounded-2xl overflow-hidden border border-[#2d2d2e] mb-6 shadow-2xl">
           {/* Header Block */}
           <div className="p-6 pb-4 relative">
             <button className="absolute top-6 right-6 p-2 rounded-full border border-[#3d3d3e] text-gray-400 hover:text-white hover:bg-[#2d2d2e] transition-all">
               <Share2 size={18} />
             </button>

             <div className="flex items-start gap-4">
               {/* Avatar */}
               <div className="relative group">
                 <div className="w-20 h-20 rounded-full bg-[#3d3d3e] overflow-hidden flex items-center justify-center text-2xl font-bold border-2 border-[#3d3d3e]">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     user.name?.[0]
                   )}
                 </div>
                 <button className="absolute bottom-0 right-0 p-1 bg-[#1a1a1b] border border-[#3d3d3e] rounded-full text-gray-400 hover:text-white shadow-lg">
                   <PlusCircle size={12} />
                 </button>
               </div>

               {/* Info */}
               <div className="pt-1">
                 <h2 className="text-2xl font-bold text-white mb-0.5">{user.name}</h2>
                 <button className="text-[#8e8e8f] text-xs hover:underline flex items-center gap-1 font-medium italic">
                   Add profile credential
                 </button>
                 <button className="text-[#8e8e8f] text-xs hover:underline mt-4 block font-medium">
                   Write a description about yourself
                 </button>
               </div>
             </div>
           </div>

           {/* Tabs Navigation */}
           <div className="px-2 border-b border-[#2d2d2e] mt-2 bg-[#1a1a1b]/50 sticky top-[64px] z-10 backdrop-blur-md">
             <div className="flex overflow-x-auto no-scrollbar gap-1">
               {tabs.map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-4 text-xs font-bold whitespace-nowrap transition-all relative ${
                     activeTab === tab ? 'text-white' : 'text-[#8e8e8f] hover:text-white'
                   }`}
                 >
                   {tab}
                   {activeTab === tab && (
                     <motion.div
                       layoutId="profileTabMarker"
                       className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e9afe]"
                     />
                   )}
                 </button>
               ))}
             </div>
           </div>

           {/* Tab Content */}
           <div className="p-6 min-h-[400px]">
             {activeTab === 'Post' || activeTab === 'Profile' ? (
               <div className="w-full">
                 {loading ? (
                   <div className="flex justify-center py-10 text-white">
                     <Loader2 className="animate-spin text-blue-500" size={24} />
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {userPosts.map((post) => (
                       <PostCard key={post._id} post={post} />
                     ))}
                     {userPosts.length === 0 && (
                       <div className="text-center py-20 bg-[#161617] rounded-3xl border border-dashed border-[#2d2d2e]">
                         <p className="text-sm italic text-gray-600">You haven't posted anything yet.</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-[#8e8e8f]">
                 <div className="p-6 bg-[#161617] rounded-full mb-4 border border-[#2d2d2e]">
                    <Edit3 size={32} className="opacity-20" />
                 </div>
                 <p className="text-sm font-medium">No {activeTab.toLowerCase()} content to show yet.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
