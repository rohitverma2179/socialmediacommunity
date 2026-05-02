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
    return (
      <div className={`relative rounded-xl overflow-hidden border border-[#333] bg-black ${heightClassName} w-full flex items-center justify-center`}>
        <video src={images[0]} controls className={`max-w-full ${heightClassName} object-contain bg-black`} />
      </div>
    );
  }

  if (mediaType === 'pdf') {
    const mediaUrl = images[0];

    return (
      <div className="overflow-hidden bg-[#1e1e1e] border border-[#333] rounded-xl">
        <div className="p-3 flex items-center justify-between border-b border-[#333]">
          <span className="text-rose-500 font-bold text-[10px] uppercase tracking-wider">PDF PREVIEW</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadPdf(mediaUrl, buildPdfFileName('post-resource'))}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[10px] font-bold transition-all"
            >
              Download
            </button>
          </div>
        </div>

        <div className={`bg-[#111] ${heightClassName} flex items-center justify-center overflow-hidden`}>
          <img
            src={getPdfPreviewUrl(mediaUrl)}
            alt="PDF Page 1"
            className={`max-w-full ${heightClassName} object-contain`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x800?text=Preview+Not+Found';
            }}
          />
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
