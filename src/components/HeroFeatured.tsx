import React, { useState } from 'react';
import { Clock, User, Bookmark, ArrowRight, TrendingUp, Flame, Volume2 } from 'lucide-react';
import { NewsArticle, Language } from '../types';
import { formatRelativeTime } from '../utils/date';
import { isBookmarked, toggleBookmark } from '../utils/storage';

interface HeroFeaturedProps {
  leadArticle: NewsArticle;
  trendingArticles: NewsArticle[];
  lang: Language;
  onOpenArticle: (article: NewsArticle) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  leadArticle,
  trendingArticles,
  lang,
  onOpenArticle,
}) => {
  const [leadBookmarked, setLeadBookmarked] = useState<boolean>(isBookmarked(leadArticle.id));

  const handleLeadBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = toggleBookmark(leadArticle);
    setLeadBookmarked(state);
  };

  return (
    <section id="homepage-hero-top-stories" className="w-full mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-rose-600 text-white">
            <Flame className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-neutral-900 dark:text-white tracking-tight">
            {lang === 'hi' ? 'प्रमुख सुर्खियां और ट्रेंडिंग' : 'Top Stories & Trending'}
          </h2>
        </div>
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          {lang === 'hi' ? 'ताज़ा अपडेट' : 'Live Wire'}
        </span>
      </div>

      {/* Grid: Lead Story (2 cols) + Trending Shorts (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Hero Card (spans 2 cols on lg) */}
        <div
          id={`hero-lead-${leadArticle.id}`}
          onClick={() => onOpenArticle(leadArticle)}
          className="lg:col-span-2 group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          {/* Main Visual */}
          <div className="relative aspect-16/9 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={leadArticle.imageUrl}
              alt={leadArticle.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=900&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                  {lang === 'hi' ? 'मुख्य समाचार' : 'LEAD STORY'}
                </span>
                <span className="bg-black/60 backdrop-blur-xs text-neutral-200 text-xs font-medium px-2 py-0.5 rounded">
                  {leadArticle.sourceName}
                </span>
              </div>
              <h2 className="font-serif font-extrabold text-xl sm:text-2xl md:text-3xl leading-tight drop-shadow-xs group-hover:text-amber-300 transition-colors">
                {leadArticle.title}
              </h2>
            </div>
          </div>

          {/* Lead Summary Body & Controls */}
          <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 transition-colors">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  {formatRelativeTime(leadArticle.publishedTimestamp, lang)}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                  {leadArticle.author}
                </span>
              </div>

              <button
                onClick={handleLeadBookmark}
                title="Bookmark lead story"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  leadBookmarked
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${leadBookmarked ? 'fill-rose-600 dark:fill-rose-400' : ''}`} />
              </button>
            </div>

            <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {leadArticle.content}
            </p>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-serif italic">
                Inshorts 60-Word Byte Format
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>{lang === 'hi' ? 'विस्तार से पढ़ें' : 'Read Full Byte'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Rail: Trending Top Shorts */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{lang === 'hi' ? 'ट्रेंडिंग टॉप 3' : 'Trending Now'}</span>
          </div>

          {trendingArticles.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onOpenArticle(item)}
              className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-start"
            >
              {/* Rank number badge */}
              <span className="text-2xl font-serif font-extrabold text-neutral-300 dark:text-neutral-700 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-none shrink-0 w-6">
                #{idx + 1}
              </span>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.sourceName}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(item.publishedTimestamp, lang)}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>

              {/* Thumbnail */}
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover shrink-0 bg-neutral-100 dark:bg-neutral-800"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
