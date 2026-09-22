import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowLeft, Search, Filter } from 'lucide-react';
import { NewsArticle, Language } from '../types';
import { getBookmarks, clearAllBookmarks } from '../utils/storage';
import { ArticleCard } from './ArticleCard';

interface BookmarksViewProps {
  lang: Language;
  onOpenArticle: (article: NewsArticle) => void;
  onBackToFeed: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  lang,
  onOpenArticle,
  onBackToFeed,
}) => {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const loadBookmarks = () => {
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    loadBookmarks();
    window.addEventListener('deshx_bookmarks_changed', loadBookmarks);
    return () => window.removeEventListener('deshx_bookmarks_changed', loadBookmarks);
  }, []);

  const handleClearAll = () => {
    if (
      window.confirm(
        lang === 'hi'
          ? 'क्या आप सभी सहेजे गए समाचार हटाना चाहते हैं?'
          : 'Are you sure you want to remove all saved bookmarks?'
      )
    ) {
      clearAllBookmarks();
      setBookmarks([]);
    }
  };

  const filteredBookmarks = bookmarks.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
  });

  return (
    <section id="saved-bookmarks-view" className="w-full py-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <button
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to News Feed'}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-600 text-white rounded-lg">
              <Bookmark className="w-5 h-5 fill-white" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-neutral-900 dark:text-white">
              {lang === 'hi' ? 'सहेजे गए समाचार' : 'Saved Bookmarks'}
            </h1>
            <span className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold px-2 py-0.5 rounded-full ml-1">
              {bookmarks.length}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {lang === 'hi'
              ? 'बिना किसी खाते के आपके ब्राउज़र में सुरक्षित रूप से संग्रहीत'
              : 'Stored securely in your local browser cache • No account or login required'}
          </p>
        </div>

        {/* Clear All action */}
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search within saved */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={lang === 'hi' ? 'सहेजे गए में खोजें...' : 'Filter saved stories...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bookmarks Grid / Empty State */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center max-w-md mx-auto my-12 shadow-xs transition-colors">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-2">
            {lang === 'hi' ? 'कोई सहेजा गया समाचार नहीं' : 'No Bookmarked Stories Yet'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            {lang === 'hi'
              ? 'किसी भी समाचार कार्ड पर बुकमार्क आइकन दबाकर उसे बाद में पढ़ने के लिए सुरक्षित करें।'
              : 'Tap the bookmark icon on any 60-word news card to save it here for offline or later reading.'}
          </p>
          <button
            onClick={onBackToFeed}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {lang === 'hi' ? 'ताज़ा समाचार ब्राउज़ करें' : 'Browse Top Stories'}
          </button>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs">
          No saved stories match your filter &ldquo;{searchFilter}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((item, idx) => (
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
    </section>
  );
};
