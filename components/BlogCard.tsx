
import React from 'react';
import { BlogPost, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Icon from './Icon';

interface Props {
  post: BlogPost;
  lang: Language;
  onClick: (post: BlogPost) => void;
  categoryName?: string;
}

const BlogCard: React.FC<Props> = ({ post, lang, onClick, categoryName }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';

  return (
    <div 
      onClick={() => onClick(post)}
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
    >
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none z-10"></div>

      <div className="h-56 overflow-hidden relative">
        <img 
          src={post.coverImageUrl} 
          alt={lang === 'en' ? post.titleEn : post.titleAr}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {categoryName && (
          <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-white shadow-sm z-20`}>
            {categoryName}
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 mb-3 gap-3">
           <span className="flex items-center gap-1"><Icon name="Calendar" size={14} /> {post.publishDate}</span>
           <span className="flex items-center gap-1"><Icon name="Clock" size={14} /> {post.readTime}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {lang === 'en' ? post.titleEn : post.titleAr}
        </h3>
        
        <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
          {lang === 'en' ? post.excerptEn : post.excerptAr}
        </p>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">{post.authorName.charAt(0)}</span>
              <span>{post.authorName}</span>
           </div>
           <span className="text-primary-600 dark:text-primary-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              {t.readMore[lang]} <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
           </span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
