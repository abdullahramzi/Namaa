import React from 'react';
import Icon from './Icon';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeSwitcher: React.FC<Props> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
    </button>
  );
};

export default ThemeSwitcher;