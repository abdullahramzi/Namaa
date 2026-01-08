
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Language, Currency } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';

interface Props {
  lang: Language;
  currency: Currency;
  onCheckout: () => void;
}

const CartDrawer: React.FC<Props> = ({ lang, currency, onCheckout }) => {
  const { items, removeFromCart, isOpen, setIsOpen, totalAmount } = useCart();
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const currencySymbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];

  const formatPrice = (amount: number) => {
    const val = currency === 'SAR' ? amount * EXCHANGE_RATE : amount;
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Drawer Panel */}
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ${isRtl ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="ShoppingBag" className="text-primary-600" />
            {t.cart[lang]} <span className="text-sm font-normal text-gray-500">({items.length})</span>
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500 dark:text-slate-400">
               <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Icon name="ShoppingBag" size={40} className="opacity-30" />
               </div>
               <div>
                 <p className="font-bold text-lg text-gray-900 dark:text-white">{t.emptyCart[lang]}</p>
                 <p className="text-sm">{t.emptyCartDesc[lang]}</p>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="px-6 py-2 bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 rounded-lg font-bold text-sm hover:bg-primary-100 dark:hover:bg-slate-700 transition-colors"
               >
                 {t.continueShopping[lang]}
               </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 animate-fade-in">
                 {/* Thumbnail */}
                 <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.titleEn} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name={item.icon || 'Briefcase'} className="text-gray-400" size={24} />
                    )}
                 </div>
                 
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
                            {lang === 'en' ? item.titleEn : item.titleAr}
                          </h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                       </div>
                       <span className="text-xs text-gray-500 dark:text-slate-400 capitalize mt-1 block">
                          {item.type}
                       </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       <span className="font-bold text-primary-600 dark:text-primary-400 dir-ltr">
                          {currency === 'USD' ? currencySymbol : ''} {formatPrice(item.price)} {currency === 'SAR' ? currencySymbol : ''}
                       </span>
                       {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through dir-ltr">
                             {formatPrice(item.originalPrice)}
                          </span>
                       )}
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
             <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span>{t.total[lang]}</span>
                <span className="dir-ltr text-xl">
                   {currency === 'USD' ? currencySymbol : ''} {formatPrice(totalAmount)} {currency === 'SAR' ? currencySymbol : ''}
                </span>
             </div>
             <button 
               onClick={onCheckout}
               className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 group"
             >
                {t.checkout[lang]}
                <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
