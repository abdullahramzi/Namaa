
import React, { useState, useEffect } from 'react';
import { Language, Currency, Service, Course, Project, ServiceCategory, SiteSettings, InfoPage, Review, BlogCategory, BlogPost, Order } from './types';
import { TRANSLATIONS, SERVICE_CATEGORIES, COURSE_CATEGORIES, PROJECT_CATEGORIES, SERVICES, COURSES, PROJECTS, DEFAULT_INFO_PAGES, BLOG_CATEGORIES, BLOG_POSTS, MOCK_ORDERS, EXCHANGE_RATE } from './constants';
import AdminDashboard from './components/AdminDashboard';
import ServicesPage from './components/ServicesPage';
import CoursesPage from './components/CoursesPage';
import ProjectsPage from './components/ProjectsPage';
import BlogPage from './components/BlogPage';
import AIConsultant from './components/AIConsultant';
import InfoPageView from './components/InfoPageView';
import ContactPage from './components/ContactPage';
import Icon from './components/Icon';
import LanguageSwitcher from './components/LanguageSwitcher';
import CurrencySwitcher from './components/CurrencySwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import ItemDetailModal from './components/ItemDetailModal';
import BlogDetailModal from './components/BlogDetailModal';
import AIRecommendations from './components/AIRecommendations';
import ServiceCard from './components/ServiceCard';
import CourseCard from './components/CourseCard';
import ProjectCard from './components/ProjectCard';
import { CartProvider, useCart } from './contexts/CartContext';
import CartDrawer from './components/CartDrawer';
import CheckoutModal, { CheckoutData } from './components/CheckoutModal';

// Inner component to use cart hook
const MainLayout: React.FC = () => {
  // --- STATE ---
  const [lang, setLang] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'home' | 'services' | 'courses' | 'projects' | 'blog' | 'contact' | 'admin' | string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { cartCount, setIsOpen: setIsCartOpen, totalAmount, items: cartItems, clearCart } = useCart();

  // Data State
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [courseCategories, setCourseCategories] = useState<ServiceCategory[]>(COURSE_CATEGORIES);
  const [projectCategories, setProjectCategories] = useState<ServiceCategory[]>(PROJECT_CATEGORIES);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>(BLOG_CATEGORIES);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [infoPages, setInfoPages] = useState<InfoPage[]>(DEFAULT_INFO_PAGES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); // Orders State Lifted Here

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    appNameEn: 'Namaa',
    appNameAr: 'نماء',
    descriptionEn: 'Your partner in business growth and digital transformation.',
    descriptionAr: 'شريكك في نمو الأعمال والتحول الرقمي.',
    logoUrl: '',
    heroImageUrl: '',
    contactEmail: 'info@namaa.sa',
    whatsappNumber: '+966500000000',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    enableServices: true,
    enableCourses: true,
    enableProjects: true,
    enableBlog: true,
    enableAIConsultant: true,
    enableAr: true,
    enableEn: true,
    enableSAR: true,
    enableUSD: true
  });

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Service | Course | Project | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false); // Checkout Modal State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Logic to enforce enabled languages/currencies
  useEffect(() => {
    // If current lang is disabled, switch to the other one
    if (lang === 'en' && !siteSettings.enableEn) {
        setLang('ar');
    } else if (lang === 'ar' && !siteSettings.enableAr) {
        setLang('en');
    }

    // If current currency is disabled, switch
    if (currency === 'SAR' && !siteSettings.enableSAR) {
        setCurrency('USD');
    } else if (currency === 'USD' && !siteSettings.enableUSD) {
        setCurrency('SAR');
    }
  }, [siteSettings, lang, currency]);

  // --- HANDLERS ---
  const toggleLanguage = () => {
      // Only toggle if target language is enabled
      if (lang === 'en' && siteSettings.enableAr) setLang('ar');
      else if (lang === 'ar' && siteSettings.enableEn) setLang('en');
  };
  
  const toggleCurrency = () => {
      if (currency === 'SAR' && siteSettings.enableUSD) setCurrency('USD');
      else if (currency === 'USD' && siteSettings.enableSAR) setCurrency('SAR');
  };
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleViewItem = (item: Service | Course | Project) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleViewBlogPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setIsBlogModalOpen(true);
  };

  const handleAddReview = (itemId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };

    const updateReviewInList = (list: any[], setList: any) => {
      setList(list.map(item => {
        if (item.id === itemId) {
          return { ...item, reviews: [...item.reviews, newReview] };
        }
        return item;
      }));
    };

    if (services.find(s => s.id === itemId)) updateReviewInList(services, setServices);
    else if (courses.find(c => c.id === itemId)) updateReviewInList(courses, setCourses);
    else if (projects.find(p => p.id === itemId)) updateReviewInList(projects, setProjects);

    if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(prev => prev ? { ...prev, reviews: [...prev.reviews, newReview] } : null);
    }
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handlePlaceOrder = (customerData: CheckoutData) => {
    if (cartItems.length === 0) return;

    // For this simple implementation, we'll use the ID of the first item as the main serviceId 
    // or create a composite representation. The total amount is what matters most for the order record.
    // In a real app, 'Order' would have an 'items' array.
    const primaryItemId = cartItems[0].id;
    
    // If multiple items, we might want to hint that in the serviceId or just link the first one
    // For now, let's keep the existing structure but use the total amount.
    
    const newOrder: Order = {
        id: `ord_${Date.now()}`,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        notes: customerData.notes,
        serviceId: cartItems.length > 1 ? `${primaryItemId} (+${cartItems.length - 1} more)` : primaryItemId,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        amount: totalAmount // This is the sum of all items in cart
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    // CheckoutModal handles the success view, then calls onClose which closes the modal.
  };

  const formatTotalForCheckout = () => {
    const val = currency === 'SAR' ? totalAmount * EXCHANGE_RATE : totalAmount;
    const symbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];
    return currency === 'SAR'
      ? `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${symbol}`
      : `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  // --- RENDER HELPERS ---
  const renderHome = () => (
    <div className="space-y-16 animate-fade-in pb-20">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold animate-fade-in-up">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                  {siteSettings.appNameAr ? (lang === 'en' ? siteSettings.appNameEn : siteSettings.appNameAr) : t.appName[lang]}
               </div>
               <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {siteSettings.heroTitleAr && isRtl ? siteSettings.heroTitleAr : (siteSettings.heroTitleEn && !isRtl ? siteSettings.heroTitleEn : t.heroTitle[lang])}
               </h1>
               <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-lg">
                  {siteSettings.heroSubtitleAr && isRtl ? siteSettings.heroSubtitleAr : (siteSettings.heroSubtitleEn && !isRtl ? siteSettings.heroSubtitleEn : t.heroSubtitle[lang])}
               </p>
               <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => setViewMode('services')} className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2">
                     {siteSettings.heroBtn1TextAr && isRtl ? siteSettings.heroBtn1TextAr : (siteSettings.heroBtn1TextEn && !isRtl ? siteSettings.heroBtn1TextEn : t.getStarted[lang])}
                     <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={20} />
                  </button>
                  <button onClick={() => setViewMode('courses')} className="px-8 py-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                     {siteSettings.heroBtn2TextAr && isRtl ? siteSettings.heroBtn2TextAr : (siteSettings.heroBtn2TextEn && !isRtl ? siteSettings.heroBtn2TextEn : t.courses[lang])}
                  </button>
               </div>
            </div>
            <div className="relative hidden lg:block">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl"></div>
               <img 
                 src={siteSettings.heroImageUrl || "https://images.unsplash.com/photo-1553877615-30c73e63b4aa?auto=format&fit=crop&q=80&w=800"} 
                 alt="Hero" 
                 className="relative rounded-2xl shadow-2xl border-4 border-white dark:border-slate-700 transform rotate-2 hover:rotate-0 transition-transform duration-500" 
               />
               <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 animate-bounce-slow">
                   <div className="bg-green-100 text-green-600 p-3 rounded-full"><Icon name="TrendingUp" size={24} /></div>
                   <div>
                       <p className="text-xs text-gray-500 dark:text-slate-400">{t.revenue[lang]}</p>
                       <p className="text-lg font-bold text-gray-900 dark:text-white">+125%</p>
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* AI Consultant */}
      {siteSettings.enableAIConsultant && (
         <section id="ai-consultant">
            <AIConsultant lang={lang} />
         </section>
      )}

      {/* AI Recommendations */}
      <section>
        <AIRecommendations 
          lang={lang} 
          currency={currency} 
          services={services} 
          courses={courses} 
          onViewDetails={handleViewItem} 
        />
      </section>

      {/* Latest Services */}
      {siteSettings.enableServices && (
          <section>
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.latestServices[lang]}</h2>
                  <p className="text-gray-500 dark:text-slate-400">{t.servicesDesc[lang]}</p>
               </div>
               <button onClick={() => setViewMode('services')} className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1">
                  {t.viewAllCategories[lang]} <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {services.slice(0, 4).map(service => (
                  <ServiceCard key={service.id} service={service} lang={lang} currency={currency} onClick={handleViewItem} />
               ))}
            </div>
          </section>
      )}

      {/* Latest Courses */}
      {siteSettings.enableCourses && (
          <section>
             <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.latestCourses[lang]}</h2>
                  <p className="text-gray-500 dark:text-slate-400">{t.coursesDesc[lang]}</p>
               </div>
               <button onClick={() => setViewMode('courses')} className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1">
                  {t.viewAllCourses[lang]} <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {courses.slice(0, 3).map(course => (
                  <CourseCard key={course.id} course={course} lang={lang} currency={currency} onClick={handleViewItem} />
               ))}
            </div>
          </section>
      )}

      {/* Latest Projects */}
      {siteSettings.enableProjects && (
          <section>
             <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.latestProjects[lang]}</h2>
                  <p className="text-gray-500 dark:text-slate-400">{t.projectsDesc[lang]}</p>
               </div>
               <button onClick={() => setViewMode('projects')} className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1">
                  {t.viewAllCategories[lang]} <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {projects.slice(0, 3).map(project => (
                  <ProjectCard key={project.id} project={project} lang={lang} currency={currency} onClick={handleViewItem} />
               ))}
            </div>
          </section>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'} ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('home')}>
               {siteSettings.logoUrl ? (
                   <img src={siteSettings.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800" />
               ) : (
                   <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                      <Icon name="Briefcase" size={24} />
                   </div>
               )}
               <div className="flex flex-col justify-center">
                  <span className="font-bold text-xl leading-none text-gray-900 dark:text-white tracking-tight">
                     {lang === 'en' ? siteSettings.appNameEn : siteSettings.appNameAr}
                  </span>
               </div>
            </div>

            {/* Search Bar (Hidden in Admin) */}
            {viewMode !== 'admin' && (
              <div className="flex-1 max-w-md hidden md:block mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder[lang]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 text-sm transition-all dark:text-white placeholder-gray-400"
                  />
                  <Icon name="Search" size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            {viewMode !== 'admin' && (
              <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
                 <button 
                   onClick={() => setViewMode('home')} 
                   className={`transition-colors ${viewMode === 'home' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                 >
                   {t.home[lang]}
                 </button>
                 {siteSettings.enableServices && (
                   <button 
                     onClick={() => setViewMode('services')} 
                     className={`transition-colors ${viewMode === 'services' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                   >
                     {t.services[lang]}
                   </button>
                 )}
                 {siteSettings.enableCourses && (
                   <button 
                     onClick={() => setViewMode('courses')} 
                     className={`transition-colors ${viewMode === 'courses' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                   >
                     {t.courses[lang]}
                   </button>
                 )}
                 {siteSettings.enableProjects && (
                   <button 
                     onClick={() => setViewMode('projects')} 
                     className={`transition-colors ${viewMode === 'projects' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                   >
                     {t.projects[lang]}
                   </button>
                 )}
                 {siteSettings.enableBlog && (
                   <button 
                     onClick={() => setViewMode('blog')} 
                     className={`transition-colors ${viewMode === 'blog' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                   >
                     {t.blog[lang]}
                   </button>
                 )}
                 <button 
                   onClick={() => setViewMode('contact')} 
                   className={`transition-colors ${viewMode === 'contact' ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                 >
                   {t.contact[lang]}
                 </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-4">
               
               {/* Cart Icon (Only for Client View) */}
               {viewMode !== 'admin' && (
                 <button 
                   onClick={() => setIsCartOpen(true)}
                   className="p-2 relative rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                 >
                    <Icon name="ShoppingBag" size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                        {cartCount}
                      </span>
                    )}
                 </button>
               )}

               <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
               <CurrencySwitcher 
                  currency={currency} 
                  onToggle={toggleCurrency} 
                  lang={lang} 
                  enabledSAR={siteSettings.enableSAR}
                  enabledUSD={siteSettings.enableUSD}
               />
               <LanguageSwitcher 
                  currentLang={lang} 
                  onToggle={toggleLanguage} 
                  enabledAr={siteSettings.enableAr}
                  enabledEn={siteSettings.enableEn}
               />
               
               {viewMode === 'admin' ? (
                  <button onClick={() => setViewMode('home')} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-full font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                     {t.client[lang]}
                  </button>
               ) : (
                  <button onClick={() => setViewMode('admin')} className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-full font-bold text-sm hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors hidden sm:block">
                     {t.admin[lang]}
                  </button>
               )}

               {/* Mobile Menu Button */}
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 dark:text-slate-300">
                  <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
               </button>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
           <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 animate-fade-in-down">
              <nav className="flex flex-col gap-4">
                  <button onClick={() => { setViewMode('home'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'home' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.home[lang]}</button>
                  {siteSettings.enableServices && <button onClick={() => { setViewMode('services'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'services' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.services[lang]}</button>}
                  {siteSettings.enableCourses && <button onClick={() => { setViewMode('courses'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'courses' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.courses[lang]}</button>}
                  {siteSettings.enableProjects && <button onClick={() => { setViewMode('projects'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'projects' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.projects[lang]}</button>}
                  {siteSettings.enableBlog && <button onClick={() => { setViewMode('blog'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'blog' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.blog[lang]}</button>}
                  <button onClick={() => { setViewMode('contact'); setMobileMenuOpen(false); }} className={`text-start px-4 py-2 rounded-lg ${viewMode === 'contact' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-600 dark:text-slate-300'}`}>{t.contact[lang]}</button>
                  <button onClick={() => { setViewMode('admin'); setMobileMenuOpen(false); }} className="text-start px-4 py-2 rounded-lg text-gray-600 dark:text-slate-300">{t.admin[lang]}</button>
              </nav>
           </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
         {viewMode === 'home' && renderHome()}
         
         {viewMode === 'admin' && (
            <AdminDashboard 
              lang={lang} 
              currency={currency} 
              theme={theme}
              orders={orders} setOrders={setOrders} // PASSING LIFTED STATE
              categories={categories} setCategories={setCategories}
              services={services} setServices={setServices}
              courses={courses} setCourses={setCourses}
              courseCategories={courseCategories} setCourseCategories={setCourseCategories}
              projects={projects} setProjects={setProjects}
              projectCategories={projectCategories} setProjectCategories={setProjectCategories}
              blogPosts={blogPosts} setBlogPosts={setBlogPosts}
              blogCategories={blogCategories} setBlogCategories={setBlogCategories}
              siteSettings={siteSettings} setSiteSettings={setSiteSettings}
              infoPages={infoPages} setInfoPages={setInfoPages}
              onViewItem={handleViewItem}
            />
         )}
         
         {viewMode === 'contact' && (
            <ContactPage settings={siteSettings} lang={lang} />
         )}

         {viewMode === 'services' && (
            <ServicesPage 
               lang={lang} 
               currency={currency} 
               searchQuery={searchQuery} 
               services={services} 
               categories={categories}
               onViewDetails={handleViewItem}
            />
         )}
         
         {viewMode === 'courses' && (
            <CoursesPage 
               lang={lang} 
               currency={currency} 
               searchQuery={searchQuery} 
               courses={courses} 
               categories={courseCategories}
               onViewDetails={handleViewItem}
            />
         )}

        {viewMode === 'projects' && (
            <ProjectsPage 
               lang={lang} 
               currency={currency} 
               searchQuery={searchQuery} 
               projects={projects} 
               categories={projectCategories}
               onViewDetails={handleViewItem}
            />
         )}

        {viewMode === 'blog' && (
            <BlogPage 
               lang={lang}
               posts={blogPosts}
               categories={blogCategories}
               onViewPost={handleViewBlogPost}
            />
         )}

         {viewMode.startsWith('page-') && (
            (() => {
              const pageId = viewMode;
              const page = infoPages.find(p => p.id === pageId);
              return page ? <InfoPageView page={page} lang={lang} /> : <div className="text-center py-20">{t.noResults[lang]}</div>;
            })()
         )}
      </main>

      {/* --- FOOTER --- */}
      {viewMode !== 'admin' && (
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-16 pb-8">
           <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       {siteSettings.logoUrl ? (
                           <img src={siteSettings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800" />
                       ) : (
                           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                              <Icon name="Briefcase" size={18} />
                           </div>
                       )}
                       <span className="font-bold text-xl text-gray-900 dark:text-white">
                          {lang === 'en' ? siteSettings.appNameEn : siteSettings.appNameAr}
                       </span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                       {lang === 'en' ? siteSettings.descriptionEn : siteSettings.descriptionAr}
                    </p>
                    <div className="flex gap-4">
                       {siteSettings.twitterUrl && <a href={siteSettings.twitterUrl} className="text-gray-400 hover:text-primary-500"><Icon name="Twitter" size={20} /></a>}
                       {siteSettings.facebookUrl && <a href={siteSettings.facebookUrl} className="text-gray-400 hover:text-primary-500"><Icon name="Facebook" size={20} /></a>}
                       {siteSettings.instagramUrl && <a href={siteSettings.instagramUrl} className="text-gray-400 hover:text-primary-500"><Icon name="Instagram" size={20} /></a>}
                    </div>
                 </div>

                 <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">{t.company[lang]}</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                       <li><button onClick={() => setViewMode('home')} className="hover:text-primary-600 transition-colors">{t.home[lang]}</button></li>
                       {infoPages.map(page => (
                          <li key={page.id}>
                             <button onClick={() => setViewMode(page.id)} className="hover:text-primary-600 transition-colors">
                                {lang === 'en' ? page.titleEn : page.titleAr}
                             </button>
                          </li>
                       ))}
                       <li><button onClick={() => setViewMode('contact')} className="hover:text-primary-600 transition-colors">{t.contact[lang]}</button></li>
                    </ul>
                 </div>

                 <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">{t.services[lang]}</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                       {siteSettings.enableServices && <li><button onClick={() => setViewMode('services')} className="hover:text-primary-600 transition-colors">{t.setupServices[lang]}</button></li>}
                       {siteSettings.enableCourses && <li><button onClick={() => setViewMode('courses')} className="hover:text-primary-600 transition-colors">{t.courses[lang]}</button></li>}
                       {siteSettings.enableBlog && <li><button onClick={() => setViewMode('blog')} className="hover:text-primary-600 transition-colors">{t.blog[lang]}</button></li>}
                       {siteSettings.enableAIConsultant && <li><button onClick={() => { setViewMode('home'); setTimeout(() => document.getElementById('ai-consultant')?.scrollIntoView({behavior:'smooth'}), 100); }} className="hover:text-primary-600 transition-colors">{t.consultAI[lang]}</button></li>}
                    </ul>
                 </div>

                 <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">{t.contactInfo[lang]}</h4>
                    <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                       <li className="flex items-center gap-3">
                          <Icon name="Mail" size={16} />
                          <span>{siteSettings.contactEmail}</span>
                       </li>
                       <li className="flex items-center gap-3">
                          <Icon name="Phone" size={16} />
                          <span dir="ltr">{siteSettings.whatsappNumber}</span>
                       </li>
                       <li className="flex items-center gap-3">
                          <Icon name="MapPin" size={16} />
                          <span>{lang === 'en' ? siteSettings.cityEn : siteSettings.cityAr}, {lang === 'en' ? siteSettings.countryEn : siteSettings.countryAr}</span>
                       </li>
                    </ul>
                 </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                 <p>© {new Date().getFullYear()} {lang === 'en' ? siteSettings.appNameEn : siteSettings.appNameAr}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
                 <div className="flex gap-6">
                    {/* Additional footer links if needed */}
                 </div>
              </div>
           </div>
        </footer>
      )}

      {/* --- MODALS --- */}
      <ItemDetailModal 
        item={selectedItem}
        isOpen={isItemModalOpen}
        onClose={() => { setIsItemModalOpen(false); setSelectedItem(null); }}
        lang={lang}
        currency={currency}
        onAddReview={handleAddReview}
        onPurchase={() => setIsItemModalOpen(false)} 
      />

      <BlogDetailModal
        post={selectedBlogPost}
        isOpen={isBlogModalOpen}
        onClose={() => { setIsBlogModalOpen(false); setSelectedBlogPost(null); }}
        lang={lang}
      />

      {/* Cart Drawer */}
      <CartDrawer 
        lang={lang} 
        currency={currency} 
        onCheckout={handleOpenCheckout} // Now triggers the modal
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)}
        lang={lang}
        totalAmount={formatTotalForCheckout()}
        onConfirm={handlePlaceOrder}
      />
    </div>
  );
};

// Wrap App with CartProvider
const AppWithProvider: React.FC = () => {
  return (
    <CartProvider>
      <MainLayout />
    </CartProvider>
  );
};

export default AppWithProvider;
