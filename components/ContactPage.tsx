
import React, { useState } from 'react';
import { SiteSettings, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Icon from './Icon';

interface Props {
  settings: SiteSettings;
  lang: Language;
}

const ContactPage: React.FC<Props> = ({ settings, lang }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation: Check if email is the default placeholder
    if (settings.contactEmail === 'info@namaa.sa') {
        alert(lang === 'ar' 
            ? 'تنبيه: أنت تستخدم البريد الافتراضي (info@namaa.sa). يرجى تغييره من لوحة التحكم لتستقبل الرسائل.' 
            : 'Warning: You are using the default email (info@namaa.sa). Please update it in Settings to receive messages.');
    }

    try {
        // Prepare the payload for FormSubmit
        const payload = {
            _subject: `New Message from ${settings.appNameEn}: ${formData.subject}`,
            _replyto: formData.email,
            _template: 'table', // Formats the email nicely
            _captcha: "false", // Disable captcha to prevent submission blocking
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
        };

        // Attempt to send via FormSubmit API
        // NOTE: The first time you send to a new email address, FormSubmit will send you an activation email.
        const response = await fetch(`https://formsubmit.co/ajax/${settings.contactEmail}`, {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            setIsSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            // Do not hide success message immediately so user can read the note about activation
        } else {
            throw new Error("Form submission failed");
        }
    } catch (error) {
        console.error("Email sending failed, falling back to mailto:", error);
        // Fallback: Open default mail client if API fails
        const subject = encodeURIComponent(`${formData.subject} - ${formData.name}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
        window.location.href = `mailto:${settings.contactEmail}?subject=${subject}&body=${body}`;
        
        // Still show success message to user as they are taken to their mail client
        setIsSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9+]/g, '');

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.contact[lang]}</h1>
        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          {t.contactDesc[lang]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Phone/WhatsApp */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                    <Icon name="Phone" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.callUs[lang]}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">{t.workingHoursDesc[lang]}</p>
                <div className="flex flex-col gap-2">
                    <a href={`tel:${cleanPhone}`} className="text-gray-800 dark:text-white font-semibold hover:text-primary-600 transition-colors dir-ltr text-left">
                        {settings.whatsappNumber}
                    </a>
                    <a 
                        href={`https://wa.me/${cleanPhone.replace('+','')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 font-medium text-sm hover:underline"
                    >
                        <Icon name="MessageSquare" size={16} />
                        WhatsApp
                    </a>
                </div>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center text-secondary-600 dark:text-secondary-400 mb-4">
                    <Icon name="Mail" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.emailUs[lang]}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                    {lang === 'ar' ? 'فريقنا متاح للرد عليك بسرعة.' : 'Our team is available to respond quickly.'}
                </p>
                <a href={`mailto:${settings.contactEmail}`} className="text-gray-800 dark:text-white font-semibold hover:text-primary-600 transition-colors break-all">
                    {settings.contactEmail}
                </a>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                    <Icon name="MapPin" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.visitUs[lang]}</h3>
                <p className="text-gray-800 dark:text-white font-medium">
                    {lang === 'en' ? settings.cityEn : settings.cityAr}, {lang === 'en' ? settings.countryEn : settings.countryAr}
                </p>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 justify-center pt-4">
                {settings.twitterUrl && (
                    <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-blue-400 transition-all">
                        <Icon name="Twitter" size={20} />
                    </a>
                )}
                {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-blue-600 transition-all">
                        <Icon name="Facebook" size={20} />
                    </a>
                )}
                {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-pink-500 transition-all">
                        <Icon name="Instagram" size={20} />
                    </a>
                )}
            </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 md:p-10 relative overflow-hidden">
                {/* Decorative Background */}
                <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 ${isRtl ? '-translate-x-1/2' : 'translate-x-1/2'}`}></div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 relative z-10">{t.sendMessage[lang]}</h3>

                {isSent ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mx-auto mb-4">
                            <Icon name="Check" size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.messageSent[lang]}</h4>
                        <p className="text-gray-600 dark:text-slate-300 mb-4">{t.messageSentDesc[lang]}</p>
                        
                        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg inline-block mx-auto max-w-sm">
                            <strong className="block mb-1">{lang === 'ar' ? 'ملاحظة هامة:' : 'Important:'}</strong>
                            {lang === 'ar' 
                                ? 'إذا كانت هذه أول مرة تستقبل رسائل من الموقع، يرجى فحص بريدك الإلكتروني وتفعيل خدمة الاستقبال من FormSubmit (قد تكون في البريد المهمل).' 
                                : 'If this is your first time receiving messages, please check your email inbox to Activate FormSubmit (check spam folder).'}
                        </div>
                        
                        <button 
                            onClick={() => setIsSent(false)} 
                            className="mt-6 text-primary-600 hover:text-primary-700 text-sm font-bold block mx-auto"
                        >
                            {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t.fullName[lang]}</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required
                                        disabled={isSubmitting}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none disabled:opacity-50"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                    <Icon name="Users" size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t.email[lang]}</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        required
                                        disabled={isSubmitting}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none disabled:opacity-50"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                    <Icon name="Mail" size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t.subject[lang]}</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    required
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none disabled:opacity-50"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                                <Icon name="Tag" size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t.message[lang]}</label>
                            <textarea 
                                required
                                rows={5}
                                disabled={isSubmitting}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white transition-all outline-none resize-none disabled:opacity-50"
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon name="Clock" className="animate-spin" size={20} />
                                    {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    {t.submit[lang]}
                                    <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
