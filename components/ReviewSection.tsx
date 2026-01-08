
import React, { useState } from 'react';
import { Review, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import StarRating from './StarRating';
import Icon from './Icon';

interface Props {
  reviews: Review[];
  lang: Language;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

const ReviewSection: React.FC<Props> = ({ reviews, lang, onAddReview }) => {
  const t = TRANSLATIONS;
  const isRtl = lang === 'ar';
  
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Only show reviews that are approved
  const displayedReviews = reviews.filter(r => r.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && rating > 0 && comment) {
      onAddReview({
        userName: name,
        rating,
        comment,
        status: 'pending' // Default status
      });
      setName('');
      setRating(0);
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Icon name="Star" className="text-amber-500" />
        {t.reviews[lang]} <span className="text-gray-400 text-sm font-normal">({displayedReviews.length})</span>
      </h3>

      {/* Review List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
           <p className="text-gray-500 dark:text-slate-400 italic">{t.noResults[lang]}</p>
        ) : (
          displayedReviews.map((review) => (
            <div key={review.id} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{review.userName}</h4>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>
              
              {/* Admin Reply */}
              {review.adminReply && (
                  <div className="mt-3 pl-4 border-l-2 border-primary-500 ml-2">
                      <div className="flex items-center gap-2 mb-1">
                          <Icon name="ShieldCheck" size={14} className="text-primary-600 dark:text-primary-400" />
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{t.adminReply[lang]}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{review.adminReply}</p>
                  </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <div className="border-t border-gray-100 dark:border-slate-700 pt-8">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t.addReview[lang]}</h4>
        
        {submitted && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <Icon name="Clock" size={16} />
                {t.reviewPendingMsg[lang]}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t.rating[lang]}</label>
            <StarRating rating={rating} interactive onRate={setRating} size={24} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.yourName[lang]}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t.yourComment[lang]}</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white h-24 resize-none"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={!rating || !name || !comment}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.submit[lang]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewSection;
