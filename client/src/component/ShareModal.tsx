import React, { useState } from 'react';
import { X, Copy, Check, Send, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Brand icons are removed in lucide 1.7.0+, providing custom SVG implementations
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.207 24 24 23.227 24 22.271V1.729C24 .774 23.207 0 22.225 0z"/>
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  postTitle?: string;
  authorName?: string;
  imageUrl?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postUrl, postTitle = '', authorName = 'User', imageUrl }) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const platformName = 'CommunityFirst';
  const displayTitle = postTitle.length > 100 ? postTitle.substring(0, 100) + '...' : postTitle;
  
  const formattedShareText = `🌟 Post by ${authorName} on ${platformName}\n\n"${displayTitle}"\n\nRead more at: ${postUrl}`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <Send className="w-6 h-6" />,
      color: 'bg-[#25D366]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedShareText)}`,
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon className="w-6 h-6" />,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
    // {
    //   name: 'Twitter',
    //   icon: <TwitterIcon className="w-6 h-6" />,
    //   color: 'bg-[#1DA1F2]',
    //   url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(postUrl)}`,
    // },
    {
      name: 'LinkedIn',
      icon: <LinkedinIcon className="w-6 h-6" />,
      color: 'bg-[#0A66C2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    },
    // {
    //   name: 'Email',
    //   icon: <Mail className="w-6 h-6" />,
    //   color: 'bg-[#EA4335]',
    //   url: `mailto:?subject=Post by ${authorName} on ${platformName}&body=${encodeURIComponent(formattedShareText)}`,
    // },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedShareText);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = formattedShareText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    
    setIsSharing(true);
    try {
      const shareData: ShareData = {
        title: `${authorName}'s Post`,
        text: formattedShareText,
        url: postUrl,
      };

      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'post-image.jpg', { type: blob.type });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (fileError) {
          console.warn('Could not process image for sharing:', fileError);
        }
      }

      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-[#1a1a1a] rounded-[2rem] border border-[#333] relative z-10 overflow-hidden shadow-2xl"
          >
            <div className="p-6 pb-2 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white">Share Post</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Spread the Word</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* {imageUrl && ( */}
                {/* <div className="mb-6 rounded-2xl overflow-hidden h-32 w-full border border-[#333] relative group"> */}
                   {/* <img src={imageUrl} alt="Post" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Include Image in Share</span>
                   </div> */}
                {/* </div> */}
              {/* )} */}

              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {'share' in navigator && (
                   <button
                    onClick={handleNativeShare}
                    disabled={isSharing}
                    className="flex flex-col items-center gap-2 group flex-shrink-0"
                   >
                    <div className="bg-white p-4 rounded-2xl text-black group-hover:scale-110 transition-transform shadow-lg shadow-white/10 flex items-center justify-center min-w-[56px] min-h-[56px]">
                      {isSharing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-black border-t-transparent rounded-full" /> : <Send className="w-6 h-6 rotate-[-45deg]" />}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">
                      More
                    </span>
                   </button>
                )}
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group flex-shrink-0"
                  >
                    <div className={`${option.color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-black/20 flex items-center justify-center min-w-[56px] min-h-[56px]`}>
                      {option.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">
                      {option.name}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Share with Link</p>
                <div className="flex items-center gap-2 bg-[#000] p-1.5 rounded-2xl border border-[#333] group focus-within:border-blue-500/50 transition-all">
                  <div className="flex-1 px-3 py-2 text-sm text-gray-400 font-medium truncate">
                    {postUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#222] border-t border-[#333]">
              <p className="text-[10px] text-gray-500 font-extrabold text-center italic uppercase tracking-widest">
                {authorName}'s post is ready to be shared
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
