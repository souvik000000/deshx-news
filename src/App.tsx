import React, { useState, useEffect, useCallback } from 'react';
import {
  NewsArticle,
  NewsCategory,
  Language,
  ViewMode,
} from './types';
import { apiUrl } from './utils/api';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { CategoryNav } from './components/CategoryNav';
import { HeroFeatured } from './components/HeroFeatured';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import { BookmarksView } from './components/BookmarksView';
import { SearchView } from './components/SearchView';
import { AdUnit } from './components/AdUnit';
import { Footer } from './components/Footer';
import { CATEGORIES } from './utils/constants';
import { getThemePreference, setThemePreference } from './utils/storage';
import {
  Loader2,
  RefreshCw,
  Flame,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getThemePreference());
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('top_stories');
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Sync theme with document element and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setThemePreference(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync with URL query parameter (e.g. ?article=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('article');
    if (articleId) {
      fetch(apiUrl(`/api/article/${articleId}`))
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.article) {
            setSelectedArticle(data.article);
          }
        })
        .catch(() => {});
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const popId = p.get('article');
      if (popId) {
        fetch(apiUrl(`/api/article/${popId}`))
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.article) {
              setSelectedArticle(data.article);
            }
          });
      } else {
        setSelectedArticle(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch feed articles
  const fetchFeed = useCallback(
    async (resetPage: boolean = true) => {
      const targetPage = resetPage ? 1 : page + 1;
      if (resetPage) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetch(
          apiUrl(`/api/feed?category=${activeCategory}&lang=${lang}&page=${targetPage}&limit=12`)
        );
        const data = await res.json();

        if (data.success) {
          if (resetPage) {
            setArticles(data.articles || []);
          } else {
            setArticles((prev) => [...prev, ...(data.articles || [])]);
            setPage(targetPage);
          }
          setHasMore(data.hasMore || false);
          setLastUpdated(data.lastUpdated || new Date().toISOString());
        }
      } catch (err) {
        console.error('Failed to load feed:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, lang, page]
  );

  // Fetch trending articles
  useEffect(() => {
    fetch(apiUrl(`/api/trending?lang=${lang}&limit=5`))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles) {
          setTrendingArticles(data.articles);
        }
      })
      .catch(() => {});
  }, [lang]);

  // Refetch feed whenever category or language changes
  useEffect(() => {
    fetchFeed(true);
  }, [activeCategory, lang]);

  // Handle opening an article
  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    const newUrl = `${window.location.pathname}?article=${encodeURIComponent(article.id)}`;
    window.history.pushState({ articleId: article.id }, '', newUrl);
  };

  // Handle closing the article modal
  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  // Handle manual trigger refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(apiUrl('/api/refresh'), { method: 'POST' });
      const data = await res.json();
      await fetchFeed(true);
      setRefreshNotice(
        lang === 'hi'
          ? 'समाचार फ़ीड सफलतापूर्वक ताज़ा कर दी गई है।'
          : 'News feed refreshed successfully from Inshorts wire.'
      );
      setTimeout(() => setRefreshNotice(null), 4000);
    } catch {
      setRefreshNotice('Refresh failed. Serving cached news.');
      setTimeout(() => setRefreshNotice(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Find lead article and remaining articles
  const leadArticle =
    activeCategory === 'top_stories' && articles.length > 0 ? articles[0] : null;
  const feedArticles =
    activeCategory === 'top_stories' && articles.length > 0 ? articles.slice(1) : articles;

  const currentCategoryObj =
    CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className={`min-h-screen flex flex-col bg-neutral-50 dark:bg-[#0f1013] text-neutral-900 dark:text-neutral-100 transition-colors ${lang === 'hi' ? 'lang-hi' : ''}`}>
      {/* 1. Masthead Header */}
      <Header
        currentLang={lang}
        onLanguageChange={(newLang) => {
          setLang(newLang);
          if (currentView !== 'saved') setCurrentView('feed');
        }}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchClick={() => {
          setCurrentView('search');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Breaking News Marquee & Financial Markets Pulse */}
      <BreakingTicker
        lang={lang}
        onSelectArticle={(id) => {
          fetch(apiUrl(`/api/article/${id}`))
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.article) {
                handleOpenArticle(data.article);
              }
            });
        }}
      />

      {/* 3. Sticky Categories Bar */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (currentView !== 'feed') setCurrentView('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* Refresh Toast Notification */}
      {refreshNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-neutral-800 text-white px-4 py-2.5 rounded-xl shadow-xl border border-neutral-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* Top Leaderboard Ad Unit (PRD Section 3.7 & 4.4) */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdUnit type="banner" />
      </div>

      {/* 4. Main Body Content Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6">
        {currentView === 'saved' ? (
          <BookmarksView
            lang={lang}
            onOpenArticle={handleOpenArticle}
            onBackToFeed={() => setCurrentView('feed')}
          />
        ) : currentView === 'search' ? (
          <SearchView
            lang={lang}
            onOpenArticle={handleOpenArticle}
            onBackToFeed={() => setCurrentView('feed')}
          />
        ) : (
          /* Standard News Feed View */
          <div>
            {/* Hero Top Stories section (visible on Top Stories) */}
            {activeCategory === 'top_stories' && leadArticle && (
              <HeroFeatured
                leadArticle={leadArticle}
                trendingArticles={trendingArticles}
                lang={lang}
                onOpenArticle={handleOpenArticle}
              />
            )}

            {/* Category Title & Description */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-white">
                    {lang === 'hi' ? currentCategoryObj.nameHi : currentCategoryObj.nameEn}
                  </h1>
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                    {articles.length} {lang === 'hi' ? 'समाचार' : 'Stories'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {lang === 'hi'
                    ? 'इनशॉर्ट्स प्रारूप में 60 शब्दों के त्वरित, सत्यापित और संक्षिप्त समाचार'
                    : 'Inshorts 60-word bite-sized summaries • Verified Indian & global wires'}
                </p>
              </div>

              {/* Feed quick refresh timestamp */}
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium flex items-center gap-1.5">
                <span>Updated in real time</span>
              </div>
            </div>

            {/* Layout Grid: Articles Feed + Sticky Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left / Center: Article Cards Feed (3 cols) */}
              <div className="lg:col-span-3 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-500 gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {lang === 'hi'
                        ? 'ताज़ा समाचार लोड हो रहे हैं...'
                        : 'Loading 60-word news feed...'}
                    </p>
                  </div>
                ) : feedArticles.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center text-neutral-500 dark:text-neutral-400 text-xs">
                    No articles found for this category. Click refresh to poll the Inshorts wire.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {feedArticles.map((article, index) => {
                      // Insert a native sponsored ad card every 4 articles as per PRD 3.7
                      const showAd = index > 0 && index % 4 === 0;

                      return (
                        <React.Fragment key={article.id}>
                          <ArticleCard
                            article={article}
                            lang={lang}
                            onOpenArticle={handleOpenArticle}
                            index={index}
                          />
                          {showAd && (
                            <div className="md:col-span-2">
                              <AdUnit type="native" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Load More Button */}
                {!loading && hasMore && (
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      id="btn-load-more-stories"
                      onClick={() => fetchFeed(false)}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-full shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          <span>{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading more...'}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {lang === 'hi'
                              ? 'और 60-शब्द समाचार लोड करें'
                              : 'Load More 60-Word Stories'}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Structural Editorial Sidebar (1 col on desktop) */}
              <aside className="lg:col-span-1 space-y-6">
                {/* 1. DeshX Format Explainer Card */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs transition-colors">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DeshX 60-Word Guarantee</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {lang === 'hi'
                      ? 'हर समाचार 60 शब्दों के सटीक प्रारूप में। समय बचाएं और हर महत्वपूर्ण घटना से अवगत रहें।'
                      : 'Every story summarized in 60 words or less. Never miss critical national, sports, or business events.'}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Free Forever</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">No Paywall</span>
                  </div>
                </div>

                {/* 2. Sidebar Adsterra 300x250 Ad Unit */}
                <AdUnit type="sidebar" />

                {/* 3. Quick Trending Headlines */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs transition-colors">
                  <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{lang === 'hi' ? 'शीर्ष सुर्खियां' : 'Top Reads'}</span>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {trendingArticles.slice(0, 4).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleOpenArticle(art)}
                        className="py-2.5 first:pt-0 last:pb-0 cursor-pointer group"
                      >
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                          {art.sourceName}
                        </span>
                        <h4 className="font-serif font-semibold text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug mt-0.5">
                          {art.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Sidebar Adsterra 160x600 Wide Skyscraper */}
                <div className="hidden sm:flex justify-center pt-2">
                  <AdUnit type="160x600" />
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Responsive 468x60 Banner above Footer */}
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-center py-2">
        <AdUnit type="468x60" />
      </div>

      {/* 5. Dedicated In-App Article Modal Reader (PRD Section 3.2.2) */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          lang={lang}
          onClose={handleCloseArticle}
          onSelectRelated={(related) => handleOpenArticle(related)}
        />
      )}

      {/* 6. Editorial Footer */}
      <Footer
        lang={lang}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (currentView !== 'feed') setCurrentView('feed');
        }}
      />
    </div>
  );
}
