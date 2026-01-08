
import React from 'react';
import { Course, Language, Currency } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';
import StarRating from './StarRating';

interface Props {
  course: Course;
  lang: Language;
  currency: Currency;
  onClick?: (course: Course) => void;
}

const CourseCard: React.FC<Props> = ({ course, lang, currency, onClick }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  // Date and Discount Logic
  const now = new Date();
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const isDiscountActive = 
    course.discountPrice &&
    (!course.discountStartDate || todayStr >= course.discountStartDate) &&
    (!course.discountEndDate || todayStr <= course.discountEndDate);

  let daysRemaining: number | null = null;
  if (isDiscountActive && course.discountEndDate) {
      const start = new Date(todayStr);
      const end = new Date(course.discountEndDate);
      const diffTime = end.getTime() - start.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  // Price Calculation
  const displayPrice = currency === 'SAR' 
    ? (course.price * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
    : course.price.toLocaleString();
    
  const displayDiscountPrice = isDiscountActive && course.discountPrice
    ? (currency === 'SAR' 
        ? (course.discountPrice * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })
        : course.discountPrice.toLocaleString())
    : null;

  const currencySymbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];
  const purchaseCountFormatted = course.purchaseCount > 1000 
    ? (course.purchaseCount / 1000).toFixed(1) + 'k' 
    : course.purchaseCount;

  return (
    <div 
      onClick={() => onClick && onClick(course)}
      className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col h-full overflow-hidden group cursor-pointer"
    >
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none z-10"></div>
      
      {/* Popular Badge */}
      {course.isPopular && (
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-20 bg-amber-100/90 backdrop-blur-sm text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200`}>
          <Icon name="Flame" size={14} className="fill-amber-500 text-amber-500" />
          {t.popular[lang]}
        </div>
      )}

      {/* Discount Badge */}
      {isDiscountActive && (
         <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} z-20 bg-red-100/90 backdrop-blur-sm text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-red-200`}>
           %
         </div>
      )}

      {/* Thumbnail Area */}
      <div className={`h-48 w-full ${!course.thumbnailUrl ? course.thumbnailColor : ''} relative flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-slate-700`}>
        {course.thumbnailUrl ? (
           <img 
             src={course.thumbnailUrl} 
             alt={lang === 'en' ? course.titleEn : course.titleAr}
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
           />
        ) : (
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
        )}
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30 group-hover:scale-110 transition-transform duration-300">
               <Icon name="PlayCircle" className="text-white drop-shadow-lg" size={40} />
            </div>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1 font-medium z-20">
          <Icon name="Clock" size={12} />
          {course.duration}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="mb-2">
           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
            {lang === 'en' ? course.titleEn : course.titleAr}
          </h3>
          <div className="flex items-center gap-2">
            {course.reviews.length > 0 ? (
               <>
                  <StarRating rating={course.rating} size={14} />
                  <span className="text-xs text-gray-500 font-medium">({course.reviews.length})</span>
               </>
            ) : (
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                   {t.new[lang]}
                </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 flex-grow leading-relaxed line-clamp-3">
          {lang === 'en' ? course.descriptionEn : course.descriptionAr}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-6">
          <div className="flex gap-4">
             <div className="flex items-center gap-1">
                <Icon name="Video" size={14} className="text-primary-500" />
                <span>{course.lessons.length} {t.lessons[lang]}</span>
            </div>
            <div className="flex items-center gap-1">
                <Icon name="FileText" size={14} className="text-secondary-500" />
                <span>{t.includesAttachments[lang]}</span>
            </div>
          </div>
        </div>
        
        {/* Purchase Count */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-4 pt-4 border-t border-gray-50 dark:border-slate-700/50">
           <Icon name="Users" size={14} />
           <span className="font-medium text-gray-500 dark:text-slate-400">{purchaseCountFormatted}</span>
           <span>{t.purchases[lang]}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
           <div className="flex flex-col items-start">
             {displayDiscountPrice ? (
               <>
                 <span className="text-xs text-gray-400 line-through dir-ltr">
                   {currency === 'USD' ? currencySymbol : ''} {displayPrice} {currency === 'SAR' ? currencySymbol : ''}
                 </span>
                 <div className="flex items-center gap-2 flex-wrap">
                   <span className="text-lg font-bold text-green-600 dark:text-green-400 dir-ltr">
                     {currency === 'USD' ? currencySymbol : ''} {displayDiscountPrice} {currency === 'SAR' ? currencySymbol : ''}
                   </span>
                   {daysRemaining !== null && (
                     <span className="text-xs text-red-500 font-bold whitespace-nowrap">
                       ({daysRemaining} {t.daysLeft[lang]})
                     </span>
                   )}
                 </div>
               </>
             ) : (
               <span className="text-lg font-bold text-primary-700 dark:text-primary-400 dir-ltr">
                 {currency === 'USD' ? currencySymbol : ''} {displayPrice} {currency === 'SAR' ? currencySymbol : ''}
               </span>
             )}
           </div>
          <button className="px-4 py-2 bg-secondary-600 group-hover:bg-secondary-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
            {t.buyCourse[lang]}
            <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
