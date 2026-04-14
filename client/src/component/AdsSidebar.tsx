import React from 'react';
import Post from "../assets/POST.webp"
import AVAILABLE from "../assets/AVAILABLE.webp"
import graphicdesigningad from "../assets/graphicdesigningad.webp"

const AdsSidebar: React.FC = () => {
  const ads = [
    { image: graphicdesigningad, title: "Premium Design", subtitle: "Learn Professional UI/UX" },
    { image: AVAILABLE, title: "Model Assets", subtitle: "Latest 3D Models" },
    { image: Post, title: "Community Pro", subtitle: "Featured Updates" }
  ];

  return (
    <aside className="w-[200px] hidden xl:flex flex-col relative">
      <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-6 sticky top-20 bg-[#181818] z-10 py-2">Sponsored</h3>
      
      <div className="flex flex-col gap-[800px]"> {/* Large gap to align with posts */}
        {ads.map((ad, index) => (
          <div 
            key={index} 
            className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#333] hover:border-blue-500/30 transition-all group cursor-pointer shadow-2xl sticky top-32"
          >
            <div className="p-2.5 border-b border-[#333] bg-[#111] flex flex-col gap-0.5">
               <span className="text-[9px] font-bold text-gray-400 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{ad.title}</span>
               <span className="text-[8px] text-gray-600 font-medium">{ad.subtitle}</span>
            </div>
            <div className="relative overflow-hidden w-full h-auto bg-[#0a0a0a]">
              <img 
                src={ad.image} 
                alt="Ad"
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
              />
            </div>
            <div className="px-3 py-2 flex justify-end">
               <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest group-hover:text-blue-500">Shop Now</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};


export default AdsSidebar;
