import React from 'react';
import Icon from './Icon';

interface Props {
  rating: number;
  max?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

const StarRating: React.FC<Props> = ({ 
  rating, 
  max = 5, 
  interactive = false, 
  onRate,
  size = 16 
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Icon 
              name="Star" 
              size={size} 
              className={`${
                isFilled 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'fill-gray-200 text-gray-200 dark:fill-slate-700 dark:text-slate-700'
              }`} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;