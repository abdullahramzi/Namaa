
import React from 'react';
import { Service, Language, Currency } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';

interface Props {
  service: Service;
  lang: Language;
  currency: Currency;
  onClick?: (service: Service) => void;
}

const ServiceCard: React.FC<Props> = ({ service, lang, currency, onClick }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  // Get current date in YYYY-MM-DD format (Local time)
  const now = new Date();
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const isDiscountActive = 
    service.discountPrice &&
    (!service.discountStartDate || todayStr >= service.discountStartDate) &&
    (!service.discountEndDate || todayStr <= service.discountEndDate);

  const displayPrice = currency === 'SAR' 
    ? (service.price * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
    : service.price.toLocaleString();

  const displayDiscountPrice = isDiscountActive && service.discountPrice
    ? (currency === 'SAR' 
        ? (service.discountPrice * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })
        : service.discountPrice.toLocaleString())
    : null;
    
  const currencySymbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];
  const purchaseCountFormatted = service.purchaseCount > 1000 
    ? (service.purchaseCount / 1000).toFixed(1) + 'k' 
    : service.purchaseCount;

  // Only show reviews if they have approved status, but for card summary we use length
  // In real app, we should filter by status approved for length check too
  const approvedReviews = service.reviews.filter(r => r.status === 'approved');

  return (
    <div 
      onClick={() => onClick && onClick(service)}
      className="group flex flex-col h-full relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 cursor-pointer overflow-hidden"
    >
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none z-0"></div>

      {/* Top Section: Price Box & Badges */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        {/* Price Box */}
        <div className="bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 flex flex-col justify-center min-w-[90px]">
           {displayDiscountPrice ? (
               <>
                 <span className="text-xs text-gray-400 line-through decoration-red-500 dir-ltr text-center font-medium">
                    {currency === 'USD' ? currencySymbol : ''} {displayPrice} {currency === 'SAR' ? currencySymbol : ''}
                 </span>
                 <span className="text-lg font-bold text-green-600 dark:text-green-400 dir-ltr text-center">
                    {currency === 'USD' ? currencySymbol : ''} {displayDiscountPrice} {currency === 'SAR' ? currencySymbol : ''}
                 </span>
               </>
           ) : (
               <span className="text-xl font-bold text-gray-900 dark:text-white dir-ltr text-center">
                   {currency === 'USD' ? currencySymbol : ''} {displayPrice} {currency === 'SAR' ? currencySymbol : ''}
               </span>
           )}
        </div>

        {/* Badges Stack */}
        <div className="flex flex-col gap-2 items-end">
             {service.isPopular && (
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                   <Icon name="Flame" size={12} className="fill-amber-500 text-amber-500" />
                   {t.popular[lang]}
                </span>
             )}
             {isDiscountActive && (
                <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-md border border-red-200 dark:border-red-800">
                   {t.off[lang]}
                </span>
             )}
              {approvedReviews.length === 0 && !service.isPopular && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    {t.new[lang]}
                </span>
              )}
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center flex flex-col items-center mb-6 px-2 relative z-10">
         <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary-100 dark:border-slate-600">
            <Icon name={service.icon} size={32} />
         </div>
         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {lang === 'en' ? service.titleEn : service.titleAr}
         </h3>
         <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {lang === 'en' ? service.descriptionEn : service.descriptionAr}
         </p>
      </div>

      {/* Structured Info / "Features" look */}
      <div className="mt-auto space-y-2 mb-6 relative z-10">
         {/* Trust Signal 1 */}
         <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <Icon name="CheckCircle" size={14} className="text-primary-500" />
                <span>{t.completed[lang]}</span>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{purchaseCountFormatted}</span>
         </div>
         {/* Trust Signal 2 - Hide rating if 0 */}
         <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <Icon name={approvedReviews.length > 0 ? "Star" : "Tag"} size={14} className={approvedReviews.length > 0 ? "text-amber-400 fill-amber-400" : "text-blue-500"} />
                <span>{approvedReviews.length > 0 ? t.rating[lang] : (lang === 'ar' ? 'الحالة' : 'Status')}</span>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
                {approvedReviews.length > 0 ? service.rating.toFixed(1) : (lang === 'ar' ? 'جديد' : 'New')}
            </span>
         </div>
      </div>

      {/* Action Button */}
      <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 flex items-center justify-center gap-2 relative z-10">
          {t.bookNow[lang]}
      </button>

    </div>
  );
};

export default ServiceCard;
