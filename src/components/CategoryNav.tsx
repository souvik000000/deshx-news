import React from 'react';
import {
  Flame,
  MapPin,
  Globe,
  TrendingUp,
  Trophy,
  Film,
  Cpu,
  Atom,
  Sparkles,
} from 'lucide-react';
import { NewsCategory, Language } from '../types';
import { CATEGORIES } from '../utils/constants';

interface CategoryNavProps {
  activeCategory: NewsCategory;
  onSelectCategory: (category: NewsCategory) => void;
  lang: Language;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
}) => {
  const getIcon = (iconName: string, isSelected: boolean) => {
    const className = `w-4 h-4 shrink-0 transition-colors ${
      isSelected
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
    }`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Film':
        return <Film className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Flame className={className} />;
    }
  };

  return (
    <nav
      id="category-navigation-bar"
      aria-label="News Categories"
      className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-[57px] sm:top-[69px] z-30 shadow-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const label = lang === 'hi' ? cat.nameHi : cat.nameEn;

            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-800 font-bold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {getIcon(cat.icon, isSelected)}
                <span>{label}</span>
                {cat.id === 'top_stories' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
