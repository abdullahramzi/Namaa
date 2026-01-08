
import React, { useState, useEffect } from 'react';
import { Service, Course, Project, Language, Currency, Review } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';
import ReviewSection from './ReviewSection';
import StarRating from './StarRating';
import { useCart } from '../contexts/CartContext';

interface Props {
  item: Service | Course | Project | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  onAddReview: (itemId: string, review: Omit<Review, 'id' | 'date'>) => void;
  isPurchased?: boolean;
  onPurchase?: () => void; // Kept for interface compatibility but logic moved to Cart
}

// ... ShareActions and getEmbedUrl helpers remain the same ...
const ShareActions = ({ title, lang }: { title: string, lang: Language }) => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentUrl) return null;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        {lang === 'ar' ? 'مشاركة:' : 'Share:'}
      </span>
      
      <button 
        onClick={handleCopy} 
        className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300 relative group"
        title={lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
      >
        <Icon name={copied ? "Check" : "Link"} size={18} />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in-up">
            {lang === 'ar' ? 'تم النسخ!' : 'Copied!'}
          </span>
        )}
      </button>

      <a 
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="Twitter / X"
      >
        <Icon name="Twitter" size={18} />
      </a>

      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="Facebook"
      >
        <Icon name="Facebook" size={18} />
      </a>

      <a 
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        title="LinkedIn"
      >
        <Icon name="Linkedin" size={18} />
      </a>
    </div>
  );
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.trim();
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = cleanUrl.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&autoplay=1`;
  }
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
     return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return cleanUrl;
};

const isEmbeddable = (url: string) => {
    if (!url) return false;
    return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
};

const ItemDetailModal: React.FC<Props> = ({ item, isOpen, onClose, lang, currency, onAddReview, isPurchased = false }) => {
  const { addToCart, items: cartItems } = useCart();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Initialize active lesson when course opens
  useEffect(() => {
    if (item && 'lessons' in item) {
      if (!isPurchased) {
        if (item.introVideoUrl) {
          setActiveLessonId('intro');
        } else {
          setActiveLessonId(null); 
        }
      } else {
        if (item.lessons.length > 0) {
          setActiveLessonId(item.lessons[0].id);
        } else if (item.introVideoUrl) {
           setActiveLessonId('intro');
        } else {
          setActiveLessonId(null);
        }
      }
    } else {
      setActiveLessonId(null);
    }
  }, [item, isPurchased]);

  if (!isOpen || !item) return null;

  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  const fontClass = lang === 'ar' ? 'font-arabic' : 'font-sans';

  const title = lang === 'en' ? item.titleEn : item.titleAr;
  const description = lang === 'en' ? item.descriptionEn : item.descriptionAr;
  
  // Price Calculations
  const displayPrice = currency === 'SAR' 
    ? (item.price * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
    : item.price.toLocaleString();
    
  const isService = (i: any): i is Service => !('lessons' in i) && !('techStack' in i);
  const isCourse = (i: any): i is Course => 'lessons' in i;
  const isProject = (i: any): i is Project => 'techStack' in i;
  
  const now = new Date();
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const isDiscountActive = item.discountPrice && 
    (!item.discountStartDate || todayStr >= item.discountStartDate) &&
    (!item.discountEndDate || todayStr <= item.discountEndDate);

  const discountPrice = isDiscountActive ? item.discountPrice : null;
  
  let daysRemaining: number | null = null;
  if (isDiscountActive && item.discountEndDate) {
      const start = new Date(todayStr);
      const end = new Date(item.discountEndDate);
      const diffTime = end.getTime() - start.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  const displayDiscountPrice = discountPrice
    ? (currency === 'SAR' 
        ? (discountPrice * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })
        : discountPrice.toLocaleString())
    : null;

  const currencySymbol = currency === 'SAR' ? t.sar[lang] : t.usd[lang];

  let currentVideoUrl = '';
  let currentVideoTitle = '';
  
  if (isCourse(item)) {
    if (activeLessonId === 'intro') {
      currentVideoUrl = item.introVideoUrl || '';
      currentVideoTitle = lang === 'ar' ? 'نبذة عن الدورة (مجاني)' : 'Course Preview (Free)';
    } else if (activeLessonId) {
      const lesson = item.lessons.find(l => l.id === activeLessonId);
      if (lesson) {
        currentVideoUrl = lesson.videoUrl;
        currentVideoTitle = lesson.title;
      }
    }
  }

  const handleLessonSelect = (lessonId: string) => {
    if (!isPurchased) return;
    setActiveLessonId(lessonId);
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Cart Logic
  const isInCart = cartItems.some(i => i.id === item.id);
  const handleAddToCart = () => {
    let type: 'service' | 'course' | 'project' = 'service';
    if (isCourse(item)) type = 'course';
    if (isProject(item)) type = 'project';
    addToCart(item, type);
    onClose();
  };

  // --- RENDER FOR COURSES (UDEMY STYLE) ---
  if (isCourse(item)) {
    return (
      <div className={`fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-y-auto animate-fade-in ${fontClass}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Top Dark Hero Section */}
        <div className="bg-slate-900 text-white pt-8 pb-12 px-4 relative">
            <button 
                onClick={onClose} 
                className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20`}
            >
                <Icon name="X" size={24} className="text-white" />
            </button>

            <div className="container mx-auto max-w-6xl">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Hero Left Content */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-blue-300 font-medium">
                            <span>{t.courses[lang]}</span>
                            <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={12} />
                            <span>
                                {item.category === 'business' && t.businessCat[lang]}
                                {item.category === 'marketing' && t.marketingCat[lang]}
                                {item.category === 'tech' && t.techCat[lang]}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
                        <p className="text-lg text-slate-300 line-clamp-2">{description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
                             {item.isPopular && (
                                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold text-xs">
                                    {t.popular[lang]}
                                </span>
                             )}
                             <div className="flex items-center gap-1 text-amber-400">
                                 <span className="font-bold">{item.rating.toFixed(1)}</span>
                                 <StarRating rating={item.rating} size={14} />
                             </div>
                             <span className="text-blue-300 underline">({item.reviews.length} {t.reviews[lang]})</span>
                             <span className="text-slate-300">
                                {item.purchaseCount} {t.purchases[lang]}
                             </span>
                        </div>
                    </div>
                    <div className="hidden lg:block lg:col-span-1"></div>
                 </div>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto max-w-6xl px-4 py-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="border border-gray-200 dark:border-slate-700 p-6 rounded-xl bg-white dark:bg-slate-800">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {t.whatYouWillLearn[lang]}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {item.learningPoints && item.learningPoints.length > 0 ? (
                                item.learningPoints.map((point, index) => (
                                    <div key={index} className="flex gap-2 items-start text-sm text-gray-600 dark:text-slate-300">
                                        <Icon name="Check" size={18} className="text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                                        <span>{point}</span>
                                    </div>
                                ))
                             ) : (
                                 <div className="text-sm text-gray-500">No learning points available.</div>
                             )}
                        </div>
                    </div>

                    {/* Course Content */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.courseContent[lang]}</h2>
                        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                             {item.introVideoUrl && (
                                <div 
                                    className={`p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 ${activeLessonId === 'intro' ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                                    onClick={() => setActiveLessonId('intro')}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon name="PlayCircle" size={16} className="text-gray-500" />
                                        <span className={`text-sm font-medium ${activeLessonId === 'intro' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                            {t.intro[lang]}: {t.coursePreview[lang]}
                                        </span>
                                    </div>
                                </div>
                             )}
                             {item.lessons.map((lesson) => {
                                 const isLocked = !isPurchased;
                                 return (
                                     <div 
                                        key={lesson.id}
                                        onClick={() => handleLessonSelect(lesson.id)}
                                        className={`p-4 border-b border-gray-100 dark:border-slate-700 last:border-0 flex items-center justify-between transition-colors ${
                                            isLocked ? 'cursor-not-allowed opacity-70 bg-gray-50 dark:bg-slate-900' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                        }`}
                                     >
                                         <div className="flex items-center gap-3">
                                             <Icon name={isLocked ? "Lock" : "PlayCircle"} size={16} className="text-gray-500" />
                                             <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{lesson.title}</span>
                                         </div>
                                         <span className="text-sm text-gray-500">{lesson.duration}</span>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>

                    <ReviewSection reviews={item.reviews} lang={lang} onAddReview={(review) => onAddReview(item.id, review)} />
                </div>

                {/* Right Column: Sticky Sidebar Card */}
                <div className="lg:col-span-1 relative">
                    <div className="lg:absolute lg:-top-64 lg:right-0 w-full">
                        <div className="sticky top-4 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-30">
                            {/* Video Player */}
                            <div className="aspect-video bg-black relative group cursor-pointer" onContextMenu={handleContextMenu}>
                                {currentVideoUrl ? (
                                     isEmbeddable(currentVideoUrl) ? (
                                        <iframe className="w-full h-full" src={getEmbedUrl(currentVideoUrl)} title={currentVideoTitle} frameBorder="0" allowFullScreen></iframe>
                                     ) : (
                                        <video className="w-full h-full" src={currentVideoUrl} controls controlsList="nodownload" autoPlay><p>Your browser does not support HTML5 video.</p></video>
                                     )
                                ) : (
                                    <div className="w-full h-full relative" onClick={() => { if(!isPurchased && item.introVideoUrl) setActiveLessonId('intro'); }}>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                            <div className="bg-white rounded-full p-4 shadow-lg animate-pulse"><Icon name="PlayCircle" size={40} className="text-black" /></div>
                                        </div>
                                        {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="preview" className="w-full h-full object-cover" /> : <div className={`w-full h-full ${item.thumbnailColor || 'bg-slate-700'}`}></div>}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-end gap-3 mb-6">
                                    {displayDiscountPrice ? (
                                        <>
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayDiscountPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                                            <span className="text-lg text-gray-400 line-through mb-1 dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                                    )}
                                </div>
                                
                                {isPurchased ? (
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg text-center font-bold mb-4">{t.ownedCourse[lang]}</div>
                                ) : (
                                    <button 
                                        onClick={handleAddToCart}
                                        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-xl mb-3 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isInCart ? (
                                            <>
                                                <Icon name="Check" size={20} />
                                                {t.addedToCart[lang]}
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="ShoppingBag" size={20} />
                                                {t.addToCart[lang]}
                                            </>
                                        )}
                                    </button>
                                )}
                                <ShareActions title={title} lang={lang} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER FOR SERVICES & PROJECTS ---
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${fontClass}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
        <button onClick={onClose} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-30 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-gray-600 dark:text-slate-300`}><Icon name="X" size={20} /></button>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 scroll-smooth">
            <div className="mb-8">
                 <div className="flex items-start gap-5 mb-6">
                    {isProject(item) && item.thumbnailUrl ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                            <img src={item.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700 border border-primary-100 dark:border-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                             <Icon name={isService(item) ? item.icon : 'Code'} className="text-primary-600 dark:text-primary-400" size={40} />
                        </div>
                    )}
                    <div>
                         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{title}</h2>
                         <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                             <div className="flex items-center gap-1">
                                 <StarRating rating={item.rating} size={14} />
                                 <span className="font-semibold text-gray-900 dark:text-white ml-1">{item.rating.toFixed(1)}</span>
                             </div>
                             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                             <div>{item.purchaseCount} {t.purchases[lang]}</div>
                         </div>
                    </div>
                 </div>
            </div>

            {/* Description */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Icon name="FileText" size={20} className="text-gray-400" />
                    {t.description[lang]}
                </h3>
                <p className="text-gray-600 dark:text-slate-300 leading-8 text-base md:text-lg">
                    {description}
                </p>
            </div>

            <ShareActions title={title} lang={lang} />
            <ReviewSection reviews={item.reviews} lang={lang} onAddReview={(review) => onAddReview(item.id, review)} />
        </div>

        <div className="w-full md:w-[380px] bg-slate-100 dark:bg-slate-800/50 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-700 p-6 md:p-8 flex flex-col justify-center shadow-inner md:shadow-none z-20">
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 sticky top-8">
                 <div className="mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                     <span className="text-sm text-gray-500 dark:text-slate-400 font-medium block mb-1">{t.price[lang]}</span>
                     {displayDiscountPrice ? (
                         <div className="flex flex-wrap items-baseline gap-2">
                             <span className="text-3xl font-bold text-gray-900 dark:text-white dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayDiscountPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                             <span className="text-lg text-gray-400 line-through dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                         </div>
                     ) : (
                        <span className="text-3xl font-bold text-gray-900 dark:text-white dir-ltr">{currency === 'USD' ? currencySymbol : ''}{displayPrice}{currency === 'SAR' ? currencySymbol : ''}</span>
                     )}
                 </div>

                 <div className="space-y-3">
                     {isPurchased ? (
                         <a href="#" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group">
                             <Icon name="ArrowRight" size={20} className="rotate-90" />
                             <span>{t.download[lang]}</span>
                         </a>
                     ) : (
                         <button 
                             onClick={handleAddToCart}
                             className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/30 flex items-center justify-center gap-2 group"
                         >
                             {isInCart ? (
                                <>
                                    <Icon name="Check" size={20} />
                                    <span>{t.addedToCart[lang]}</span>
                                </>
                             ) : (
                                <>
                                    <Icon name="ShoppingBag" size={20} />
                                    <span>{t.addToCart[lang]}</span>
                                </>
                             )}
                         </button>
                     )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
