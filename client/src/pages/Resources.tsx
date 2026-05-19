import React, { useEffect } from 'react';
import {  FileText, Loader2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import MainLayout from '../component/MainLayout';
import type { AppDispatch, RootState } from '../store/store';
import { fetchPosts } from '../store/post/post.slice';
// import { buildPdfFileName, downloadPdf, getPdfPreviewUrl } from '../utils/pdfDownload';
import PostMediaGallery from '../component/PostMediaGallery';

const Resources: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();
  const { posts, loading } = useSelector((state: RootState) => state.post);
  // const { user } = useSelector((state: RootState) => state.user);
  // const [downloadingPostId, setDownloadingPostId] = React.useState<string | null>(null);
  const [selectedPdfPost, setSelectedPdfPost] = React.useState<any>(null);
  
  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [dispatch, posts.length]);
  
  const pdfPosts = posts.filter((post) => post.mediaType === 'pdf' && post.images?.[0]);
  
  console.log(pdfPosts);
  
  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]  text-[#8BA2AD]">Resources</p>
            <h1 className="mt-1 text-2xl font-black text-white">PDF Library</h1>
          </div>
          <div className="rounded-full border border-[#333] bg-[#262626] px-3 py-1 text-[11px] font-bold text-[#8BA2AD]">
            {pdfPosts.length} PDFs
          </div>
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-500" size={30} />
          </div>
        ) : pdfPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#333] bg-[#202020] px-6 py-16 text-center">
            <FileText className="mx-auto mb-4 text-[#8BA2AD]" size={38} />
            <p className="text-sm font-bold text-white">No PDFs uploaded yet.</p>
            <p className="mt-2 text-xs text-[#8BA2AD]">PDF posts will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pdfPosts.map(( post) => {
              const pdfUrl = post.images[0];
              const extractedName = pdfUrl?.split('/').pop()?.split('?')[0];
              const fileName = extractedName ? decodeURIComponent(extractedName) : 'Document.pdf';
              console.log(fileName)
              return (
                <div
                  key={post._id}
                  onClick={() => setSelectedPdfPost(post)}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-[#333] bg-[#1a1a1a] p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-red-500/50 hover:bg-[#202020] cursor-pointer text-center"
                >
                  {/* Custom PDF Icon mimicking the user's image */}
                  <div className="relative w-[72px] h-[96px] bg-white border-[3px] border-red-600 rounded-lg flex flex-col items-center justify-between py-2 shadow-sm">
                    {/* Folded corner illusion */}
                    <div className="absolute -top-[3px] -right-[3px] w-0 h-0 border-t-[22px] border-t-[#1a1a1a] border-l-[22px] border-l-transparent group-hover:border-t-[#202020] transition-colors z-10" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-b-[3px] border-l-[3px] border-red-600 bg-gray-100 rounded-bl-md z-20" />
                    
                    {/* Red graphic inside */}
                    <div className="flex-1 flex items-center justify-center w-full mt-2 pl-1">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 3s-3 6 0 10c3 4-3 6-3 6" />
                        <path d="M14 9c0 0-4-3-6 0s0 6 0 6" />
                      </svg>
                    </div>
                    {/* PDF text */}
                    <div className="w-full font-black text-gray-900 text-[15px] tracking-widest leading-none mt-1">PDF</div>
                  </div>

                  <div className="mt-5 w-full">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-red-400 transition-colors" title={fileName}>{fileName}</p>
                    <p className="mt-1.5 text-[11px] font-medium text-[#8BA2AD]">
                      {post.user?.name || 'Unknown User'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Modal Viewer */}
      {selectedPdfPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6">
          <div className="relative w-full max-w-4xl bg-[#111] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#333] p-4 bg-[#1a1a1a]">
              <div className="pr-4">
                <h3 className="text-white font-bold text-lg line-clamp-1" title={selectedPdfPost.images?.[0]?.split('/').pop()?.split('?')[0] ? decodeURIComponent(selectedPdfPost.images[0].split('/').pop().split('?')[0]) : 'Document.pdf'}>
                  {selectedPdfPost.images?.[0]?.split('/').pop()?.split('?')[0] ? decodeURIComponent(selectedPdfPost.images[0].split('/').pop().split('?')[0]) : 'Document.pdf'}
                </h3>
                <p className="text-xs text-[#8BA2AD] mt-1">By {selectedPdfPost.user?.name || 'Unknown User'}</p>
              </div>
              <button
                onClick={() => setSelectedPdfPost(null)}
                className="p-2 bg-[#333] text-gray-300 hover:text-white rounded-full hover:bg-red-500 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body - Uses existing smooth scroller */}
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/50">
              <PostMediaGallery
                images={selectedPdfPost.images}
                mediaType="pdf"
                heightClassName="h-[65vh] md:h-[50vh]"
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Resources;
