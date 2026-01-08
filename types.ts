
export type Language = 'en' | 'ar';
export type Currency = 'SAR' | 'USD';

// Relaxed type to allow dynamic categories
export type CategoryId = string;

export interface SiteSettings {
  appNameEn: string;
  appNameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  logoUrl: string;
  heroImageUrl?: string; // New field for Hero Banner Image
  contactEmail: string;
  whatsappNumber: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  // Location Fields
  cityAr?: string;
  cityEn?: string;
  countryAr?: string;
  countryEn?: string;
  // Hero Banner Fields
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  // Hero Buttons
  heroBtn1TextAr?: string;
  heroBtn1TextEn?: string;
  heroBtn1Link?: string; 
  heroBtn2TextAr?: string;
  heroBtn2TextEn?: string;
  heroBtn2Link?: string;
  // Feature Toggles
  enableServices: boolean;
  enableCourses: boolean;
  enableProjects: boolean;
  enableBlog: boolean; // New Toggle
  enableAIConsultant: boolean;
  // Additional Settings (Language & Currency)
  enableAr: boolean;
  enableEn: boolean;
  enableSAR: boolean;
  enableUSD: boolean;
}

export interface InfoPage {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  slug: string; 
  isSystem: boolean; 
}

export interface ServiceCategory {
  id: CategoryId;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  order: number; 
  color: string; 
}

// Blog Types
export interface BlogCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  color: string;
}

export interface BlogPost {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  excerptEn: string;
  excerptAr: string;
  coverImageUrl: string;
  authorName: string;
  publishDate: string;
  categoryId: string;
  readTime: string; // e.g., "5 min read"
}

export interface Review {
  id: string;
  userName: string;
  rating: number; 
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected'; 
  adminReply?: string; 
}

export interface Service {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string; 
  category: CategoryId;
  price: number;
  purchaseCount: number;
  isPopular?: boolean;
  rating: number;
  reviews: Review[];
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  seoKeywords?: string[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface CourseFeature {
  id: string;
  icon: string; 
  text: string;
}

export interface Course {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  thumbnailColor: string; 
  thumbnailUrl?: string; 
  introVideoUrl?: string; 
  duration: string; 
  lessons: CourseLesson[]; 
  price: number;
  category: string; 
  purchaseCount: number;
  isPopular?: boolean;
  rating: number;
  reviews: Review[];
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  learningPoints: string[];
  features: CourseFeature[];
}

// New Interface for Ready-made Projects
export interface Project {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  thumbnailUrl?: string; // Preview Image
  demoUrl?: string; // Live Preview Link
  downloadUrl?: string; // The .txt file link or zip link
  techStack: string[]; // e.g. ['React', 'Node', 'Tailwind']
  category: string;
  purchaseCount: number;
  isPopular?: boolean;
  rating: number;
  reviews: Review[];
  features: string[]; // List of features
}

// --- CART TYPES ---
export interface CartItem {
  id: string;
  type: 'service' | 'course' | 'project';
  titleEn: string;
  titleAr: string;
  price: number; // The actual price at time of adding (considering discount)
  originalPrice?: number;
  thumbnailUrl?: string; // or icon name for services
  icon?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Service | Course | Project, type: 'service' | 'course' | 'project') => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalAmount: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string; 
  customerEmail?: string; 
  notes?: string; 
  serviceId: string; // Or comma separated IDs/Titles for multiple items
  // Updated statuses including 'awaiting_payment'
  status: 'pending' | 'awaiting_payment' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: number;
  invoiceId?: string; // Link to generated invoice
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'paid'; // Usually invoices generated here are paid/completed
  itemsDescription: string;
  pdfUrl?: string; // Mock URL for download
}

export interface AIResponse {
  businessName: string;
  slogan: string;
  strategySteps: string[];
}

export interface RecommendationItem {
  itemId: string;
  type: 'service' | 'course' | 'project';
  reason: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}
