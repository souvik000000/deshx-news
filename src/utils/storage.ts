import { NewsArticle } from '../types';

const STORAGE_KEY = 'deshx_saved_bookmarks';
const FONT_SIZE_KEY = 'deshx_reader_font_size';

// Dispatch custom event when bookmarks change so components sync immediately
function dispatchBookmarkChange() {
  window.dispatchEvent(new Event('deshx_bookmarks_changed'));
}

export function getBookmarks(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read bookmarks from localStorage:', e);
    return [];
  }
}

export function isBookmarked(articleId: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some((item) => item.id === articleId || item.hashId === articleId);
}

export function toggleBookmark(article: NewsArticle): boolean {
  try {
    const bookmarks = getBookmarks();
    const existsIndex = bookmarks.findIndex(
      (item) => item.id === article.id || item.hashId === article.hashId
    );

    let isAdded = false;
    if (existsIndex >= 0) {
      bookmarks.splice(existsIndex, 1);
      isAdded = false;
    } else {
      // Add to beginning of array
      bookmarks.unshift(article);
      isAdded = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    dispatchBookmarkChange();
    return isAdded;
  } catch (e) {
    console.error('Failed to toggle bookmark:', e);
    return false;
  }
}

export function removeBookmark(articleId: string): void {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(
      (item) => item.id !== articleId && item.hashId !== articleId
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    dispatchBookmarkChange();
  } catch (e) {
    console.error('Failed to remove bookmark:', e);
  }
}

export function clearAllBookmarks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    dispatchBookmarkChange();
  } catch (e) {
    console.error('Failed to clear bookmarks:', e);
  }
}

export function getReaderFontSize(): 'normal' | 'large' | 'xlarge' {
  try {
    const val = localStorage.getItem(FONT_SIZE_KEY);
    if (val === 'large' || val === 'xlarge') return val;
    return 'normal';
  } catch {
    return 'normal';
  }
}

export function setReaderFontSize(size: 'normal' | 'large' | 'xlarge'): void {
  try {
    localStorage.setItem(FONT_SIZE_KEY, size);
  } catch {}
}

const THEME_KEY = 'deshx_theme';

export function getThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function setThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
}
