import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  ExternalLink,
  Clock,
  User,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { NewsArticle, Language } from '../types';
import { formatRelativeTime } from '../utils/date';
import { isBookmarked, toggleBookmark } from '../utils/storage';

interface ArticleCardProps {
  article: NewsArticle;
  lang: Language;
  onOpenArticle: (article: NewsArticle) => void;
  index?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  lang,
  onOpenArticle,
  index = 0,
}) => {
  const [bookmarked, setBookmarked] = useState<boolean>(isBookmarked(article.id));
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  // Calculate estimated reading time based on total word count
  const wordCount = `${article.title} ${article.content}`.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeLabel = lang === 'hi' ? `${readingMinutes} मिनट` : `${readingMinutes} min read`;

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleBookmark(article);
    setBookmarked(newState);
  };

  const handleAudioPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.content}`);
    utterance.lang = article.lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?article=${encodeURIComponent(article.id)}`;
    const shareData = {
      title: article.title,
      text: `${article.title}\n\n${article.content}`,
      url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Fallback to title and url if full payload is rejected by system
          await navigator.share({
            title: article.title,
            url,
          });
        } else {
          await navigator.share(shareData);
        }
        setShowShareMenu(false);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User dismissed or cancelled the share dialog
          return;
        }
        // If navigator.share fails (e.g. iframe permission denied or desktop unsupported), show fallback options
        setShowShareMenu(true);
      }
    } else {
      // Fallback for browsers without Web Share API
      setShowShareMenu((prev) => !prev);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?article=${encodeURIComponent(article.id)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    });
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `*${article.title}*\n\n${article.content}\n\nRead on DeshX: ${window.location.origin}?article=${article.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`${article.title} | DeshX News`);
    const url = encodeURIComponent(`${window.location.origin}?article=${article.id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <article
      id={`article-card-${article.id}`}
      onClick={() => onOpenArticle(article)}
      className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Article Image Container */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading={index < 4 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />

          {/* Top badges: Source & Audio */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-neutral-900/85 dark:bg-neutral-950/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">
              {article.sourceName}
            </span>

            {/* Quick Audio TTS trigger */}
            <button
              onClick={handleAudioPlayback}
              title={isPlayingAudio ? 'Stop audio' : 'Listen to 60-word summary'}
              className="pointer-events-auto p-1.5 rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs transition-colors cursor-pointer"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Article Content & Headline */}
        <div className="p-4 sm:p-5">
          {/* Metadata bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-neutral-500 dark:text-neutral-400 mb-2 font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
              {formatRelativeTime(article.publishedTimestamp, lang)}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-sm font-semibold border border-neutral-200 dark:border-neutral-700">
              <BookOpen className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              {readingTimeLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <User className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              {article.author}
            </span>
          </div>

          {/* Headline */}
          <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors mb-2.5 line-clamp-3">
            {article.title}
          </h3>

          {/* ~60-Word Summary (as specified in PRD 3.2.1) */}
          <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed line-clamp-4">
            {article.content}
          </p>
        </div>
      </div>

      {/* Card Footer: Action Bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 flex items-center justify-between gap-2 mt-2">
        {/* Read Full on DeshX indicator */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
          {lang === 'hi' ? 'पूरा पढ़ें' : 'Read on DeshX'}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
          {/* Bookmark Button */}
          <button
            id={`bookmark-btn-${article.id}`}
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-rose-600 dark:fill-rose-400' : ''}`} />
          </button>

          {/* Native Web Share API Button & Social Menu */}
          <div className="relative">
            <button
              id={`native-share-btn-${article.id}`}
              onClick={handleNativeShare}
              title={lang === 'hi' ? 'वेब शेयर के माध्यम से दोस्तों के साथ साझा करें' : 'Share article with friends (Web Share API)'}
              aria-label="Share article"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer font-medium text-xs"
            >
              <Share2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline font-semibold">
                {lang === 'hi' ? 'शेयर' : 'Share'}
              </span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-20 text-xs animate-fadeIn">
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full px-3 py-1.5 text-left text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer font-semibold text-rose-600 dark:text-rose-400"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'डिवाइस शेयर शीट' : 'Device Share Sheet'}</span>
                  </button>
                )}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full px-3 py-1.5 text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">WhatsApp</span>
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="w-full px-3 py-1.5 text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer"
                >
                  <span>X / Twitter</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3 py-1.5 text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {lang === 'hi' ? 'कॉपी हो गया!' : 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <span>{lang === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
