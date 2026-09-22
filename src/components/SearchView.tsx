import React, { useState, useEffect } from 'react';
import { Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { NewsArticle, NewsCategory, Language } from '../types';
import { CATEGORIES } from '../utils/constants';
import { apiUrl } from '../utils/api';
import { ArticleCard } from './ArticleCard';

interface SearchViewProps {
  lang: Language;
  onOpenArticle: (article: NewsArticle) => void;
  onBackToFeed: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  lang,
  onOpenArticle,
  onBackToFeed,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}${catParam}`))
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.articles) {
            setResults(data.articles);
            setHasSearched(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, lang]);

  return (
    <section id="deshx-search-section" className="w-full py-6">
      {/* Header & Back Button */}
      <div className="mb-6">
        <button
          onClick={onBackToFeed}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to News Feed'}</span>
        </button>

        <h1 className="font-serif font-bold text-2xl text-neutral-900 dark:text-white mb-4">
          {lang === 'hi' ? 'समाचार खोजें' : 'Search DeshX Archive'}
        </h1>

        {/* Search Bar Input */}
        <div className="relative w-full max-w-2xl">
          <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="deshx-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'शीर्षक, विषय, लेखक या कीवर्ड टाइप करें (उदा. इसरो, बाजार, क्रिकेट)...'
                : 'Search by keyword, topic, or source (e.g. ISRO, Sensex, Cricket)...'
            }
            className="w-full pl-12 pr-10 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-xs transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mt-3 py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {lang === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {lang === 'hi' ? c.nameHi : c.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-neutral-500 dark:text-neutral-400 gap-2 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          <span>{lang === 'hi' ? 'खोज जारी है...' : 'Searching articles...'}</span>
        </div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && (
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-medium">
            {lang === 'hi'
              ? `"${query}" के लिए ${results.length} परिणाम मिले`
              : `Found ${results.length} stories for "${query}"`}
          </div>

          {results.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs">
              {lang === 'hi'
                ? 'कोई परिणाम नहीं मिला। कृपया अन्य कीवर्ड से प्रयास करें।'
                : 'No matching articles found. Try searching with different terms or select "All Categories".'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, idx) => (
                <ArticleCard
                  key={item.id}
                  article={item}
                  lang={lang}
                  onOpenArticle={onOpenArticle}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-400 dark:text-neutral-500 text-xs max-w-md mx-auto my-8">
          Type keywords above to instantly search across all ~60-word news summaries in the DeshX feed.
        </div>
      )}
    </section>
  );
};
