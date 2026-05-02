import React, { useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../component/MainLayout';
import type { AppDispatch, RootState } from '../store/store';
import { fetchPosts } from '../store/post/post.slice';
import { buildPdfFileName, downloadPdf, getPdfPreviewUrl } from '../utils/pdfDownload';

const Resources: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading } = useSelector((state: RootState) => state.post);
  const { user } = useSelector((state: RootState) => state.user);
  const [downloadingPostId, setDownloadingPostId] = React.useState<string | null>(null);

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [dispatch, posts.length]);

  const pdfPosts = posts.filter((post) => post.mediaType === 'pdf' && post.images?.[0]);

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8BA2AD]">Resources</p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
            {pdfPosts.map((post) => {
              const pdfUrl = post.images[0];
              const title = post.content || 'PDF resource';
              const isDownloading = downloadingPostId === post._id;

              const handleDownload = async () => {
                if (!user) {
                  window.alert('Please login first to download PDFs.');
                  navigate('/login');
                  return;
                }

                setDownloadingPostId(post._id);
                await downloadPdf(pdfUrl, buildPdfFileName(title));
                setDownloadingPostId(null);
              };

              return (
                <article
                  key={post._id}
                  className="overflow-hidden rounded-2xl border border-[#333] bg-[#262626] shadow-xl transition-colors hover:border-blue-500/40"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="block w-full bg-[#111] text-left"
                  >
                    <div className="relative w-full max-h-[420px] overflow-hidden bg-[#111]">
                      <img
                        src={getPdfPreviewUrl(pdfUrl)}
                        alt={`${title} first page`}
                        className="h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.src = 'https://placehold.co/600x800?text=PDF+Preview';
                        }}
                      />
                    </div>
                  </button>

                  <div className="border-t border-[#333] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{title}</p>
                        <p className="mt-2 text-[11px] font-medium text-[#8BA2AD]">
                          {post.user?.name || 'Unknown User'}
                        </p>
                      </div>

                      <button
                        type="button"
                        title="Download PDF"
                        aria-label="Download PDF"
                        disabled={isDownloading}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDownload();
                        }}
                      >
                        {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Resources;
