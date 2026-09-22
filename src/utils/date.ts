import { Language } from '../types';

export function formatRelativeTime(timestamp: number | string, lang: Language = 'en'): string {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const now = Date.now();
  const diffSec = Math.floor((now - time) / 1000);

  if (lang === 'hi') {
    if (diffSec < 60) return 'अभी-अभी';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} मिनट पहले`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'कल';
    return `${diffDays} दिन पहले`;
  }

  // English
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export function formatIndianDate(date: Date = new Date(), lang: Language = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  };

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleDateString(locale, options);
}
