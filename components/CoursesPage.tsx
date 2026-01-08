
import React, { useState } from 'react';
import { Language, Currency, Course, CategoryId, ServiceCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import CourseCard from './CourseCard';
import Icon from './Icon';

interface Props {
  lang: Language;
  currency: Currency;
  searchQuery: string;
  courses: Course[];
  onViewDetails: (course: Course) => void;
  categories: ServiceCategory[];
}

// Helper to adjust color brightness for gradients (Copied from ServicesPage for consistency)
const adjustBrightness = (col: string, amt: number) => {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
};

// Helper to convert hex to rgba for shadows
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CoursesPage: React.FC<Props> = ({ lang, currency, searchQuery, courses, onViewDetails, categories }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const filteredCourses = courses.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      item.titleEn.toLowerCase().includes(q) ||
      item.titleAr.includes(q) ||
      item.descriptionEn.toLowerCase().includes(q) ||
      item.descriptionAr.includes(q)
    );
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const selectedCategory = filter === 'all' 
    ? null 
    : categories.find(c => c.id === filter);

  // Helper to get button style
  const getButtonStyle = (isActive: boolean, color: string) => {
    if (isActive) {
      return {
        background: `linear-gradient(to right, ${color}, ${adjustBrightness(color, -20)})`,
        color: 'white',
        boxShadow: `0 10px 15px -3px ${hexToRgba(color, 0.3)}`,
        borderColor: 'transparent',
        transform: 'scale(1.02)'
      };
    }
    return {};
  };

  const getIconContainerStyle = (isActive: boolean, color: string) => {
    if (isActive) {
      return { backgroundColor: 'rgba(255,255,255,0.2)' };
    }
    return {};
  };
  
  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-fade-in min-h-screen">
      
      {/* Header Area */}
      <div className="mb-10 text-center md:text-start">
         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.courses[lang]}</h2>
         <p className="text-gray-500 dark:text-slate-400 max-w-2xl">{t.coursesDesc[lang]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="md:col-span-3 lg:col-span-3">
          <div className="sticky top-24 space-y-3">
             <h3 className="hidden md:block font-bold text-gray-900 dark:text-white mb-4 text-lg px-1">
                {t.all[lang]}
             </h3>

             {/* Wrapper for mobile scroll / desktop vertical stack */}
             <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar snap-x px-1">
                
                {/* 'All' Button */}
                <button
                  onClick={() => setFilter('all')}
                  className={`group flex-shrink-0 relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 snap-start w-auto md:w-full ${filter === 'all' ? '' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-600 dark:text-slate-400'}`}
                  style={getButtonStyle(filter === 'all', '#64748b')}
                >
                  <div 
                    className={`p-1.5 rounded-lg transition-colors ${filter === 'all' ? '' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-gray-200 dark:group-hover:bg-slate-600'}`}
                    style={getIconContainerStyle(filter === 'all', '#64748b')}
                  >
                     <Icon name="LayoutDashboard" size={18} />
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap">{t.all[lang]}</span>
                  {filter === 'all' && (
                    <span className={`absolute ${isRtl ? 'left-4' : 'right-4'} w-2 h-2 bg-white rounded-full animate-pulse`}></span>
                  )}
                </button>

                {/* Categories */}
                {sortedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`group flex-shrink-0 relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 snap-start w-auto md:w-full ${filter === cat.id ? '' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-600 dark:text-slate-400'}`}
                    style={getButtonStyle(filter === cat.id, cat.color)}
                  >
                    <div 
                      className={`p-1.5 rounded-lg transition-colors ${filter === cat.id ? '' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600'}`}
                      style={getIconContainerStyle(filter === cat.id, cat.color)}
                    >
                      <Icon name={cat.icon} size={18} />
                    </div>
                    <span 
                      className={`font-bold text-sm whitespace-nowrap ${isRtl ? 'text-right' : 'text-left'} flex-1`}
                      style={!(filter === cat.id) ? { color: '' } : {}}
                    >
                       {lang === 'en' ? cat.titleEn : cat.titleAr}
                    </span>
                    {filter === cat.id && (
                       <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={14} className="opacity-80" />
                    )}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 lg:col-span-9">
          
          {/* Active Category Banner */}
          {selectedCategory && (
            <div 
              className="relative overflow-hidden rounded-2xl p-8 mb-8 text-white shadow-xl animate-fade-in"
              style={{ background: `linear-gradient(to right, ${selectedCategory.color}, ${adjustBrightness(selectedCategory.color, -30)})` }}
            >
              <div className="relative z-10 flex items-center gap-6">
                 <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
                    <Icon name={selectedCategory.icon} size={40} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold mb-2">
                       {lang === 'en' ? selectedCategory.titleEn : selectedCategory.titleAr}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-2xl">
                       {lang === 'en' ? selectedCategory.descriptionEn : selectedCategory.descriptionAr}
                    </p>
                 </div>
              </div>
              {/* Decor Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            </div>
          )}

          {/* No Results */}
          {filteredCourses.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-full mb-4">
                   <Icon name="Search" size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.noResults[lang]}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                   {lang === 'en' ? 'Try selecting a different category or adjust your search.' : 'حاول اختيار قسم آخر أو تعديل بحثك.'}
                </p>
                <button 
                   onClick={() => setFilter('all')}
                   className="mt-6 px-6 py-2 bg-primary-100 dark:bg-slate-700 text-primary-700 dark:text-white rounded-full font-bold text-sm hover:bg-primary-200 transition-colors"
                >
                   {t.all[lang]}
                </button>
             </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                lang={lang} 
                currency={currency} 
                onClick={onViewDetails}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
