
import React, { useState } from 'react';
import { Language, BlogPost, BlogCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import BlogCard from './BlogCard';
import Icon from './Icon';

interface Props {
  lang: Language;
  posts: BlogPost[];
  categories: BlogCategory[];
  onViewPost: (post: BlogPost) => void;
}

const BlogPage: React.FC<Props> = ({ lang, posts, categories, onViewPost }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center md:text-start">
         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.blog[lang]}</h2>
         <p className="text-gray-500 dark:text-slate-400 max-w-2xl">{t.blogDesc[lang]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Filters */}
        <div className="md:col-span-3">
           <div className="sticky top-24 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 px-2">{t.categories[lang]}</h3>
              <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${selectedCategory === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                  <Icon name="LayoutDashboard" size={18} />
                  {t.all[lang]}
              </button>
              {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${selectedCategory === cat.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                      {lang === 'en' ? cat.titleEn : cat.titleAr}
                  </button>
              ))}
           </div>
        </div>

        {/* Content Grid */}
        <div className="md:col-span-9">
            {filteredPosts.length === 0 ? (
               <div className="text-center py-20 text-gray-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                   <Icon name="FileText" size={40} className="mx-auto mb-2 opacity-50" />
                   {t.noResults[lang]}
               </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredPosts.map(post => (
                        <BlogCard 
                            key={post.id}
                            post={post}
                            lang={lang}
                            onClick={onViewPost}
                            categoryName={categories.find(c => c.id === post.categoryId)?.[lang === 'en' ? 'titleEn' : 'titleAr']}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
