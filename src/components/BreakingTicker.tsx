import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Volume2, Pause, Play } from 'lucide-react';
import { NewsArticle, MarketItem, Language } from '../types';
import { apiUrl } from '../utils/api';

interface BreakingTickerProps {
  lang: Language;
  onSelectArticle: (articleId: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  lang,
  onSelectArticle,
}) => {
  const [headlines, setHeadlines] = useState<NewsArticle[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Fetch breaking headlines
  useEffect(() => {
    fetch(apiUrl(`/api/breaking?lang=${lang}&limit=6`))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.headlines) {
          setHeadlines(data.headlines);
          setCurrentIdx(0);
        }
      })
      .catch(() => {});
  }, [lang]);

  // Fetch market pulse
  useEffect(() => {
    fetch(apiUrl('/api/market'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMarketItems(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Ticker rotation timer
  useEffect(() => {
    if (isPaused || headlines.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, headlines.length]);

  const currentHeadline = headlines[currentIdx];

  return (
    <section id="breaking-news-market-bar" className="w-full bg-neutral-100 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* 1. Breaking News Strip */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Breaking Red Badge */}
          <div className="flex items-center gap-1.5 bg-rose-600 text-white font-extrabold uppercase px-2.5 py-0.5 rounded-sm tracking-wider text-[11px] shrink-0 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{lang === 'hi' ? 'ताज़ा ख़बर' : 'BREAKING'}</span>
          </div>

          {/* Active Cycling Headline */}
          {currentHeadline ? (
            <button
              onClick={() => onSelectArticle(currentHeadline.id)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-rose-600 dark:hover:text-rose-400 truncate transition-colors cursor-pointer flex-1"
              title={currentHeadline.title}
            >
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {currentHeadline.title}
              </span>
            </button>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400 italic">
              {lang === 'hi' ? 'समाचार लोड हो रहे हैं...' : 'Loading latest updates...'}
            </span>
          )}
        </div>

        {/* Controls: Prev / Next / Pause */}
        {headlines.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-neutral-500 dark:text-neutral-400">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume auto-play' : 'Pause ticker'}
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setCurrentIdx((prev) => (prev - 1 + headlines.length) % headlines.length)}
              title="Previous"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono px-0.5">
              {currentIdx + 1}/{headlines.length}
            </span>
            <button
              onClick={() => setCurrentIdx((prev) => (prev + 1) % headlines.length)}
              title="Next"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Indian Financial Markets Strip */}
      <div className="w-full bg-neutral-950 text-neutral-300 border-t border-neutral-800 py-1 text-[11px] overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 whitespace-nowrap">
          <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            {lang === 'hi' ? 'मार्केट पल्स' : 'MARKETS'}
          </span>
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-0.5">
            {marketItems.map((item) => (
              <div key={item.symbol} className="flex items-center gap-1.5 font-mono">
                <span className="text-neutral-400 font-sans font-semibold text-[10px]">
                  {item.symbol}
                </span>
                <span className="font-bold text-neutral-100">{item.value}</span>
                <span
                  className={`text-[10px] flex items-center font-medium ${
                    item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.isPositive ? '+' : ''}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
