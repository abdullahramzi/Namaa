
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Icon from './Icon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  totalAmount: string;
  onConfirm: (data: CheckoutData) => void;
}

export interface CheckoutData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const CheckoutModal: React.FC<Props> = ({ isOpen, onClose, lang, totalAmount, onConfirm }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onConfirm(formData);
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setAgreed(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        {step === 'form' ? (
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="ShoppingBag" className="text-primary-600" size={20} />
                        {t.checkoutTitle[lang]}
                    </h3>
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><Icon name="X" size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800 flex items-start gap-2">
                        <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
                        <p>{t.checkoutNotice[lang]}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">{t.fullName[lang]} <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required 
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">{t.customerPhone[lang]} <span className="text-red-500">*</span></label>
                        <input 
                            type="tel" 
                            required 
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-right"
                            placeholder="+966..."
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">{t.email[lang]}</label>
                        <input 
                            type="email" 
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-right"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">{t.notes[lang]}</label>
                        <textarea 
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="agreeTerms" 
                            required
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                        <label htmlFor="agreeTerms" className="text-sm text-gray-600 dark:text-slate-400 cursor-pointer select-none">
                            {t.agreeToTerms[lang]}
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-600 dark:text-slate-400">
                        <span>{t.total[lang]}</span>
                        <span className="text-lg text-gray-900 dark:text-white dir-ltr">{totalAmount}</span>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!agreed || !formData.name || !formData.phone}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.sendOrder[lang]}
                        <Icon name={isRtl ? 'ArrowLeft' : 'ArrowRight'} size={18} />
                    </button>
                </div>
            </form>
        ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6 animate-bounce-slow">
                    <Icon name="Check" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.orderSuccessTitle[lang]}</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
                    {t.orderSuccessDesc[lang]}
                </p>
                <button 
                    onClick={handleClose}
                    className="px-8 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors"
                >
                    {t.close[lang]}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
