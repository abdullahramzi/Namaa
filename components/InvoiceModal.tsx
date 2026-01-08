
import React, { useRef, useState } from 'react';
import { Invoice, Language, Currency, SiteSettings } from '../types';
import { TRANSLATIONS, EXCHANGE_RATE } from '../constants';
import Icon from './Icon';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  lang: Language;
  currency: Currency;
}

const InvoiceModal: React.FC<Props> = ({ invoice, isOpen, onClose, siteSettings, lang, currency }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';

  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsGenerating(true);
    const element = contentRef.current;
    
    // Check if html2pdf is loaded
    if (typeof (window as any).html2pdf === 'undefined') {
        alert("PDF generator library not loaded. Please try again later or use browser print.");
        window.print();
        setIsGenerating(false);
        return;
    }

    // Wait for fonts to be loaded to ensure Arabic renders correctly
    await document.fonts.ready;

    // Configuration for html2pdf
    const opt = {
      margin:       [10, 10, 10, 10], // top, left, bottom, right
      filename:     `invoice-${invoice.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        // CRITICAL: Do NOT set letterRendering: true for Arabic. 
        // It splits text into individual letters, breaking ligatures.
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await (window as any).html2pdf().set(opt).from(element).save();
        setIsGenerating(false);
    } catch (err) {
        console.error("PDF generation failed:", err);
        setIsGenerating(false);
        alert("Could not generate PDF automatically. Opening print dialog instead.");
        window.print();
    }
  };

  // Safe translation helper
  const getTranslation = (key: string) => {
    if (t[key] && t[key][lang]) {
        return t[key][lang];
    }
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  const convert = (amount: number) => {
    return currency === 'SAR' ? amount * EXCHANGE_RATE : amount;
  };
  
  const formatMoney = (amount: number) => {
    const val = convert(amount);
    // Safe check for currency symbol translation
    const symbolKey = currency === 'SAR' ? 'sar' : 'usd';
    const symbol = getTranslation(symbolKey);
    
    return currency === 'SAR'
      ? `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${symbol}`
      : `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className={`fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 no-print">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon name="FileText" size={20} />
                {getTranslation('invoiceId')} {invoice.id}
            </h3>
            <div className="flex gap-2">
                <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Icon name="Clock" className="animate-spin" size={16} />
                            {lang === 'ar' ? 'جاري التحميل...' : 'Generating...'}
                        </>
                    ) : (
                        <>
                            <Icon name="FileText" size={16} />
                            {getTranslation('printInvoice')}
                        </>
                    )}
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:bg-gray-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Icon name="X" size={20} />
                </button>
            </div>
        </div>

        {/* Invoice Content */}
        {/* We use specific text colors to ensure PDF looks good regardless of dark mode preference in UI */}
        <div id="invoice-content" className="p-8 md:p-12 overflow-y-auto flex-1 bg-white text-gray-900 relative" ref={contentRef}>
            
            {/* Inject Font and Layout styles specifically for the capture element */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                #invoice-content {
                    font-family: 'Cairo', 'Arial', sans-serif !important;
                    direction: ${isRtl ? 'rtl' : 'ltr'} !important;
                }
                #invoice-content * {
                    letter-spacing: normal !important; /* Critical for Arabic ligatures */
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-200 pb-8 mb-8">
                <div className="mb-6 md:mb-0 order-2 md:order-1">
                    <h1 className="text-3xl font-bold text-primary-900 mb-2 uppercase tracking-wider">{getTranslation('invoices')}</h1>
                    <p className="text-sm text-gray-500 font-mono">#{invoice.id}</p>
                </div>
                <div className="text-right flex flex-col items-end order-1 md:order-2 mb-6 md:mb-0">
                    {/* Logo Section */}
                    {siteSettings.logoUrl ? (
                        <img 
                            src={siteSettings.logoUrl} 
                            alt="Logo" 
                            className="h-16 w-auto object-contain mb-4" 
                            crossOrigin="anonymous" // Essential for html2canvas to capture external images
                        />
                    ) : (
                        <div className="h-16 w-16 bg-primary-600 rounded-lg flex items-center justify-center text-white mb-4">
                            <Icon name="Briefcase" size={32} />
                        </div>
                    )}
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{lang === 'en' ? siteSettings.appNameEn : siteSettings.appNameAr}</h2>
                    <p className="text-sm text-gray-600">{lang === 'en' ? siteSettings.cityEn : siteSettings.cityAr}, {lang === 'en' ? siteSettings.countryEn : siteSettings.countryAr}</p>
                    <p className="text-sm text-gray-600 dir-ltr">{siteSettings.contactEmail}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{getTranslation('billTo')}</h3>
                    <p className="font-bold text-lg text-gray-900">{invoice.customerName}</p>
                    <p className="text-sm text-gray-600">{invoice.date}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{getTranslation('status')}</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase border border-green-200">
                        {getTranslation('completed')}
                    </span>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className={`py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{getTranslation('items')}</th>
                        <th className={`py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right`}>{getTranslation('amount')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                            {invoice.itemsDescription}
                        </td>
                        <td className="py-4 px-4 text-gray-900 font-bold text-right dir-ltr">
                            {formatMoney(invoice.amount)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end border-t border-gray-200 pt-6">
                <div className="w-1/2 md:w-1/3 space-y-3">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>{getTranslation('subtotal')}</span>
                        <span className="font-medium dir-ltr">{formatMoney(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>{getTranslation('discount')}</span>
                        <span className="font-medium dir-ltr">0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <span>{getTranslation('total')}</span>
                        <span className="dir-ltr">{formatMoney(invoice.amount)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
                <p className="mb-1">{lang === 'ar' ? 'شكراً لتعاملك معنا!' : 'Thank you for your business!'}</p>
                <p>{siteSettings.whatsappNumber} | {siteSettings.contactEmail}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
