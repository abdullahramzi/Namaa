import React, { useState } from 'react';
import { Language, AIResponse } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateBusinessInsights } from '../services/geminiService';
import Icon from './Icon';

interface Props {
  lang: Language;
}

const AIConsultant: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS;
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    const data = await generateBusinessInsights(idea, lang);
    setResult(data);
    setLoading(false);
  };

  const isRtl = lang === 'ar';

  return (
    <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Icon name="Sparkles" className="text-secondary-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold">{t.consultAI[lang]}</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <label className="block text-sm font-medium text-blue-100 mb-2">
            {t.aiPrompt[lang]}
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={lang === 'ar' ? 'مثل: مقهى في الرياض يقدم القهوة المختصة...' : 'e.g. A specialized coffee shop in Dubai...'}
              className={`flex-grow px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-secondary-500/20"
            >
              {loading ? (
                <>
                  <Icon name="Clock" className="animate-spin" size={18} />
                  {t.aiLoading[lang]}
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={18} />
                  {t.aiButton[lang]}
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-6 rounded-xl shadow-lg border-l-4 border-secondary-500 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">{t.businessName[lang]}</h3>
              <p className="text-2xl font-bold text-primary-900 dark:text-white">{result.businessName}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1">{t.slogan[lang]}</h3>
                 <p className="text-lg text-primary-600 dark:text-primary-400 italic">"{result.slogan}"</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-6 rounded-xl shadow-lg transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-4">{t.strategy[lang]}</h3>
              <ul className="space-y-3">
                {result.strategySteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIConsultant;