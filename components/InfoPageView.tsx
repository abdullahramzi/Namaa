
import React from 'react';
import { InfoPage, Language } from '../types';

interface Props {
  page: InfoPage;
  lang: Language;
}

const InfoPageView: React.FC<Props> = ({ page, lang }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-6 animate-fade-in bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[50vh]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
        {lang === 'en' ? page.titleEn : page.titleAr}
      </h1>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
        {lang === 'en' ? page.contentEn : page.contentAr}
      </div>
    </div>
  );
};

export default InfoPageView;
