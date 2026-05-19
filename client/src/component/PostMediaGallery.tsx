import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildPdfFileName, downloadPdf, getPdfPreviewUrl } from '../utils/pdfDownload';

interface PostMediaGalleryProps {
  images: string[];
  mediaType?: 'image' | 'video' | 'pdf' | 'gif';
  mode?: 'grid' | 'carousel';
  onMediaClick?: () => void;
  heightClassName?: string;
}

const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({
  images,
  mediaType = 'image',
  mode = 'grid',
  onMediaClick,
  heightClassName = 'max-h-[500px]',
}) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [pdfPage, setPdfPage] = React.useState(1);
  const [loadedPdfPages, setLoadedPdfPages] = React.useState<number[]>([1, 2]);
  const [maxPdfPages, setMaxPdfPages] = React.useState(7);

  React.useEffect(() => {
    if (mediaType === 'pdf') {
      const nextPages = [pdfPage];
      if (pdfPage < maxPdfPages) nextPages.push(pdfPage + 1);
      
      let changed = false;
      const newLoaded = [...loadedPdfPages];
      nextPages.forEach(p => {
        if (!newLoaded.includes(p)) {
          newLoaded.push(p);
          changed = true;
        }
      });
      if (changed) setLoadedPdfPages(newLoaded);
    }
  }, [pdfPage, mediaType, loadedPdfPages]);

  if (!images || images.length === 0) return null;

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, images.length - 1));
    const container = scrollerRef.current;
    if (!container) return;

    const nextChild = container.children[clampedIndex] as HTMLElement | undefined;
    nextChild?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActiveIndex(clampedIndex);
  };

  if (mediaType === 'video') {
    const isYoutube = images[0].includes('youtube.com/') || images[0].includes('youtu.be/');
    const ytMatch = isYoutube ? images[0].match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/) : null;
    const ytId = ytMatch ? ytMatch[1] : null;

    const isInstagram = images[0].includes('instagram.com/');
    const isLinkedIn = images[0].includes('linkedin.com/');

    return (
      <div className={`relative rounded-xl overflow-hidden border border-[#333] bg-black ${heightClassName} w-full flex items-center justify-center`}>
        {ytId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}`}
            className={`w-full ${heightClassName}`}
            allowFullScreen
          />
        ) : isInstagram ? (
          <iframe 
            src={images[0]}
            className={`w-full h-full min-h-[400px] bg-white`}
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
          />
        ) : isLinkedIn ? (
          <iframe 
            src={images[0]}
            className={`w-full h-full min-h-[400px] bg-white`}
            frameBorder="0"
            allowFullScreen
            title="Embedded post"
          />
        ) : (
          <video src={images[0]} controls className={`max-w-full ${heightClassName} object-contain bg-black`} />
        )}
      </div>
    );
  }

  if (mediaType === 'pdf') {
    const mediaUrl = images[0];

    const handleDownload = () => {
      const extractedName = mediaUrl.split('/').pop()?.split('?')[0];
      const fileName = extractedName ? decodeURIComponent(extractedName) : buildPdfFileName('post-resource');
      downloadPdf(mediaUrl, fileName);
    };

    return (
      <div className="overflow-hidden bg-[#1e1e1e] border border-[#333] rounded-xl relative group">
        <div className="p-3 flex items-center justify-between border-b border-[#333]">
          <span className="text-rose-500 font-bold text-[10px] uppercase tracking-wider">
            PDF PREVIEW {pdfPage <= maxPdfPages ? `- PAGE ${pdfPage}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[10px] font-bold transition-all">
              Download
            </button>
          </div>
        </div>

        <div className={`bg-[#111] ${heightClassName} grid place-items-center overflow-hidden relative`}>
          {pdfPage <= maxPdfPages ? (
            <>
              {loadedPdfPages.map((page) => (
                <img
                  key={page}
                  src={getPdfPreviewUrl(mediaUrl, page)}
                  alt={`PDF Page ${page}`}
                  className={`col-start-1 row-start-1 max-w-full ${heightClassName} object-contain transition-opacity duration-300 ease-in-out ${
                    page === pdfPage ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  onError={(e) => {
                    setMaxPdfPages((prev) => Math.min(prev, page - 1));
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ))}
              
              <button
                type="button"
                onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
                disabled={pdfPage === 1}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white disabled:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPdfPage(prev => prev + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-bold mb-2">More pages available</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                This PDF contains more pages. Please download the full file to view the complete document.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPdfPage(Math.max(1, maxPdfPages))}
                  className="px-5 py-2.5 bg-[#333] hover:bg-[#444] text-white rounded-full text-sm font-semibold transition-all"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'carousel') {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-[#333] bg-[#000]">
          <div
            ref={scrollerRef}
            onScroll={(event) => {
              const container = event.currentTarget;
              const nextIndex = Math.round(container.scrollLeft / Math.max(container.clientWidth, 1));
              if (nextIndex !== activeIndex) {
                setActiveIndex(nextIndex);
              }
            }}
            className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar ${heightClassName}`}
          >
            {images.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="w-full shrink-0 snap-center flex items-center justify-center bg-[#000]">
                <img
                  src={imageUrl}
                  alt={`Post media ${index + 1}`}
                  className={`w-full ${heightClassName} object-contain cursor-pointer`}
                  onClick={onMediaClick}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {images.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-thumb-${index}`}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${activeIndex === index ? 'border-blue-500' : 'border-[#333]'}`}
              >
                <img src={imageUrl} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`grid gap-2 rounded-xl overflow-hidden ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {images.slice(0, 4).map((imageUrl, index) => (
        <div key={`${imageUrl}-${index}`} className={`overflow-hidden border border-[#333] bg-[#000] ${heightClassName} w-full relative flex items-center justify-center`}>
          <img
            src={imageUrl}
            alt={`Post content ${index + 1}`}
            className={`w-full h-full ${heightClassName} object-cover cursor-pointer`}
            onClick={onMediaClick}
          />
        </div>
      ))}
    </div>
  );
};

export default PostMediaGallery;