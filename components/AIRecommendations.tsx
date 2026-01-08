import React, { useState } from 'react';
import { Language, Currency, Service, Course, RecommendationItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { getRecommendations } from '../services/geminiService';
import ServiceCard from './ServiceCard';
import CourseCard from './CourseCard';
import Icon from './Icon';

interface Props {
  lang: Language;
  currency: Currency;
  services: Service[];
  courses: Course[];
  onViewDetails: (item: Service | Course) => void;
}

const AIRecommendations: React.FC<Props> = ({ 
  lang, 
  currency, 
  services, 
  courses, 
  onViewDetails 
}) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  const [userGoal, setUserGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [searched, setSearched] = useState(false);

  const handleRecommend = async () => {
    if (!userGoal.trim()) return;
    setLoading(true);
    setSearched(true);
    setRecommendations([]);
    
    const results = await getRecommendations(userGoal, services, courses, lang);
    if (results) {
      setRecommendations(results);
    }
    setLoading(false);
  };

  const getItem = (rec: RecommendationItem) => {
    if (rec.type === 'service') {
      return services.find(s => s.id === rec.itemId);
    } else {
      return courses.find(c => c.id === rec.itemId);
    }
  };

  return (
    <section className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" className="text-amber-400" size={24} />
                <h2 className="text-2xl font-bold">{t.recommendations[lang]}</h2>
             </div>
             <p className="text-gray-300 max-w-xl">
               {t.recommendationsDesc[lang]}
             </p>
          </div>
          
          <div className="flex w-full md:max-w-md gap-2">
             <input
               type="text"
               value={userGoal}
               onChange={(e) => setUserGoal(e.target.value)}
               placeholder={t.recommendationPlaceholder[lang]}
               className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
               onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
             />
             <button
               onClick={handleRecommend}
               disabled={loading || !userGoal.trim()}
               className="bg-primary-600 hover:bg-primary-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
             >
                {loading ? <Icon name="Clock" className="animate-spin" /> : <Icon name="Search" />}
             </button>
          </div>
        </div>

        {/* Results Area */}
        {searched && (
          <div className="animate-fade-in">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {t.recommendedForYou[lang]}
                <div className="h-px bg-white/20 flex-grow ml-4"></div>
             </h3>
             
             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-80 bg-white/5 rounded-xl animate-pulse"></div>
                   ))}
                </div>
             ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {recommendations.map((rec, idx) => {
                      const item = getItem(rec);
                      if (!item) return null;
                      
                      return (
                         <div key={idx} className="relative group">
                            {/* Recommendation Reason Tooltip/Badge */}
                            <div className="absolute -top-3 inset-x-4 z-20 bg-amber-100 text-amber-800 text-xs p-2 rounded-lg shadow-lg border border-amber-200 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                               <span className="font-bold block mb-0.5">{t.whyRecommended[lang]}</span>
                               {rec.reason}
                            </div>
                            
                            <div className="transform transition-transform duration-300 group-hover:scale-[1.02]">
                              {rec.type === 'service' ? (
                                <ServiceCard 
                                  service={item as Service} 
                                  lang={lang} 
                                  currency={currency} 
                                  onClick={onViewDetails}
                                />
                              ) : (
                                <CourseCard 
                                  course={item as Course} 
                                  lang={lang} 
                                  currency={currency} 
                                  onClick={onViewDetails}
                                />
                              )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             ) : (
                <div className="text-center py-10 text-gray-400">
                   {t.noResults[lang]}
                </div>
             )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRecommendations;