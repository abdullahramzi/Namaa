
import React from 'react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onToggle: () => void;
  enabledAr?: boolean;
  enabledEn?: boolean;
}

const LanguageSwitcher: React.FC<Props> = ({ currentLang, onToggle, enabledAr = true, enabledEn = true }) => {
  
  // If only one language is available, do not render the button
  if (!enabledAr || !enabledEn) {
      return null;
  }

  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100 font-semibold hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-sm border border-transparent dark:border-primary-800"
    >
      {currentLang === 'en' ? 'العربية' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;
