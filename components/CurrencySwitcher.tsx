
import React from 'react';
import { Currency, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  currency: Currency;
  onToggle: () => void;
  lang: Language;
  enabledSAR?: boolean;
  enabledUSD?: boolean;
}

const CurrencySwitcher: React.FC<Props> = ({ currency, onToggle, lang, enabledSAR = true, enabledUSD = true }) => {
  
  // If only one currency is available, do not render the button
  if (!enabledSAR || !enabledUSD) {
      return null;
  }

  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
      title={lang === 'en' ? 'Switch Currency' : 'تغيير العملة'}
    >
       <span>{currency === 'SAR' ? TRANSLATIONS.sar[lang] : TRANSLATIONS.usd[lang]}</span>
    </button>
  );
};

export default CurrencySwitcher;
