import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import {
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Clock,
  User,
  Check,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { NewsArticle, Language } from '../types';
import { formatRelativeTime, formatIndianDate } from '../utils/date';
import { isBookmarked, toggleBookmark, getReaderFontSize, setReaderFontSize } from '../utils/storage';
import { AdUnit } from './AdUnit';

interface ArticleModalProps {
  article: NewsArticle;
  lang: Language;
  onClose: () => void;
  onSelectRelated: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  lang,
  onClose,
  onSelectRelated,
}) => {
  const [bookmarked, setBookmarked] = useState<boolean>(isBookmarked(article.id));
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>(getReaderFontSize());
  const [copied, setCopied] = useState<boolean>(false);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);

  // Update URL history and Schema.org structured data
  useEffect(() => {
    // Update title
    const prevTitle = document.title;
    document.title = `${article.title} — DeshX News`;

    // Inject Schema.org NewsArticle structured data
    const scriptId = 'deshx-article-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      image: [article.imageUrl],
      datePublished: article.publishedDate,
      dateModified: article.publishedDate,
      author: [
        {
          '@type': 'Person',
          name: article.author || 'DeshX Bureau',
        },
      ],
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'DeshX',
        url: window.location.origin,
      },
      description: article.content,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${window.location.origin}?article=${article.id}`,
      },
    };

    script.textContent = JSON.stringify(schemaData);

    // Fetch related articles
    setLoadingRelated(true);
    fetch(apiUrl(`/api/article/${article.id}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.related) {
          setRelatedArticles(data.related);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRelated(false));

    return () => {
      document.title = prevTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  const handleBookmark = () => {
    const state = toggleBookmark(article);
    setBookmarked(state);
  };

  const handleAudioPlayback = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.content}`);
    utterance.lang = article.lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFontSizeCycle = () => {
    const next = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal';
    setFontSizeState(next);
    setReaderFontSize(next);
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}?article=${encodeURIComponent(article.id)}`;
    const shareData = {
      title: article.title,
      text: `${article.title}\n\n${article.content}`,
      url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          await navigator.share({
            title: article.title,
            url,
          });
        } else {
          await navigator.share(shareData);
        }
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?article=${article.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${article.title}*\n\n${article.content}\n\nRead on DeshX: ${window.location.origin}?article=${article.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const wordCount = `${article.title} ${article.content}`.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeLabel = lang === 'hi' ? `${readingMinutes} मिनट` : `${readingMinutes} min read`;

  const getContentTextClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose';
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  return (
    <div
      id="deshx-article-view-modal"
      className="fixed inset-0 z-50 bg-neutral-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between z-10 transition-colors">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'वापस' : 'Back to feed'}</span>
            </button>
            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-sm border border-rose-200 dark:border-rose-900">
              DeshX Reader
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Font size adjuster */}
            <button
              onClick={handleFontSizeCycle}
              title="Toggle reading text size"
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-mono font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>A</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.4x'}
              </span>
            </button>

            {/* Audio Reader */}
            <button
              onClick={handleAudioPlayback}
              title={isPlayingAudio ? 'Stop reading' : 'Listen to 60-second summary'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 animate-pulse'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {isPlayingAudio ? (
                <VolumeX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isPlayingAudio ? 'Playing' : 'Listen'}
              </span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-rose-600 dark:fill-rose-400' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Article Header & Headline */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="bg-neutral-900 dark:bg-neutral-950 text-white font-semibold px-2 py-0.5 rounded text-[11px]">
                {article.sourceName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                {formatRelativeTime(article.publishedTimestamp, lang)}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm font-semibold border border-neutral-200 dark:border-neutral-700">
                <BookOpen className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                {readingTimeLabel}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                {article.author}
              </span>
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 dark:text-white leading-tight">
              {article.title}
            </h1>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 aspect-16/9 w-full relative">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80';
              }}
            />
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
              DeshX Inshorts Wire
            </div>
          </div>

          {/* Short-form ~60-word Content Body (as specified in PRD 3.2.1) */}
          <div className="bg-neutral-50/70 dark:bg-neutral-800/60 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {lang === 'hi' ? '60-शब्दों का संक्षिप्त सार' : '60-Word Byte Summary'}
            </div>
            <p className={`font-sans text-neutral-800 dark:text-neutral-200 font-normal ${getContentTextClass()}`}>
              {article.content}
            </p>
          </div>

          {/* Social Share & Copy Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-2 border-y border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {lang === 'hi' ? 'शेयर करें:' : 'Share this story:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                id={`modal-native-share-btn-${article.id}`}
                onClick={handleNativeShare}
                title={lang === 'hi' ? 'वेब शेयर' : 'Share via device'}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'शेयर' : 'Share'}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  const text = encodeURIComponent(`${article.title}`);
                  const url = encodeURIComponent(`${window.location.origin}?article=${article.id}`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>X / Twitter</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* DEDICATED SOURCE BUTTON (MANDATED IN PRD Section 3.2.2) */}
          <div
            id="article-source-redirection-section"
            className="p-5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {lang === 'hi' ? 'मूल प्रकाशक का संपूर्ण विवरण' : 'Original Publisher Source'}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                {lang === 'hi'
                  ? `संपूर्ण विस्तृत रिपोर्ट पढ़ने के लिए ${article.sourceName} पर जाएं।`
                  : `Read the comprehensive original report directly at ${article.sourceName}.`}
              </p>
            </div>

            <a
              id="btn-read-full-source"
              href={article.readMoreUrl || article.sourceUrl || 'https://news.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xs transition-colors shrink-0"
            >
              <span>
                {lang === 'hi'
                  ? `${article.sourceName} पर पूरा पढ़ें`
                  : `Read full story at ${article.sourceName}`}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* In-Article Native Ad (PRD 3.7 Adsterra Ad Unit) */}
          <div className="pt-2">
            <AdUnit type="native" />
          </div>

          {/* Related Stories in Category */}
          {relatedArticles.length > 0 && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'संबंधित ख़बरें' : 'More in this category'}</span>
                <ChevronRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all cursor-pointer flex gap-3"
                  >
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-md object-cover shrink-0 bg-neutral-200 dark:bg-neutral-800"
                    />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {rel.sourceName} • {formatRelativeTime(rel.publishedTimestamp, lang)}
                      </span>
                      <h5 className="font-serif font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-2 mt-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                        {rel.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
