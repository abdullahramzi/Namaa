
import React, { useState } from 'react';
import { Language, Currency, Project, CategoryId, ServiceCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import Icon from './Icon';
import ProjectCard from './ProjectCard';

interface Props {
  lang: Language;
  currency: Currency;
  searchQuery: string;
  projects: Project[];
  onViewDetails: (project: Project) => void;
  categories: ServiceCategory[];
}

const ProjectsPage: React.FC<Props> = ({ lang, currency, searchQuery, projects, onViewDetails, categories }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const filteredProjects = projects.filter(item => {
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

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center md:text-start">
         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.latestProjects[lang]}</h2>
         <p className="text-gray-500 dark:text-slate-400 max-w-2xl">{t.projectsDesc[lang]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Filters */}
        <div className="md:col-span-3">
           <div className="sticky top-24 space-y-2">
              <button
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${filter === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                  <Icon name="LayoutDashboard" size={18} />
                  {t.all[lang]}
              </button>
              {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${filter === cat.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                      <Icon name={cat.icon} size={18} />
                      {lang === 'en' ? cat.titleEn : cat.titleAr}
                  </button>
              ))}
           </div>
        </div>

        {/* Grid */}
        <div className="md:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <ProjectCard 
                        key={project.id}
                        project={project}
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

export default ProjectsPage;
