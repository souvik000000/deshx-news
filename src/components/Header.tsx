import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import {
  Search,
  Bookmark,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Flame,
  Globe2,
  ChevronDown,
} from 'lucide-react';
import { Language, WeatherItem, ViewMode } from '../types';
import { formatIndianDate } from '../utils/date';
import { getBookmarks } from '../utils/storage';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onSearchClick: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  currentView,
  onViewChange,
  onSearchClick,
  onRefresh,
  isRefreshing,
  lastUpdated,
  theme,
  onToggleTheme,
}) => {
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);
  const [weatherList, setWeatherList] = useState<WeatherItem[]>([]);
  const [selectedCityIdx, setSelectedCityIdx] = useState<number>(0);
  const [timeString, setTimeString] = useState<string>('');

  // Update bookmarks count
  useEffect(() => {
    const updateCount = () => {
      setBookmarkCount(getBookmarks().length);
    };
    updateCount();
    window.addEventListener('deshx_bookmarks_changed', updateCount);
    return () => window.removeEventListener('deshx_bookmarks_changed', updateCount);
  }, []);

  // Update clock in IST
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  useEffect(() => {
    fetch(apiUrl('/api/weather'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setWeatherList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const currentWeather = weatherList[selectedCityIdx] || {
    city: 'New Delhi',
    temp: '29°C',
    condition: 'Sunny',
    icon: 'sun',
  };

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud':
        return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
      case 'cloud-sun':
        return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <header id="deshx-main-header" className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 shadow-xs transition-colors">
      {/* Top Utility Bar */}
      <div className="w-full bg-neutral-950 text-neutral-300 text-xs px-4 py-1.5 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Indian Date & Time */}
          <div className="flex items-center gap-3 font-medium">
            <span className="text-neutral-400">
              {formatIndianDate(new Date(), currentLang)}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-600 hidden sm:inline-block" />
            <span className="text-amber-400 font-mono tracking-tight hidden sm:inline-block">
              {timeString} IST
            </span>
          </div>

          {/* Right: Weather & Ingestion auto-refresh indicator */}
          <div className="flex items-center gap-4">
            {/* Weather Dropdown */}
            <div className="relative group flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white transition-colors">
              {renderWeatherIcon(currentWeather.icon)}
              <span className="font-semibold text-neutral-200">{currentWeather.city}</span>
              <span className="text-amber-300 font-medium">{currentWeather.temp}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform" />

              {/* City selector dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                {weatherList.map((item, idx) => (
                  <button
                    key={item.city}
                    onClick={() => setSelectedCityIdx(idx)}
                    className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    <span>{item.city}</span>
                    <span className="font-mono text-amber-400">{item.temp}</span>
                  </button>
                ))}
              </div>
            </div>

            <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:inline-block" />

            {/* Live Auto-Refresh Status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-neutral-400 hidden md:inline">
                {currentLang === 'hi' ? 'लाइव अपडेट्स' : 'Live Ingestion'}
              </span>
              <button
                id="btn-manual-refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
                title={currentLang === 'hi' ? 'ताज़ा खबरें पुनः लोड करें' : 'Refresh Inshorts Feed'}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Editorial Motto */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => onViewChange('feed')}
            className="group flex items-baseline gap-1 text-left focus:outline-hidden cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover:text-rose-600 transition-colors">
                Desh<span className="text-rose-600 font-serif italic">X</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 mb-2 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 hidden sm:inline-block">
              {currentLang === 'hi' ? '60-शब्द' : '60-Words'}
            </span>
          </button>
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs hidden md:block leading-tight font-serif italic">
            {currentLang === 'hi'
              ? 'विश्वसनीय, निष्पक्ष और संक्षिप्त भारतीय समाचार'
              : 'Fast, verified bite-sized Indian news aggregation'}
          </p>
        </div>

        {/* Action Controls: Theme Switcher, Language Switcher, Search, Saved Bookmarks */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User-facing Theme Toggle (Light / Dark) */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={
              theme === 'dark'
                ? currentLang === 'hi' ? 'लाइट मोड चालू करें' : 'Switch to light mode'
                : currentLang === 'hi' ? 'डार्क मोड चालू करें' : 'Switch to dark mode'
            }
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Language Toggle Pill (PRD Section 3.2: English default, Hindi toggle) */}
          <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
            <button
              id="lang-toggle-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              id="lang-toggle-hi"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Search Trigger Button */}
          <button
            id="nav-search-button"
            onClick={onSearchClick}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              currentView === 'search'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
            title={currentLang === 'hi' ? 'समाचार खोजें' : 'Search news'}
          >
            <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            <span className="hidden sm:inline">
              {currentLang === 'hi' ? 'खोजें' : 'Search'}
            </span>
          </button>

          {/* Bookmarks (PRD Section 3.6: No account required, browser localStorage) */}
          <button
            id="nav-saved-button"
            onClick={() => onViewChange(currentView === 'saved' ? 'feed' : 'saved')}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium relative cursor-pointer ${
              currentView === 'saved'
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
            title={currentLang === 'hi' ? 'सहेजे गए समाचार' : 'Saved Bookmarks'}
          >
            <Bookmark className={`w-4 h-4 ${currentView === 'saved' ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`} />
            <span className="hidden sm:inline">
              {currentLang === 'hi' ? 'सहेजे गए' : 'Saved'}
            </span>
            {bookmarkCount > 0 && (
              <span
                id="bookmark-badge-count"
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentView === 'saved'
                    ? 'bg-white text-rose-700'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
