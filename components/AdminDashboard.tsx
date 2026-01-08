import React, { useState, useEffect } from 'react';
import { 
  Language, Currency, Order, Service, Course, Project, 
  ServiceCategory, SiteSettings, InfoPage, BlogPost, BlogCategory, Invoice, Review, CourseLesson 
} from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon, { Icons } from './Icon';
import InvoiceModal from './InvoiceModal';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import StarRating from './StarRating';

interface Props {
  lang: Language;
  currency: Currency;
  theme: 'light' | 'dark';
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  categories: ServiceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseCategories: ServiceCategory[];
  setCourseCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  projectCategories: ServiceCategory[];
  setProjectCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  blogCategories: BlogCategory[];
  setBlogCategories: React.Dispatch<React.SetStateAction<BlogCategory[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  infoPages: InfoPage[];
  setInfoPages: React.Dispatch<React.SetStateAction<InfoPage[]>>;
  onViewItem: (item: Service | Course | Project) => void;
}

const AdminDashboard: React.FC<Props> = ({
  lang, currency, theme,
  orders, setOrders,
  services, setServices,
  categories, setCategories,
  courses, setCourses,
  courseCategories, setCourseCategories,
  projects, setProjects,
  projectCategories, setProjectCategories,
  blogPosts, setBlogPosts,
  blogCategories, setBlogCategories,
  siteSettings, setSiteSettings,
  infoPages, setInfoPages,
  onViewItem
}) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Invoice State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<'service' | 'course' | 'project' | 'blog'>('service');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', duration: '', videoUrl: '' });

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectFeatureInput, setProjectFeatureInput] = useState('');
  const [projectTechInput, setProjectTechInput] = useState('');

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost> | null>(null);

  // Info Page Modal State
  const [isInfoPageModalOpen, setIsInfoPageModalOpen] = useState(false);
  const [editingInfoPage, setEditingInfoPage] = useState<Partial<InfoPage> | null>(null);

  // Review Management State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [currentReviewForReply, setCurrentReviewForReply] = useState<{id: string, sourceId: string, sourceType: 'service' | 'course' | 'project', content: string, userName: string} | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  const handleSaveSettings = () => {
    setSiteSettings(settingsForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleCurrency = (currCode: 'SAR' | 'USD') => {
      if (currCode === 'SAR') {
          if (settingsForm.enableSAR && !settingsForm.enableUSD) { 
            setSettingsForm({...settingsForm, enableSAR: false, enableUSD: true}); 
          } else { 
            setSettingsForm({...settingsForm, enableSAR: !settingsForm.enableSAR}); 
          }
      } else {
          if (settingsForm.enableUSD && !settingsForm.enableSAR) { 
            setSettingsForm({...settingsForm, enableUSD: false, enableSAR: true}); 
          } else { 
            setSettingsForm({...settingsForm, enableUSD: !settingsForm.enableUSD}); 
          }
      }
  };

  // Correct Revenue Calculation (Invoices only)
  const revenue = orders
    .filter(o => o.invoiceId)
    .reduce((sum, o) => sum + o.amount, 0);

  // Stats
  const activeOrdersCount = orders.filter(o => ['pending', 'in_progress', 'awaiting_payment'].includes(o.status)).length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  
  // Chart Data
  const barChartData = [
    { name: isRtl ? 'السبت' : 'Sat', amt: revenue * 0.1 },
    { name: isRtl ? 'الأحد' : 'Sun', amt: revenue * 0.2 },
    { name: isRtl ? 'الاثنين' : 'Mon', amt: revenue * 0.15 },
    { name: isRtl ? 'الثلاثاء' : 'Tue', amt: revenue * 0.25 },
    { name: isRtl ? 'الأربعاء' : 'Wed', amt: revenue * 0.1 },
    { name: isRtl ? 'الخميس' : 'Thu', amt: revenue * 0.15 },
    { name: isRtl ? 'الجمعة' : 'Fri', amt: revenue * 0.05 },
  ];

  const pieChartData = [
    { name: t.completed[lang], value: completedOrdersCount, color: '#10b981' },
    { name: t.in_progress[lang], value: activeOrdersCount, color: '#f59e0b' },
    { name: t.pending[lang], value: orders.filter(o => o.status === 'pending').length, color: '#3b82f6' },
  ];

  const handleGenerateInvoice = (order: Order) => {
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      date: new Date().toISOString().split('T')[0],
      amount: order.amount,
      status: 'paid',
      itemsDescription: `Order #${order.id} - ${order.serviceId}`,
    };
    
    if (!order.invoiceId) {
        const updatedOrders = orders.map(o => o.id === order.id ? { ...o, invoiceId: newInvoice.id, status: 'completed' as const } : o);
        setOrders(updatedOrders);
    }
    
    setSelectedInvoice(newInvoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteItem = (type: string, id: string) => {
      if (!window.confirm(t.deleteConfirm[lang])) return;
      switch(type) {
          case 'service': setServices(services.filter(i => i.id !== id)); break;
          case 'course': setCourses(courses.filter(i => i.id !== id)); break;
          case 'project': setProjects(projects.filter(i => i.id !== id)); break;
          case 'blog': setBlogPosts(blogPosts.filter(i => i.id !== id)); break;
          case 'page': setInfoPages(infoPages.filter(i => i.id !== id)); break;
          case 'category': setCategories(categories.filter(i => i.id !== id)); break;
          case 'courseCategory': setCourseCategories(courseCategories.filter(i => i.id !== id)); break;
          case 'projectCategory': setProjectCategories(projectCategories.filter(i => i.id !== id)); break;
          case 'blogCategory': setBlogCategories(blogCategories.filter(i => i.id !== id)); break;
      }
      if (type === 'service' && isServiceModalOpen) setIsServiceModalOpen(false);
      if (type === 'course' && isCourseModalOpen) setIsCourseModalOpen(false);
      if (type === 'project' && isProjectModalOpen) setIsProjectModalOpen(false);
      if (type === 'blog' && isBlogModalOpen) setIsBlogModalOpen(false);
      if (type === 'page' && isInfoPageModalOpen) setIsInfoPageModalOpen(false);
  };

  // --- Review Handling ---
  const handleReviewAction = (sourceType: 'service' | 'course' | 'project', sourceId: string, reviewId: string, action: 'approve' | 'reject' | 'reply', content?: string) => {
      const updateList = (list: any[], setList: any) => {
          setList(list.map((item: any) => {
              if (item.id === sourceId) {
                  return {
                      ...item,
                      reviews: item.reviews.map((r: Review) => {
                          if (r.id === reviewId) {
                              if (action === 'reply') return { ...r, adminReply: content };
                              return { ...r, status: action === 'approve' ? 'approved' : 'rejected' };
                          }
                          return r;
                      })
                  };
              }
              return item;
          }));
      };

      if (sourceType === 'service') updateList(services, setServices);
      else if (sourceType === 'course') updateList(courses, setCourses);
      else if (sourceType === 'project') updateList(projects, setProjects);
  };

  const openReplyModal = (review: any) => {
      setCurrentReviewForReply({
          id: review.id,
          sourceId: review.sourceId,
          sourceType: review.sourceType,
          content: review.comment,
          userName: review.userName
      });
      setReplyText(review.adminReply || '');
      setReplyModalOpen(true);
  };

  const submitReply = () => {
      if (currentReviewForReply && replyText.trim()) {
          handleReviewAction(currentReviewForReply.sourceType, currentReviewForReply.sourceId, currentReviewForReply.id, 'reply', replyText);
          setReplyModalOpen(false);
          setReplyText('');
          setCurrentReviewForReply(null);
      }
  };

  // --- Category Handlers ---
  const handleOpenCategoryModal = (type: 'service' | 'course' | 'project' | 'blog', category: any = null) => {
      setCategoryType(type);
      setEditingCategory(category || {
          id: '',
          titleEn: '',
          titleAr: '',
          descriptionEn: '',
          descriptionAr: '',
          icon: 'Folder',
          color: '#3b82f6',
          order: 0
      });
      setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCategory) return;

      const newCategory = {
          ...editingCategory,
          id: editingCategory.id || `${categoryType}_cat_${Date.now()}`
      };

      const updateList = (currentList: any[], setList: any) => {
          if (editingCategory.id) {
              setList(currentList.map(c => c.id === newCategory.id ? newCategory : c));
          } else {
              setList([...currentList, newCategory]);
          }
      };

      switch(categoryType) {
          case 'service': updateList(categories, setCategories); break;
          case 'course': updateList(courseCategories, setCourseCategories); break;
          case 'project': updateList(projectCategories, setProjectCategories); break;
          case 'blog': updateList(blogCategories, setBlogCategories); break;
      }
      setIsCategoryModalOpen(false);
  };

  // --- Service Handlers ---
  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingService({ ...service });
    } else {
      setEditingService({
        id: '',
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        category: categories[0]?.id || '',
        price: 0,
        icon: 'Briefcase',
        isPopular: false,
        seoKeywords: [],
        purchaseCount: 0,
        rating: 5,
        reviews: []
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const newService = {
      ...editingService,
      id: editingService.id || `srv_${Date.now()}`,
      price: Number(editingService.price),
      discountPrice: editingService.discountPrice ? Number(editingService.discountPrice) : undefined,
    } as Service;

    if (editingService.id) {
      setServices(services.map(s => s.id === newService.id ? newService : s));
    } else {
      setServices([...services, newService]);
    }
    setIsServiceModalOpen(false);
  };

  // --- Course Handlers ---
  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse({ ...course });
    } else {
      setEditingCourse({
        id: '',
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        category: courseCategories[0]?.id || '',
        price: 0,
        duration: '',
        thumbnailUrl: '',
        lessons: [],
        isPopular: false,
        purchaseCount: 0,
        rating: 5,
        reviews: [],
        learningPoints: [],
        features: []
      });
    }
    setLessonForm({ title: '', duration: '', videoUrl: '' });
    setIsCourseModalOpen(true);
  };

  const handleAddLesson = () => {
    if (!lessonForm.title || !editingCourse) return;
    const newLesson: CourseLesson = {
      id: `l_${Date.now()}`,
      title: lessonForm.title,
      duration: lessonForm.duration,
      videoUrl: lessonForm.videoUrl
    };
    setEditingCourse({
      ...editingCourse,
      lessons: [...(editingCourse.lessons || []), newLesson]
    });
    setLessonForm({ title: '', duration: '', videoUrl: '' });
  };

  const handleRemoveLesson = (lessonId: string) => {
    if (!editingCourse) return;
    setEditingCourse({
      ...editingCourse,
      lessons: editingCourse.lessons?.filter(l => l.id !== lessonId) || []
    });
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const newCourse = {
      ...editingCourse,
      id: editingCourse.id || `crs_${Date.now()}`,
      price: Number(editingCourse.price),
      discountPrice: editingCourse.discountPrice ? Number(editingCourse.discountPrice) : undefined,
    } as Course;

    if (editingCourse.id) {
      setCourses(courses.map(c => c.id === newCourse.id ? newCourse : c));
    } else {
      setCourses([...courses, newCourse]);
    }
    setIsCourseModalOpen(false);
  };

  // --- Project Handlers ---
  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
        setEditingProject({ ...project });
    } else {
        setEditingProject({
            id: '',
            titleEn: '',
            titleAr: '',
            descriptionEn: '',
            descriptionAr: '',
            category: projectCategories[0]?.id || '',
            price: 0,
            thumbnailUrl: '',
            downloadUrl: '',
            demoUrl: '',
            features: [],
            techStack: [],
            isPopular: false,
            purchaseCount: 0,
            rating: 5,
            reviews: []
        });
    }
    setProjectFeatureInput('');
    setProjectTechInput('');
    setIsProjectModalOpen(true);
  };

  const handleAddProjectFeature = () => {
      if(!projectFeatureInput.trim() || !editingProject) return;
      setEditingProject({
          ...editingProject,
          features: [...(editingProject.features || []), projectFeatureInput.trim()]
      });
      setProjectFeatureInput('');
  };

  const handleRemoveProjectFeature = (index: number) => {
      if(!editingProject) return;
      const newFeatures = [...(editingProject.features || [])];
      newFeatures.splice(index, 1);
      setEditingProject({ ...editingProject, features: newFeatures });
  };

  const handleAddProjectTech = () => {
      if(!projectTechInput.trim() || !editingProject) return;
      setEditingProject({
          ...editingProject,
          techStack: [...(editingProject.techStack || []), projectTechInput.trim()]
      });
      setProjectTechInput('');
  };

  const handleRemoveProjectTech = (index: number) => {
      if(!editingProject) return;
      const newTech = [...(editingProject.techStack || [])];
      newTech.splice(index, 1);
      setEditingProject({ ...editingProject, techStack: newTech });
  };

  const handleSaveProject = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProject) return;

      const newProject = {
          ...editingProject,
          id: editingProject.id || `prj_${Date.now()}`,
          price: Number(editingProject.price),
          discountPrice: editingProject.discountPrice ? Number(editingProject.discountPrice) : undefined,
      } as Project;

      if (editingProject.id) {
          setProjects(projects.map(p => p.id === newProject.id ? newProject : p));
      } else {
          setProjects([...projects, newProject]);
      }
      setIsProjectModalOpen(false);
  };

  // --- Blog Handlers ---
  const handleOpenBlogModal = (post?: BlogPost) => {
    if (post) {
        setEditingBlogPost({ ...post });
    } else {
        setEditingBlogPost({
            id: '',
            titleEn: '',
            titleAr: '',
            contentEn: '',
            contentAr: '',
            excerptEn: '',
            excerptAr: '',
            coverImageUrl: '',
            authorName: 'Admin',
            publishDate: new Date().toISOString().split('T')[0],
            readTime: '5 min read',
            categoryId: blogCategories[0]?.id || ''
        });
    }
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBlogPost) return;

      const newPost = {
          ...editingBlogPost,
          id: editingBlogPost.id || `post_${Date.now()}`
      } as BlogPost;

      if (editingBlogPost.id) {
          setBlogPosts(blogPosts.map(p => p.id === newPost.id ? newPost : p));
      } else {
          setBlogPosts([...blogPosts, newPost]);
      }
      setIsBlogModalOpen(false);
  };

  // --- Info Page Handlers ---
  const handleOpenInfoPageModal = (page?: InfoPage) => {
    if (page) {
        setEditingInfoPage({ ...page });
    } else {
        setEditingInfoPage({
            id: '',
            titleEn: '',
            titleAr: '',
            contentEn: '',
            contentAr: '',
            slug: '',
            isSystem: false
        });
    }
    setIsInfoPageModalOpen(true);
  };

  const handleSaveInfoPage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingInfoPage) return;

      const newPage = {
          ...editingInfoPage,
          id: editingInfoPage.id || `page_${Date.now()}`
      } as InfoPage;

      if (editingInfoPage.id) {
          setInfoPages(infoPages.map(p => p.id === newPage.id ? newPage : p));
      } else {
          setInfoPages([...infoPages, newPage]);
      }
      setIsInfoPageModalOpen(false);
  };

  // Helper to aggregate all reviews
  const allReviews = [
      ...services.flatMap(s => s.reviews.map(r => ({ ...r, itemName: lang === 'en' ? s.titleEn : s.titleAr, type: t.service[lang], sourceId: s.id, sourceType: 'service' as const }))),
      ...courses.flatMap(c => c.reviews.map(r => ({ ...r, itemName: lang === 'en' ? c.titleEn : c.titleAr, type: t.courses[lang], sourceId: c.id, sourceType: 'course' as const }))),
      ...projects.flatMap(p => p.reviews.map(r => ({ ...r, itemName: lang === 'en' ? p.titleEn : p.titleAr, type: t.projects[lang], sourceId: p.id, sourceType: 'project' as const })))
  ];

  // Renderers
  const renderHeader = (title: string, btnText: string, onAdd: () => void) => (
      <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
          <button 
              onClick={onAdd}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
          >
              <Icon name="Plus" size={16} />
              {btnText}
          </button>
      </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                        <Icon name="TrendingUp" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">{t.revenue[lang]}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white dir-ltr">{revenue.toLocaleString()} {currency === 'SAR' ? t.sar[lang] : t.usd[lang]}</h4>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Icon name="ShoppingBag" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">{t.activeOrders[lang]}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{activeOrdersCount}</h4>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Icon name="Users" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">{t.customers[lang]}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">1,204</h4>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                        <Icon name="Briefcase" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">{t.services[lang]}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{services.length + courses.length}</h4>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{t.revenue[lang]}</h3>
                <div className="h-80 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="amt" fill="#0d9488" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">توزيع الطلبات</h3>
                <div className="h-80 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );

  const renderCategoryTable = (list: any[], type: string) => (
      <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                  <tr>
                      <th className="px-6 py-3 font-medium text-center">#</th>
                      <th className="px-6 py-3 font-medium text-center">{t.featureIcon[lang]}</th>
                      <th className="px-6 py-3 font-medium">{t.categoryNameEn[lang]}</th>
                      <th className="px-6 py-3 font-medium">{t.categoryNameAr[lang]}</th>
                      <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {list.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-center">{idx + 1}</td>
                          <td className="px-6 py-4 text-center">
                              {type === 'blog' ? (
                                  <div className="w-6 h-6 rounded-full mx-auto" style={{backgroundColor: item.color}}></div>
                              ) : (
                                  <Icon name={item.icon} className="mx-auto text-gray-500" />
                              )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{item.titleAr}</td>
                          <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-3">
                                  <button onClick={() => handleDeleteItem(type === 'blog' ? 'blogCategory' : (type === 'course' ? 'courseCategory' : (type === 'project' ? 'projectCategory' : 'category')), item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>
                                  <button onClick={() => handleOpenCategoryModal(type as any, item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderCategoryModal = () => {
      if (!isCategoryModalOpen) return null;
      return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingCategory?.id ? t.editCategory[lang] : t.addCategory[lang]}</h3>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                          <Icon name="X" size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.categoryNameAr[lang]}</label>
                              <input type="text" required value={editingCategory?.titleAr || ''} onChange={e => setEditingCategory({...editingCategory, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.categoryNameEn[lang]}</label>
                              <input type="text" required value={editingCategory?.titleEn || ''} onChange={e => setEditingCategory({...editingCategory, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                          </div>
                      </div>
                      
                      {categoryType !== 'blog' && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.categoryIcon[lang]}</label>
                              <div className="flex gap-2 items-center">
                                  <input type="text" value={editingCategory?.icon || ''} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" placeholder="Icon Name (e.g. Home, User)" />
                                  <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded"><Icon name={editingCategory?.icon || 'HelpCircle'} /></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Use Lucid React Icon names</p>
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.categoryColor[lang]}</label>
                          <div className="flex gap-2">
                              <input type="color" value={editingCategory?.color || '#3b82f6'} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="h-10 w-12 rounded cursor-pointer bg-transparent border-0" />
                              <input type="text" value={editingCategory?.color || '#3b82f6'} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left uppercase" dir="ltr" />
                          </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 mt-4">
                          <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                          <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  const renderServiceModal = () => {
    if (!isServiceModalOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in my-8">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingService?.id ? t.editService[lang] : t.addService[lang]}</h3>
                    <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                        <Icon name="X" size={20} />
                    </button>
                </div>
                <form onSubmit={handleSaveService} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceNameAr[lang]}</label>
                            <input type="text" required value={editingService?.titleAr || ''} onChange={e => setEditingService({...editingService, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceNameEn[lang]}</label>
                            <input type="text" required value={editingService?.titleEn || ''} onChange={e => setEditingService({...editingService, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceDescAr[lang]}</label>
                        <textarea rows={3} required value={editingService?.descriptionAr || ''} onChange={e => setEditingService({...editingService, descriptionAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceDescEn[lang]}</label>
                        <textarea rows={3} required value={editingService?.descriptionEn || ''} onChange={e => setEditingService({...editingService, descriptionEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.price[lang]}</label>
                            <input type="number" required value={editingService?.price || ''} onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.selectCategory[lang]}</label>
                            <select value={editingService?.category || ''} onChange={e => setEditingService({...editingService, category: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white">
                                {categories.map(c => <option key={c.id} value={c.id}>{lang === 'en' ? c.titleEn : c.titleAr}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.discountPrice[lang]}</label>
                            <input type="number" value={editingService?.discountPrice || ''} onChange={e => setEditingService({...editingService, discountPrice: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.discountStart[lang]}</label>
                            <input type="date" value={editingService?.discountStartDate || ''} onChange={e => setEditingService({...editingService, discountStartDate: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.discountEnd[lang]}</label>
                            <input type="date" value={editingService?.discountEndDate || ''} onChange={e => setEditingService({...editingService, discountEndDate: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.featureIcon[lang]}</label>
                        <div className="flex gap-2 items-center">
                            <input type="text" value={editingService?.icon || ''} onChange={e => setEditingService({...editingService, icon: e.target.value})} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded"><Icon name={editingService?.icon || 'HelpCircle'} /></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="isPopular" checked={editingService?.isPopular || false} onChange={e => setEditingService({...editingService, isPopular: e.target.checked})} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                        <label htmlFor="isPopular" className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.isFeatured[lang]}</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 mt-4">
                        <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderCourseModal = () => {
    if (!isCourseModalOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingCourse?.id ? t.editCourse[lang] : t.addCourse[lang]}</h3>
                    <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                        <Icon name="X" size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="courseForm" onSubmit={handleSaveCourse} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">{t.overview[lang]}</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.courseNameAr[lang]}</label>
                                    <input type="text" required value={editingCourse?.titleAr || ''} onChange={e => setEditingCourse({...editingCourse, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.courseNameEn[lang]}</label>
                                    <input type="text" required value={editingCourse?.titleEn || ''} onChange={e => setEditingCourse({...editingCourse, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceDescAr[lang]}</label>
                                    <textarea rows={3} required value={editingCourse?.descriptionAr || ''} onChange={e => setEditingCourse({...editingCourse, descriptionAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.serviceDescEn[lang]}</label>
                                    <textarea rows={3} required value={editingCourse?.descriptionEn || ''} onChange={e => setEditingCourse({...editingCourse, descriptionEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.price[lang]}</label>
                                        <input type="number" required value={editingCourse?.price || ''} onChange={e => setEditingCourse({...editingCourse, price: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.selectCategory[lang]}</label>
                                        <select value={editingCourse?.category || ''} onChange={e => setEditingCourse({...editingCourse, category: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white">
                                            {courseCategories.map(c => <option key={c.id} value={c.id}>{lang === 'en' ? c.titleEn : c.titleAr}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.thumbnailUrl[lang]}</label>
                                    <input type="text" value={editingCourse?.thumbnailUrl || ''} onChange={e => setEditingCourse({...editingCourse, thumbnailUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.introVideoUrl[lang]}</label>
                                    <input type="text" value={editingCourse?.introVideoUrl || ''} onChange={e => setEditingCourse({...editingCourse, introVideoUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.duration[lang]}</label>
                                    <input type="text" value={editingCourse?.duration || ''} onChange={e => setEditingCourse({...editingCourse, duration: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" placeholder="e.g. 10h 30m" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">{t.courseContent[lang]}</h4>
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                                    <h5 className="font-bold text-sm mb-3 text-gray-700 dark:text-slate-300">{t.addLesson[lang]}</h5>
                                    <div className="space-y-2">
                                        <input type="text" placeholder={t.lessonTitle[lang]} value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none dark:text-white" />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder={t.lessonDuration[lang]} value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: e.target.value})} className="w-1/3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none dark:text-white" />
                                            <input type="text" placeholder={t.videoUrl[lang]} value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none dark:text-white" dir="ltr" />
                                        </div>
                                        <button type="button" onClick={handleAddLesson} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm transition-colors">{t.addLesson[lang]}</button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {editingCourse?.lessons?.length === 0 && <p className="text-center text-gray-400 text-sm py-4">{t.noLessons[lang]}</p>}
                                    {editingCourse?.lessons?.map((lesson, idx) => (
                                        <div key={lesson.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{idx+1}. {lesson.title}</p>
                                                <p className="text-xs text-gray-500">{lesson.duration}</p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveLesson(lesson.id)} className="text-red-500 hover:text-red-700 p-1"><Icon name="Trash2" size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
                    <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                    <button type="submit" form="courseForm" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                </div>
            </div>
        </div>
    );
  };

  const renderProjectModal = () => {
      if (!isProjectModalOpen) return null;
      return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingProject?.id ? 'Edit Project' : 'Add Project'}</h3>
                      <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                          <Icon name="X" size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                      <form id="projectForm" onSubmit={handleSaveProject} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title (Ar)</label>
                                  <input type="text" required value={editingProject?.titleAr || ''} onChange={e => setEditingProject({...editingProject, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title (En)</label>
                                  <input type="text" required value={editingProject?.titleEn || ''} onChange={e => setEditingProject({...editingProject, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Desc (Ar)</label>
                                  <textarea rows={3} required value={editingProject?.descriptionAr || ''} onChange={e => setEditingProject({...editingProject, descriptionAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Desc (En)</label>
                                  <textarea rows={3} required value={editingProject?.descriptionEn || ''} onChange={e => setEditingProject({...editingProject, descriptionEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.price[lang]}</label>
                                  <input type="number" required value={editingProject?.price || ''} onChange={e => setEditingProject({...editingProject, price: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.selectCategory[lang]}</label>
                                  <select value={editingProject?.category || ''} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white">
                                      {projectCategories.map(c => <option key={c.id} value={c.id}>{lang === 'en' ? c.titleEn : c.titleAr}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tech Stack</label>
                                  <div className="flex gap-2 mb-2">
                                      <input type="text" value={projectTechInput} onChange={e => setProjectTechInput(e.target.value)} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none dark:text-white" placeholder="e.g. React" dir="ltr" />
                                      <button type="button" onClick={handleAddProjectTech} className="px-3 bg-blue-600 text-white rounded-lg font-bold">+</button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {editingProject?.techStack?.map((tech, i) => (
                                          <span key={i} className="bg-slate-700 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                              {tech} <button type="button" onClick={() => handleRemoveProjectTech(i)} className="hover:text-red-400">×</button>
                                          </span>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Features</label>
                                  <div className="flex gap-2 mb-2">
                                      <input type="text" value={projectFeatureInput} onChange={e => setProjectFeatureInput(e.target.value)} className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none dark:text-white" placeholder="Feature..." />
                                      <button type="button" onClick={handleAddProjectFeature} className="px-3 bg-blue-600 text-white rounded-lg font-bold">+</button>
                                  </div>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {editingProject?.features?.map((f, i) => (
                                          <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-2 rounded text-xs text-gray-700 dark:text-slate-300">
                                              <span>{f}</span>
                                              <button type="button" onClick={() => handleRemoveProjectFeature(i)} className="text-red-500 hover:text-red-700">×</button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.thumbnailUrl[lang]}</label>
                              <input type="text" value={editingProject?.thumbnailUrl || ''} onChange={e => setEditingProject({...editingProject, thumbnailUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                          </div>
                      </form>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
                      <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                      <button type="submit" form="projectForm" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                  </div>
              </div>
          </div>
      );
  };

  const renderBlogModal = () => {
      if (!isBlogModalOpen) return null;
      return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingBlogPost?.id ? 'Edit Article' : 'Add Article'}</h3>
                      <button onClick={() => setIsBlogModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                          <Icon name="X" size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                      <form id="blogForm" onSubmit={handleSaveBlog} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.postTitleEn[lang]}</label>
                                  <input type="text" required value={editingBlogPost?.titleEn || ''} onChange={e => setEditingBlogPost({...editingBlogPost, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.postTitleAr[lang]}</label>
                                  <input type="text" required value={editingBlogPost?.titleAr || ''} onChange={e => setEditingBlogPost({...editingBlogPost, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Author</label>
                                  <input type="text" value={editingBlogPost?.authorName || ''} onChange={e => setEditingBlogPost({...editingBlogPost, authorName: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
                                  <input type="date" value={editingBlogPost?.publishDate || ''} onChange={e => setEditingBlogPost({...editingBlogPost, publishDate: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
                                  <select value={editingBlogPost?.categoryId || ''} onChange={e => setEditingBlogPost({...editingBlogPost, categoryId: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white">
                                      {blogCategories.map(c => <option key={c.id} value={c.id}>{lang === 'en' ? c.titleEn : c.titleAr}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                              <input type="text" value={editingBlogPost?.coverImageUrl || ''} onChange={e => setEditingBlogPost({...editingBlogPost, coverImageUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Content (En)</label>
                                  <textarea rows={8} value={editingBlogPost?.contentEn || ''} onChange={e => setEditingBlogPost({...editingBlogPost, contentEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Content (Ar)</label>
                                  <textarea rows={8} value={editingBlogPost?.contentAr || ''} onChange={e => setEditingBlogPost({...editingBlogPost, contentAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                          </div>
                      </form>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
                      <button type="button" onClick={() => setIsBlogModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                      <button type="submit" form="blogForm" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                  </div>
              </div>
          </div>
      );
  };

  const renderInfoPageModal = () => {
      if (!isInfoPageModalOpen) return null;
      return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl border border-gray-100 dark:border-slate-700 shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{editingInfoPage?.id ? t.editPage[lang] : t.addPage[lang]}</h3>
                      <button onClick={() => setIsInfoPageModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
                          <Icon name="X" size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                      <form id="pageForm" onSubmit={handleSaveInfoPage} className="space-y-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.slug[lang]}</label>
                              <input type="text" required value={editingInfoPage?.slug || ''} onChange={e => setEditingInfoPage({...editingInfoPage, slug: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" disabled={editingInfoPage?.isSystem} />
                              {editingInfoPage?.isSystem && <p className="text-xs text-amber-500 mt-1">{t.systemPageMsg[lang]}</p>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.pageTitleEn[lang]}</label>
                                  <input type="text" required value={editingInfoPage?.titleEn || ''} onChange={e => setEditingInfoPage({...editingInfoPage, titleEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.pageTitleAr[lang]}</label>
                                  <input type="text" required value={editingInfoPage?.titleAr || ''} onChange={e => setEditingInfoPage({...editingInfoPage, titleAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.pageContentEn[lang]}</label>
                                  <textarea rows={12} value={editingInfoPage?.contentEn || ''} onChange={e => setEditingInfoPage({...editingInfoPage, contentEn: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white text-left" dir="ltr" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.pageContentAr[lang]}</label>
                                  <textarea rows={12} value={editingInfoPage?.contentAr || ''} onChange={e => setEditingInfoPage({...editingInfoPage, contentAr: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                              </div>
                          </div>
                      </form>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800">
                      <button type="button" onClick={() => setIsInfoPageModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                      <button type="submit" form="pageForm" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                  </div>
              </div>
          </div>
      );
  };

  const renderReviewReplyModal = () => {
      if (!replyModalOpen || !currentReviewForReply) return null;

      return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-xl w-full max-w-lg overflow-hidden border border-slate-700 shadow-2xl animate-scale-in">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                      <h3 className="font-bold text-white text-lg">{t.adminReply[lang]}</h3>
                      <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                          <Icon name="X" size={20} />
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="mb-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">{currentReviewForReply.userName}:</p>
                          <p className="text-sm text-white italic">"{currentReviewForReply.content}"</p>
                      </div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">{t.writeReply[lang]}</label>
                      <textarea 
                          rows={4} 
                          value={replyText} 
                          onChange={e => setReplyText(e.target.value)} 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-4"
                          placeholder="..."
                      />
                      <div className="flex justify-end gap-3">
                          <button onClick={() => setReplyModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">{t.cancel[lang]}</button>
                          <button onClick={submitReply} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">{t.save[lang]}</button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
       {/* Sidebar Navigation */}
       <div className="w-full md:w-64 flex-shrink-0">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden sticky top-24">
               <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                   <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <Icon name="LayoutDashboard" size={20} />
                       {t.dashboard[lang]}
                   </h2>
               </div>
               <nav className="p-2 space-y-1 text-sm overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar">
                   <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="LayoutDashboard" size={18} /> {t.overview[lang]}
                   </button>
                   <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="ShoppingBag" size={18} /> {t.recentOrders[lang]}
                   </button>
                   <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="MessageSquare" size={18} /> {t.manageReviews[lang]}
                   </button>
                   
                   <div className="my-2 border-t border-gray-100 dark:border-slate-700 mx-2"></div>
                   
                   <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Layers" size={18} /> {t.categories[lang]}
                   </button>
                   <button onClick={() => setActiveTab('services')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Briefcase" size={18} /> {t.manageServices[lang]}
                   </button>

                   <div className="my-2 border-t border-gray-100 dark:border-slate-700 mx-2"></div>

                   <button onClick={() => setActiveTab('courseCategories')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'courseCategories' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="BookOpen" size={18} /> {t.courseCategories[lang]}
                   </button>
                   <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'courses' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Video" size={18} /> {t.manageCourses[lang]}
                   </button>

                   <div className="my-2 border-t border-gray-100 dark:border-slate-700 mx-2"></div>

                   <button onClick={() => setActiveTab('projectCategories')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'projectCategories' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Tag" size={18} /> {lang === 'en' ? 'Project Categories' : 'تصنيفات المشاريع'}
                   </button>
                   <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Code" size={18} /> {lang === 'en' ? 'Manage Projects' : 'إدارة المشاريع'}
                   </button>

                   <div className="my-2 border-t border-gray-100 dark:border-slate-700 mx-2"></div>

                   <button onClick={() => setActiveTab('blogCategories')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'blogCategories' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Layers" size={18} /> {t.blogCategories[lang]}
                   </button>
                   <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'blog' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="FileText" size={18} /> {t.manageBlog[lang]}
                   </button>

                   <div className="my-2 border-t border-gray-100 dark:border-slate-700 mx-2"></div>

                   <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'pages' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="FileText" size={18} /> {t.infoPages[lang]}
                   </button>
                   <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Settings" size={18} /> {t.settings[lang]}
                   </button>
                   <button onClick={() => setActiveTab('extraSettings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'extraSettings' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                       <Icon name="Briefcase" size={18} /> {lang === 'en' ? 'Extra Settings' : 'إعدادات إضافية'}
                   </button>
               </nav>
           </div>
       </div>

       {/* Main Area */}
       <div className="flex-1">
           {activeTab === 'overview' && renderOverview()}
           
           {/* Orders */}
           {activeTab === 'orders' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">{t.recentOrders[lang]}</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium text-center">#</th>
                                <th className="px-6 py-3 font-medium">{t.customer[lang]}</th>
                                <th className="px-6 py-3 font-medium">{t.service[lang]}</th>
                                <th className="px-6 py-3 font-medium">{t.date[lang]}</th>
                                <th className="px-6 py-3 font-medium">{t.amount[lang]}</th>
                                <th className="px-6 py-3 font-medium text-center">{t.status[lang]}</th>
                                <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {orders.map((order, idx) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4 text-center">{idx + 1}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.customerName}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{order.serviceId}</td>
                                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 font-bold dir-ltr">{order.amount.toLocaleString()} {currency === 'SAR' ? t.sar[lang] : t.usd[lang]}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {t[order.status][lang]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <button onClick={() => handleGenerateInvoice(order)} className="text-gray-400 hover:text-teal-600"><Icon name="FileText" size={18} /></button>
                                        <button className="text-red-400 hover:text-red-600"><Icon name="X" size={18} /></button>
                                        <button className="text-green-400 hover:text-green-600"><Icon name="Check" size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
           )}

           {/* Reviews */}
           {activeTab === 'reviews' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">{t.manageReviews[lang]}</h3>
                   <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right">
                            <thead className="bg-slate-900 text-slate-400 rounded-t-lg">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                                    <th className="px-6 py-3 font-medium text-center">{t.status[lang]}</th>
                                    <th className="px-6 py-3 font-medium text-center">{t.reviewContent[lang]}</th>
                                    <th className="px-6 py-3 font-medium text-center">{t.rating[lang]}</th>
                                    <th className="px-6 py-3 font-medium text-center">اسم الخدمة/الدورة</th>
                                    <th className="px-6 py-3 font-medium text-center">{t.customer[lang]}</th>
                                    <th className="px-6 py-3 font-medium text-center">{t.date[lang]}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-slate-800/50">
                                {allReviews.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t.noResults[lang]}</td></tr>
                                ) : (
                                    allReviews.map((review, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-4 flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => openReplyModal(review)} 
                                                    className="w-8 h-8 rounded bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200" 
                                                    title={t.reply[lang]}
                                                >
                                                    <Icon name="MessageSquare" size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleReviewAction(review.sourceType, review.sourceId, review.id, 'reject')}
                                                    className="w-8 h-8 rounded bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors border border-gray-200"
                                                    title={t.reject[lang]}
                                                >
                                                    <Icon name="XCircle" size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleReviewAction(review.sourceType, review.sourceId, review.id, 'approve')}
                                                    className="w-8 h-8 rounded bg-white text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors border border-gray-200"
                                                    title={t.approve[lang]}
                                                >
                                                    <Icon name="Check" size={16} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                                                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {review.status === 'approved' ? t.approved[lang] : 
                                                     review.status === 'rejected' ? t.rejected[lang] : 
                                                     t.awaitingApproval[lang]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-white text-sm line-clamp-1">{review.comment}</span>
                                                    {review.adminReply && <span className="text-xs text-blue-400 mt-1">{t.adminReply[lang]}: {review.adminReply}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center text-amber-400 gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Icon key={i} name="Star" size={14} className={i < review.rating ? "fill-amber-400" : "text-gray-600"} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-white text-sm">
                                                <div className="flex flex-col">
                                                    <span>{review.itemName}</span>
                                                    <span className="text-xs text-gray-500">{review.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-white font-bold">{review.userName}</td>
                                            <td className="px-6 py-4 text-center text-gray-400 text-sm">{review.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                   </div>
               </div>
           )}

           {/* Categories Management */}
           {activeTab === 'categories' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   {renderHeader(t.categories[lang], t.addCategory[lang], () => handleOpenCategoryModal('service'))}
                   {renderCategoryTable(categories, 'service')}
               </div>
           )}
           {activeTab === 'courseCategories' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   {renderHeader(t.courseCategories[lang], t.addCategory[lang], () => handleOpenCategoryModal('course'))}
                   {renderCategoryTable(courseCategories, 'course')}
               </div>
           )}
           {activeTab === 'projectCategories' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   {renderHeader(lang === 'en' ? 'Project Categories' : 'تصنيفات المشاريع', t.addCategory[lang], () => handleOpenCategoryModal('project'))}
                   {renderCategoryTable(projectCategories, 'project')}
               </div>
           )}
           {activeTab === 'blogCategories' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   {renderHeader(t.blogCategories[lang], t.addCategory[lang], () => handleOpenCategoryModal('blog'))}
                   {renderCategoryTable(blogCategories, 'blog')}
               </div>
           )}

           {/* Services */}
           {activeTab === 'services' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
               {renderHeader(t.manageServices[lang], t.addService[lang], () => handleOpenServiceModal())}
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right">
                       <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                           <tr>
                               <th className="px-6 py-3 font-medium text-center">#</th>
                               <th className="px-6 py-3 font-medium">{t.serviceNameEn[lang]}</th>
                               <th className="px-6 py-3 font-medium">{t.serviceNameAr[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.price[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{lang === 'en' ? 'Category' : 'القسم'}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {services.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="px-6 py-4 text-center">{idx + 1}</td>
                                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                                   <td className="px-6 py-4 text-gray-900 dark:text-white">{item.titleAr}</td>
                                   <td className="px-6 py-4 text-center font-bold">{item.price.toLocaleString()}</td>
                                   <td className="px-6 py-4 text-center">{categories.find(c => c.id === item.category)?.titleEn}</td>
                                   <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-3">
                                           <button onClick={() => handleDeleteItem('service', item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>
                                           <button onClick={() => handleOpenServiceModal(item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
             </div>
           )}

           {/* Courses */}
           {activeTab === 'courses' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
               {renderHeader(t.manageCourses[lang], t.addCourse[lang], () => handleOpenCourseModal())}
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right">
                       <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                           <tr>
                               <th className="px-6 py-3 font-medium text-center">#</th>
                               <th className="px-6 py-3 font-medium">{t.courseNameEn[lang]}</th>
                               <th className="px-6 py-3 font-medium">{t.courseNameAr[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.price[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.duration[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {courses.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="px-6 py-4 text-center">{idx + 1}</td>
                                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                                   <td className="px-6 py-4 text-gray-900 dark:text-white">{item.titleAr}</td>
                                   <td className="px-6 py-4 text-center font-bold">{item.price.toLocaleString()}</td>
                                   <td className="px-6 py-4 text-center">{item.duration}</td>
                                   <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-3">
                                           <button onClick={() => handleDeleteItem('course', item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>
                                           <button onClick={() => handleOpenCourseModal(item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
             </div>
           )}

           {/* Projects */}
           {activeTab === 'projects' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
               {renderHeader(lang === 'en' ? 'Manage Projects' : 'إدارة المشاريع', t.addCategory[lang], () => handleOpenProjectModal())}
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right">
                       <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                           <tr>
                               <th className="px-6 py-3 font-medium text-center">#</th>
                               <th className="px-6 py-3 font-medium">المنتج (En)</th>
                               <th className="px-6 py-3 font-medium">المنتج (Ar)</th>
                               <th className="px-6 py-3 font-medium text-center">{t.price[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">التقنيات المستخدمة</th>
                               <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {projects.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="px-6 py-4 text-center">{idx + 1}</td>
                                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                                   <td className="px-6 py-4 text-gray-900 dark:text-white">{item.titleAr}</td>
                                   <td className="px-6 py-4 text-center font-bold">{item.price.toLocaleString()}</td>
                                   <td className="px-6 py-4">
                                       <div className="flex flex-wrap gap-1 justify-center">
                                           {item.techStack.map(ts => <span key={ts} className="text-xs bg-slate-700 text-white px-2 py-0.5 rounded border border-slate-600">{ts}</span>)}
                                       </div>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-3">
                                           <button onClick={() => handleDeleteItem('project', item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>
                                           <button onClick={() => handleOpenProjectModal(item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
             </div>
           )}

           {/* Blog */}
           {activeTab === 'blog' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
               {renderHeader(t.manageBlog[lang], t.addPost[lang], () => handleOpenBlogModal())}
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right">
                       <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                           <tr>
                               <th className="px-6 py-3 font-medium text-center">#</th>
                               <th className="px-6 py-3 font-medium">عنوان المقال (إنجليزي)</th>
                               <th className="px-6 py-3 font-medium">{t.date[lang]}</th>
                               <th className="px-6 py-3 font-medium">Author</th>
                               <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {blogPosts.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="px-6 py-4 text-center">{idx + 1}</td>
                                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                                   <td className="px-6 py-4 text-gray-500">{item.publishDate}</td>
                                   <td className="px-6 py-4 text-gray-300">{item.authorName}</td>
                                   <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-3">
                                           <button onClick={() => handleDeleteItem('blog', item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>
                                           <button onClick={() => handleOpenBlogModal(item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
             </div>
           )}

           {/* Pages */}
           {activeTab === 'pages' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
               {renderHeader(t.infoPages[lang], t.addPage[lang], () => handleOpenInfoPageModal())}
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right">
                       <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                           <tr>
                               <th className="px-6 py-3 font-medium text-center">#</th>
                               <th className="px-6 py-3 font-medium">عنوان الصفحة (إنجليزي)</th>
                               <th className="px-6 py-3 font-medium">رابط الصفحة (Slug)</th>
                               <th className="px-6 py-3 font-medium text-center">{t.status[lang]}</th>
                               <th className="px-6 py-3 font-medium text-center">{t.actions[lang]}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {infoPages.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                   <td className="px-6 py-4 text-center">{idx + 1}</td>
                                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.titleEn}</td>
                                   <td className="px-6 py-4 text-gray-500">{item.slug}/</td>
                                   <td className="px-6 py-4 text-center">
                                       <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold">Active</span>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-3">
                                           <button onClick={() => handleOpenInfoPageModal(item)} className="text-blue-500 hover:text-blue-700"><Icon name="Edit" size={18} /></button>
                                           {!item.isSystem && <button onClick={() => handleDeleteItem('page', item.id)} className="text-red-500 hover:text-red-700"><Icon name="Trash2" size={18} /></button>}
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
             </div>
           )}

           {/* Settings */}
           {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-700">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.settings[lang]}</h3>
                     <button 
                        onClick={handleSaveSettings}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                        {isSaved ? <Icon name="Check" size={18} /> : <Icon name="Save" size={18} />}
                        {isSaved ? t.settingsSaved[lang] : t.save[lang]}
                    </button>
                  </div>

                  {/* Identity Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">هوية الموقع</h4>
                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">اسم الموقع (En)</label>
                            <input type="text" value={settingsForm.appNameEn} onChange={e => setSettingsForm({...settingsForm, appNameEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">اسم الموقع (Ar)</label>
                            <input type="text" value={settingsForm.appNameAr} onChange={e => setSettingsForm({...settingsForm, appNameAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                     </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">رابط الشعار</label>
                        <input type="text" value={settingsForm.logoUrl || ''} onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">وصف الفوتر (En)</label>
                            <textarea rows={2} value={settingsForm.descriptionEn} onChange={e => setSettingsForm({...settingsForm, descriptionEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left resize-none" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">وصف الفوتر (Ar)</label>
                            <textarea rows={2} value={settingsForm.descriptionAr} onChange={e => setSettingsForm({...settingsForm, descriptionAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right resize-none" />
                        </div>
                     </div>
                  </div>

                  {/* Location Data */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">بيانات الموقع</h4>
                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">المدينة (AR)</label>
                            <input type="text" value={settingsForm.cityAr || ''} onChange={e => setSettingsForm({...settingsForm, cityAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">المدينة (EN)</label>
                            <input type="text" value={settingsForm.cityEn || ''} onChange={e => setSettingsForm({...settingsForm, cityEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">الدولة (AR)</label>
                            <input type="text" value={settingsForm.countryAr || ''} onChange={e => setSettingsForm({...settingsForm, countryAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">الدولة (EN)</label>
                            <input type="text" value={settingsForm.countryEn || ''} onChange={e => setSettingsForm({...settingsForm, countryEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                  </div>

                  {/* Contact & Social */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">معلومات التواصل</h4>
                     <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">البريد الإلكتروني</label>
                            <input type="email" value={settingsForm.contactEmail} onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">رقم الواتساب</label>
                            <input type="text" value={settingsForm.whatsappNumber} onChange={e => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                     
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">وسائل التواصل الاجتماعي</h4>
                     <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">Facebook</label>
                            <input type="text" placeholder=".../https://facebook.com" value={settingsForm.facebookUrl || ''} onChange={e => setSettingsForm({...settingsForm, facebookUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">Twitter/X</label>
                            <input type="text" placeholder=".../https://twitter.com" value={settingsForm.twitterUrl || ''} onChange={e => setSettingsForm({...settingsForm, twitterUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">Instagram</label>
                            <input type="text" placeholder=".../https://instagram.com" value={settingsForm.instagramUrl || ''} onChange={e => setSettingsForm({...settingsForm, instagramUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                  </div>

                  {/* Hero Banner */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">إعدادات البنر الرئيسي</h4>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">رابط صورة البنر</label>
                        <input type="text" value={settingsForm.heroImageUrl || ''} onChange={e => setSettingsForm({...settingsForm, heroImageUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" placeholder="https://..." />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">عنوان البنر (AR)</label>
                            <input type="text" value={settingsForm.heroTitleAr || ''} onChange={e => setSettingsForm({...settingsForm, heroTitleAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">عنوان البنر (EN)</label>
                            <input type="text" value={settingsForm.heroTitleEn || ''} onChange={e => setSettingsForm({...settingsForm, heroTitleEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">وصف البنر (AR)</label>
                        <textarea rows={2} value={settingsForm.heroSubtitleAr || ''} onChange={e => setSettingsForm({...settingsForm, heroSubtitleAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right resize-none mb-4" />
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">وصف البنر (EN)</label>
                        <textarea rows={2} value={settingsForm.heroSubtitleEn || ''} onChange={e => setSettingsForm({...settingsForm, heroSubtitleEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left resize-none" dir="ltr" />
                     </div>

                     <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">نص الزر الرئيسي (AR)</label>
                            <input type="text" value={settingsForm.heroBtn1TextAr || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn1TextAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">نص الزر الرئيسي (EN)</label>
                            <input type="text" value={settingsForm.heroBtn1TextEn || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn1TextEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">رابط/وجهة الزر 1</label>
                        <input type="text" placeholder="مثال: services, courses, أو consultant" value={settingsForm.heroBtn1Link || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn1Link: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                     </div>

                     <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">نص الزر الثانوي (AR)</label>
                            <input type="text" value={settingsForm.heroBtn2TextAr || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn2TextAr: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-right">نص الزر الثانوي (EN)</label>
                            <input type="text" value={settingsForm.heroBtn2TextEn || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn2TextEn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-left" dir="ltr" />
                        </div>
                     </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-right">رابط/وجهة الزر 2</label>
                        <input type="text" placeholder="مثال: services, courses, أو consultant" value={settingsForm.heroBtn2Link || ''} onChange={e => setSettingsForm({...settingsForm, heroBtn2Link: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none text-right" />
                     </div>
                  </div>

                  {/* Modules Visibility */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                     <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-slate-700 pb-2">تفعيل الأقسام</h4>
                     <div className="grid grid-cols-1 gap-4">
                         
                         <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-teal-900/30 text-teal-500 rounded-lg"><Icon name="Briefcase" size={20} /></div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-white">تفعيل قسم الخدمات</span>
                                     <span className="text-xs text-slate-400">مفعل - يظهر في الموقع</span>
                                 </div>
                             </div>
                             <div className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={settingsForm.enableServices} onChange={() => setSettingsForm({...settingsForm, enableServices: !settingsForm.enableServices})} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                             </div>
                         </label>

                         <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-orange-900/30 text-orange-500 rounded-lg"><Icon name="Video" size={20} /></div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-white">تفعيل قسم الدورات</span>
                                     <span className="text-xs text-slate-400">مفعل - يظهر في الموقع</span>
                                 </div>
                             </div>
                             <div className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={settingsForm.enableCourses} onChange={() => setSettingsForm({...settingsForm, enableCourses: !settingsForm.enableCourses})} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                             </div>
                         </label>

                         <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-purple-900/30 text-purple-500 rounded-lg"><Icon name="ShoppingBag" size={20} /></div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-white">تفعيل قسم المشاريع الجاهزة</span>
                                     <span className="text-xs text-slate-400">مفعل - يظهر في الموقع</span>
                                 </div>
                             </div>
                             <div className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={settingsForm.enableProjects} onChange={() => setSettingsForm({...settingsForm, enableProjects: !settingsForm.enableProjects})} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                             </div>
                         </label>

                         <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-orange-900/30 text-orange-500 rounded-lg"><Icon name="FileText" size={20} /></div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-white">تفعيل قسم المدونة</span>
                                     <span className="text-xs text-slate-400">مفعل - يظهر في الموقع</span>
                                 </div>
                             </div>
                             <div className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={settingsForm.enableBlog} onChange={() => setSettingsForm({...settingsForm, enableBlog: !settingsForm.enableBlog})} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                             </div>
                         </label>

                         <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-900/30 text-blue-500 rounded-lg"><Icon name="Sparkles" size={20} /></div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-white">تفعيل مستشار المتمم الآلي</span>
                                     <span className="text-xs text-slate-400">مفعل - يظهر في الموقع</span>
                                 </div>
                             </div>
                             <div className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={settingsForm.enableAIConsultant} onChange={() => setSettingsForm({...settingsForm, enableAIConsultant: !settingsForm.enableAIConsultant})} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </div>
                         </label>

                     </div>
                  </div>
              </div>
           )}

           {/* Extra Settings */}
           {activeTab === 'extraSettings' && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-fade-in">
                   {/* ... extra settings content ... */}
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-slate-700">{lang === 'en' ? 'Extra Settings' : 'إعدادات إضافية'}</h3>
                   
                   <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">{t.languages[lang]}</h4>
                   <div className="flex flex-col gap-4 mb-6 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Icon name="Globe" size={20} className="text-blue-500" />
                                <span className="font-bold">{t.enableAr[lang]}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settingsForm.enableAr} onChange={() => setSettingsForm({...settingsForm, enableAr: !settingsForm.enableAr})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                        <div className="h-px bg-gray-200 dark:bg-slate-700"></div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Icon name="Globe" size={20} className="text-purple-500" />
                                <span className="font-bold">{t.enableEn[lang]}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settingsForm.enableEn} onChange={() => setSettingsForm({...settingsForm, enableEn: !settingsForm.enableEn})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                            </div>
                        </label>
                   </div>

                   <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">{t.currencies[lang]}</h4>
                   <div className="flex flex-col gap-4 mb-6 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700"><Icon name="Briefcase" size={18} /></div>
                                <span className="font-bold">{t.enableSAR[lang]}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settingsForm.enableSAR} onChange={() => handleToggleCurrency('SAR')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </div>
                        </label>
                        <div className="h-px bg-gray-200 dark:bg-slate-700"></div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700"><Icon name="Briefcase" size={18} /></div>
                                <span className="font-bold">{t.enableUSD[lang]}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settingsForm.enableUSD} onChange={() => handleToggleCurrency('USD')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </div>
                        </label>
                   </div>

                   <button 
                      onClick={handleSaveSettings}
                      className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                   >
                      {isSaved ? <Icon name="Check" size={18} /> : <Icon name="Save" size={18} />}
                      {isSaved ? t.settingsSaved[lang] : t.save[lang]}
                   </button>
               </div>
           )}
       </div>

       {/* Modals */}
       <InvoiceModal 
          invoice={selectedInvoice}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          siteSettings={siteSettings}
          lang={lang}
          currency={currency}
       />
       {renderCategoryModal()}
       {renderServiceModal()}
       {renderCourseModal()}
       {renderProjectModal()}
       {renderBlogModal()}
       {renderInfoPageModal()}
       {renderReviewReplyModal()}
    </div>
  );
};

export default AdminDashboard;