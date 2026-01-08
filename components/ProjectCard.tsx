
import React from 'react';
import { Project, Language, Currency } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';
import StarRating from './StarRating';

interface Props {
  project: Project;
  lang: Language;
  currency: Currency;
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<Props> = ({ project, lang, currency, onClick }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const currencySymbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];
  
  const price = currency === 'SAR' ? project.price * EXCHANGE_RATE : project.price;
  const discount = project.discountPrice ? (currency === 'SAR' ? project.discountPrice * EXCHANGE_RATE : project.discountPrice) : null;
  const approvedReviewsCount = project.reviews.filter(r => r.status === 'approved').length;
  const purchaseCountFormatted = project.purchaseCount > 1000 
      ? (project.purchaseCount / 1000).toFixed(1) + 'k' 
      : project.purchaseCount;

  return (
    <div 
        onClick={() => onClick && onClick(project)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer group flex flex-col h-full relative"
    >
        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none z-10"></div>

        {/* Thumbnail */}
        <div className="h-48 bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
            {project.thumbnailUrl ? (
                <img src={project.thumbnailUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <Icon name="Code" size={40} />
                </div>
            )}
            {project.techStack && project.techStack.length > 0 && (
                <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} flex gap-2 z-20`}>
                    <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Icon name="Code" size={12} />
                        {project.techStack[0]}
                    </div>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow relative z-10">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{lang === 'en' ? project.titleEn : project.titleAr}</h3>
            
            {/* Ratings Display (Conditional) */}
            <div className="flex items-center gap-2 mb-2">
                {approvedReviewsCount > 0 ? (
                    <>
                        <StarRating rating={project.rating} size={14} />
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">({approvedReviewsCount})</span>
                    </>
                ) : (
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        {t.new[lang]}
                    </span>
                )}
            </div>

            {/* Purchase Count */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mb-3">
                <Icon name="Users" size={14} className="text-gray-400" />
                <span>{purchaseCountFormatted} {t.purchases[lang]}</span>
            </div>

            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">{lang === 'en' ? project.descriptionEn : project.descriptionAr}</p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex flex-col items-start">
                    {discount ? (
                        <>
                            <span className="text-xs text-gray-400 line-through dir-ltr">{currencySymbol} {price.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                            <span className="font-bold text-green-600 dark:text-green-400 dir-ltr">{currencySymbol} {discount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </>
                    ) : (
                        <span className="font-bold text-gray-900 dark:text-white dir-ltr">{currencySymbol} {price.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    )}
                </div>
                <button className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                    <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default ProjectCard;
