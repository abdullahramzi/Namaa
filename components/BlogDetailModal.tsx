
import React, { useState, useEffect } from 'react';
import { BlogPost, Language } from '../types';
import Icon from './Icon';

interface Props {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

// Reuse ShareActions logic here
const ShareActions = ({ title, lang }: { title: string, lang: Language }) => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentUrl) return null;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-slate-700">
      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        {lang === 'ar' ? 'مشاركة المقال:' : 'Share Article:'}
      </span>
      
      <button 
        onClick={handleCopy} 
        className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300 relative group"
        title={lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
      >
        <Icon name={copied ? "Check" : "Link"} size={18} />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in-up">
            {lang === 'ar' ? 'تم النسخ!' : 'Copied!'}
          </span>
        )}
      </button>

      <a 
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="Twitter / X"
      >
        <Icon name="Twitter" size={18} />
      </a>

      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="Facebook"
      >
        <Icon name="Facebook" size={18} />
      </a>

      <a 
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="LinkedIn"
      >
        <Icon name="Linkedin" size={18} />
      </a>
    </div>
  );
};

const BlogDetailModal: React.FC<Props> = ({ post, isOpen, onClose, lang }) => {
  if (!isOpen || !post) return null;

  const isRtl = lang === 'ar';
  const fontClass = lang === 'ar' ? 'font-arabic' : 'font-sans';
  const title = lang === 'en' ? post.titleEn : post.titleAr;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${fontClass}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-30 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-white`}
        >
             <Icon name="X" size={20} />
        </button>

        {/* Hero Image */}
        <div className="h-64 md:h-80 w-full relative">
            <img src={post.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-4 text-sm mb-2 opacity-90">
                    <span className="flex items-center gap-1"><Icon name="Calendar" size={14} /> {post.publishDate}</span>
                    <span className="flex items-center gap-1"><Icon name="Clock" size={14} /> {post.readTime}</span>
                    <span className="flex items-center gap-1"><Icon name="Users" size={14} /> {post.authorName}</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight shadow-sm">
                    {title}
                </h1>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                <p className="font-bold text-xl text-gray-900 dark:text-white mb-6 leading-relaxed">
                    {lang === 'en' ? post.excerptEn : post.excerptAr}
                </p>
                <div className="whitespace-pre-line">
                    {lang === 'en' ? post.contentEn : post.contentAr}
                </div>
            </div>

            {/* Share Section */}
            <ShareActions title={title} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default BlogDetailModal;
