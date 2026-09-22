import { NewsArticle, NewsCategory, Language, IngestionStats, MarketItem, WeatherItem } from './types';
import { SEED_ARTICLES } from './seedData';

// Map DeshX sections to Inshorts topics as per PRD Section 3.1
const CATEGORY_TOPIC_MAP: Record<NewsCategory, string[]> = {
  top_stories: ['top_stories', 'national'],
  national: ['national', 'politics'],
  world: ['world'],
  business: ['business', 'startup'],
  sports: ['sports'],
  entertainment: ['entertainment'],
  technology: ['technology', 'automobile'],
  science: ['science'],
  miscellaneous: ['hatke', 'miscellaneous'],
};

// Internal in-memory articles database (cache)
class NewsStorage {
  private articles: Map<string, NewsArticle> = new Map();
  private lastUpdated: number = Date.now();
  private isIngesting: boolean = false;
  private pollingTimer: NodeJS.Timeout | null = null;
  private categoriesLoaded: Record<string, number> = {};

  constructor() {
    // Seed the database with high-quality fallback articles first
    this.seed();
    // Schedule background polling every 10 minutes
    this.startPolling(10);
    // Initial fetch in background after server boot
    setTimeout(() => {
      this.ingestAll().catch((err) => console.error('Initial ingest error:', err));
    }, 1500);
  }

  private seed() {
    for (const article of SEED_ARTICLES) {
      this.articles.set(article.id, article);
      const catKey = `${article.lang}:${article.category}`;
      this.categoriesLoaded[catKey] = (this.categoriesLoaded[catKey] || 0) + 1;
    }
  }

  public getStats(): IngestionStats {
    return {
      totalArticles: this.articles.size,
      lastUpdated: new Date(this.lastUpdated).toISOString(),
      categoriesLoaded: this.categoriesLoaded,
      source: 'inshorts_live',
      pollingIntervalMinutes: 10,
    };
  }

  public getAllArticles(): NewsArticle[] {
    return Array.from(this.articles.values()).sort(
      (a, b) => b.publishedTimestamp - a.publishedTimestamp
    );
  }

  public getArticleById(id: string): NewsArticle | undefined {
    // Match by direct ID or hashId
    for (const article of this.articles.values()) {
      if (article.id === id || article.hashId === id) {
        return article;
      }
    }
    return undefined;
  }

  public getArticles(
    category?: NewsCategory | 'all',
    lang: Language = 'en',
    page: number = 1,
    limit: number = 15
  ): { articles: NewsArticle[]; total: number; hasMore: boolean } {
    let list = this.getAllArticles().filter((a) => a.lang === lang);

    if (category && category !== 'all') {
      list = list.filter((a) => a.category === category);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      articles: paginated,
      total,
      hasMore: startIndex + limit < total,
    };
  }

  public getTrending(lang: Language = 'en', limit: number = 6): NewsArticle[] {
    const list = this.getAllArticles().filter((a) => a.lang === lang);
    const trending = list.filter((a) => a.isTrending);
    if (trending.length >= limit) return trending.slice(0, limit);
    // Fill with top stories
    const others = list.filter((a) => !a.isTrending);
    return [...trending, ...others].slice(0, limit);
  }

  public getBreaking(lang: Language = 'en', limit: number = 5): NewsArticle[] {
    const list = this.getAllArticles().filter((a) => a.lang === lang);
    const breaking = list.filter((a) => a.isBreaking);
    if (breaking.length > 0) return breaking.slice(0, limit);
    return list.slice(0, limit);
  }

  public search(
    query: string,
    category?: NewsCategory | 'all',
    lang: Language = 'en'
  ): NewsArticle[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    let list = this.getAllArticles().filter((a) => a.lang === lang);

    if (category && category !== 'all') {
      list = list.filter((a) => a.category === category);
    }

    return list.filter((a) => {
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      const matchAuthor = a.author.toLowerCase().includes(q);
      const matchSource = a.sourceName.toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor || matchSource;
    });
  }

  // Deduplicate and insert articles into memory
  public upsertArticles(newArticles: NewsArticle[]) {
    let addedCount = 0;
    for (const item of newArticles) {
      // Find existing by hashId or matching title (case-insensitive dedupe)
      let existingId: string | null = null;
      for (const [id, existing] of this.articles.entries()) {
        if (
          (item.hashId && existing.hashId === item.hashId) ||
          existing.title.toLowerCase() === item.title.toLowerCase()
        ) {
          existingId = id;
          break;
        }
      }

      if (existingId) {
        // Update existing article with fresh data
        this.articles.set(existingId, {
          ...this.articles.get(existingId)!,
          ...item,
          id: existingId,
        });
      } else {
        this.articles.set(item.id, item);
        addedCount++;
      }

      const catKey = `${item.lang}:${item.category}`;
      this.categoriesLoaded[catKey] = (this.categoriesLoaded[catKey] || 0) + 1;
    }

    if (addedCount > 0 || newArticles.length > 0) {
      this.lastUpdated = Date.now();
    }
  }

  // Polling scheduler
  public startPolling(intervalMinutes: number = 10) {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(() => {
      console.log(`[Ingestion] Starting scheduled news poll (${intervalMinutes}m interval)...`);
      this.ingestAll().catch((err) => console.error('[Ingestion] Poll error:', err));
    }, intervalMinutes * 60 * 1000);
  }

  public async ingestAll(): Promise<{ success: boolean; totalAdded: number }> {
    if (this.isIngesting) {
      return { success: false, totalAdded: 0 };
    }
    this.isIngesting = true;
    let totalAdded = 0;

    try {
      const languages: Language[] = ['en', 'hi'];

      for (const lang of languages) {
        // 1. Fetch top stories API endpoint first
        try {
          const topApiArticles = await fetchInshortsApi('top_stories', lang);
          if (topApiArticles.length > 0) {
            this.upsertArticles(topApiArticles);
            totalAdded += topApiArticles.length;
          }
        } catch (e) {
          console.warn(`[Ingestion] Inshorts API top_stories for ${lang} notice:`, (e as Error).message);
        }

        // 2. Fetch category feeds
        const categories: NewsCategory[] = [
          'top_stories',
          'national',
          'world',
          'business',
          'sports',
          'entertainment',
          'technology',
          'science',
          'miscellaneous',
        ];

        for (const cat of categories) {
          const topics = CATEGORY_TOPIC_MAP[cat];
          for (const topic of topics) {
            try {
              const scraped = await fetchInshortsTopicHtml(topic, cat, lang);
              if (scraped.length > 0) {
                this.upsertArticles(scraped);
                totalAdded += scraped.length;
              }
            } catch (err) {
              // Graceful log without breaking loop
              console.warn(`[Ingestion] Topic ${topic} (${lang}) scrape error:`, (err as Error).message);
            }
          }
        }
      }
    } finally {
      this.isIngesting = false;
    }

    return { success: true, totalAdded };
  }
}

export const newsStore = new NewsStorage();

// Fetch from inshorts API endpoint (JSON)
async function fetchInshortsApi(category: string, lang: Language): Promise<NewsArticle[]> {
  const url = `https://inshorts.com/api/${lang}/news?category=${category}&max_limit=15&include_card_data=true`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Inshorts API responded with status ${res.status}`);
  }

  const data = await res.json();
  const list = data?.data?.news_list || [];
  const articles: NewsArticle[] = [];

  for (let i = 0; i < list.length; i++) {
    const obj = list[i]?.news_obj;
    if (!obj || !obj.title || !obj.content) continue;

    const hashId = obj.hash_id || obj.old_hash_id || `api-${lang}-${Date.now()}-${i}`;
    const id = `inshorts-${lang}-${hashId}`;

    articles.push({
      id,
      hashId,
      title: cleanText(obj.title),
      content: cleanText(obj.content),
      author: cleanText(obj.author_name || 'DeshX Bureau'),
      imageUrl: obj.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
      sourceName: cleanText(obj.source_name || 'Original Publisher'),
      sourceUrl: obj.source_url || '',
      readMoreUrl: obj.source_url || obj.shortened_url || 'https://news.google.com',
      publishedDate: new Date(obj.created_at || Date.now()).toISOString(),
      publishedTimestamp: obj.created_at || Date.now(),
      category: 'top_stories',
      lang,
      fetchedAt: new Date().toISOString(),
      isTrending: i < 3,
      isBreaking: i === 0,
    });
  }

  return articles;
}

// Fetch and parse Inshorts Topic Read HTML page
async function fetchInshortsTopicHtml(
  topic: string,
  category: NewsCategory,
  lang: Language
): Promise<NewsArticle[]> {
  const url = `https://inshorts.com/${lang}/read/${topic}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!res.ok) {
    throw new Error(`Inshorts Topic HTML responded with status ${res.status}`);
  }

  const html = await res.text();
  const articles: NewsArticle[] = [];

  // Split by <article>
  const articleBlocks = html.split('<article');

  for (let i = 1; i < articleBlocks.length; i++) {
    const block = articleBlocks[i];

    // Headline
    const headlineMatch = block.match(/itemProp="headline"[^>]*>(.*?)<\/span>/i);
    const title = headlineMatch ? cleanText(headlineMatch[1]) : '';
    if (!title) continue;

    // Body (~60 words)
    const bodyMatch = block.match(/itemProp="articleBody"[^>]*>(.*?)<\/div>/i);
    const content = bodyMatch ? cleanText(bodyMatch[1]) : '';
    if (!content) continue;

    // Author
    const authorMatch = block.match(/<span class="author"[^>]*>(.*?)<\/span>/i);
    const author = authorMatch ? cleanText(authorMatch[1]) : 'DeshX Bureau';

    // Image URL
    let imageUrl = '';
    const imgMetaMatch = block.match(/<meta itemProp="url" content="(.*?)"/i);
    if (imgMetaMatch) {
      imageUrl = imgMetaMatch[1];
    } else {
      const bgMatch = block.match(/background-image:\s*url\((.*?)\)/i);
      if (bgMatch) {
        imageUrl = bgMatch[1].replace(/['"]/g, '');
      }
    }
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80';
    }

    // Published Date
    const dateMatch = block.match(/itemProp="datePublished" content="(.*?)"/i);
    const datePublishedStr = dateMatch ? dateMatch[1] : '';
    const publishedTimestamp = datePublishedStr ? new Date(datePublishedStr).getTime() : Date.now() - i * 15 * 60 * 1000;
    const publishedDate = new Date(publishedTimestamp).toISOString();

    // Source Read More URL & Name
    let readMoreUrl = '';
    let sourceName = 'Original Publisher';

    const sourceMatch = block.match(/read more at\s*<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/i);
    if (sourceMatch) {
      readMoreUrl = sourceMatch[1].replace(/&amp;/g, '&');
      sourceName = cleanText(sourceMatch[2]) || 'Source';
    }

    // Unique ID
    const itemIdMatch = block.match(/itemID="(.*?)"/i);
    const rawUrl = itemIdMatch ? itemIdMatch[1] : '';
    const slug = rawUrl ? rawUrl.split('/').pop() || '' : '';
    const hashId = slug || slugify(title);
    const id = `inshorts-${lang}-${hashId}`;

    articles.push({
      id,
      hashId,
      title,
      content,
      author,
      imageUrl,
      sourceName,
      sourceUrl: readMoreUrl,
      readMoreUrl: readMoreUrl || 'https://news.google.com',
      publishedDate,
      publishedTimestamp,
      category,
      lang,
      fetchedAt: new Date().toISOString(),
      isTrending: i < 3 && category === 'top_stories',
      isBreaking: i === 1 && category === 'top_stories',
    });
  }

  return articles;
}

function cleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

// Indian Financial Market Indices Pulse
export function getMarketPulse(): MarketItem[] {
  return [
    { symbol: 'SENSEX', name: 'BSE Sensex', value: '82,864.20', change: '+468.10 (+0.57%)', isPositive: true },
    { symbol: 'NIFTY 50', name: 'NSE Nifty', value: '25,248.85', change: '+142.30 (+0.56%)', isPositive: true },
    { symbol: 'BANK NIFTY', name: 'Nifty Bank', value: '52,190.40', change: '+380.20 (+0.73%)', isPositive: true },
    { symbol: 'USD/INR', name: 'US Dollar', value: '₹83.68', change: '-0.04 (-0.05%)', isPositive: true },
    { symbol: 'GOLD 24K', name: 'Gold 10g', value: '₹76,520', change: '+₹210 (+0.27%)', isPositive: true },
    { symbol: 'CRUDE OIL', name: 'Brent Crude', value: '$74.12', change: '-$0.85 (-1.13%)', isPositive: false },
  ];
}

// Major Indian Cities Weather
export function getMajorCitiesWeather(): WeatherItem[] {
  return [
    { city: 'New Delhi', temp: '29°C', condition: 'Sunny', icon: 'sun' },
    { city: 'Mumbai', temp: '28°C', condition: 'Humid Breeze', icon: 'cloud' },
    { city: 'Bengaluru', temp: '24°C', condition: 'Pleasant', icon: 'cloud-sun' },
    { city: 'Kolkata', temp: '30°C', condition: 'Partly Cloudy', icon: 'cloud-sun' },
    { city: 'Chennai', temp: '31°C', condition: 'Warm', icon: 'sun' },
    { city: 'Hyderabad', temp: '27°C', condition: 'Clear', icon: 'sun' },
  ];
}
