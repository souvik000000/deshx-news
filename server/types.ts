export type NewsCategory =
  | 'top_stories'
  | 'national'
  | 'world'
  | 'business'
  | 'sports'
  | 'entertainment'
  | 'technology'
  | 'science'
  | 'miscellaneous';

export type Language = 'en' | 'hi';

export interface NewsArticle {
  id: string;
  hashId?: string;
  title: string;
  content: string; // ~60 words summary
  author: string;
  imageUrl: string;
  sourceName: string;
  sourceUrl?: string;
  readMoreUrl?: string;
  publishedDate: string; // ISO string
  publishedTimestamp: number;
  category: NewsCategory;
  lang: Language;
  fetchedAt: string;
  isTrending?: boolean;
  isBreaking?: boolean;
}

export interface IngestionStats {
  totalArticles: number;
  lastUpdated: string;
  categoriesLoaded: Record<string, number>;
  source: 'inshorts_live' | 'cache_seed';
  pollingIntervalMinutes: number;
}

export interface MarketItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface WeatherItem {
  city: string;
  temp: string;
  condition: string;
  icon: string;
}
