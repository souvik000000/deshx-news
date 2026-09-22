import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { newsStore, getMarketPulse, getMajorCitiesWeather } from './server/ingestion';
import { Language, NewsCategory } from './server/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for local/cross-origin safety
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'DeshX API',
      timestamp: new Date().toISOString(),
    });
  });

  // Category-wise News Feed
  app.get('/api/feed', (req, res) => {
    try {
      const category = (req.query.category as string) || 'top_stories';
      const lang = ((req.query.lang as string) === 'hi' ? 'hi' : 'en') as Language;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 15;

      const result = newsStore.getArticles(
        category as NewsCategory | 'all',
        lang,
        page,
        limit
      );
      const stats = newsStore.getStats();

      res.json({
        success: true,
        category,
        lang,
        page,
        limit,
        ...result,
        lastUpdated: stats.lastUpdated,
      });
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve news feed' });
    }
  });

  // Single Article View (opens within DeshX)
  app.get('/api/article/:id', (req, res) => {
    try {
      const id = req.params.id;
      const article = newsStore.getArticleById(id);

      if (!article) {
        res.status(404).json({ success: false, error: 'Article not found' });
        return;
      }

      // Fetch 4 related articles in same category
      const related = newsStore
        .getAllArticles()
        .filter((a) => a.category === article.category && a.id !== article.id && a.lang === article.lang)
        .slice(0, 4);

      res.json({
        success: true,
        article,
        related,
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve article' });
    }
  });

  // Trending stories
  app.get('/api/trending', (req, res) => {
    try {
      const lang = ((req.query.lang as string) === 'hi' ? 'hi' : 'en') as Language;
      const limit = parseInt(req.query.limit as string, 10) || 6;
      const trending = newsStore.getTrending(lang, limit);

      res.json({
        success: true,
        lang,
        articles: trending,
      });
    } catch (error) {
      console.error('Error fetching trending:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve trending stories' });
    }
  });

  // Breaking headlines ticker
  app.get('/api/breaking', (req, res) => {
    try {
      const lang = ((req.query.lang as string) === 'hi' ? 'hi' : 'en') as Language;
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const breaking = newsStore.getBreaking(lang, limit);

      res.json({
        success: true,
        lang,
        headlines: breaking,
      });
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve breaking news' });
    }
  });

  // Keyword search across title, content, author, source
  app.get('/api/search', (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const category = (req.query.category as string) || 'all';
      const lang = ((req.query.lang as string) === 'hi' ? 'hi' : 'en') as Language;

      const results = newsStore.search(
        query,
        category as NewsCategory | 'all',
        lang
      );

      res.json({
        success: true,
        query,
        count: results.length,
        articles: results,
      });
    } catch (error) {
      console.error('Error executing search:', error);
      res.status(500).json({ success: false, error: 'Failed to execute search' });
    }
  });

  // Financial Market Pulse (Sensex, Nifty, Currency, Gold)
  app.get('/api/market', (req, res) => {
    res.json({
      success: true,
      data: getMarketPulse(),
      timestamp: new Date().toISOString(),
    });
  });

  // Indian Cities Weather
  app.get('/api/weather', (req, res) => {
    res.json({
      success: true,
      data: getMajorCitiesWeather(),
      timestamp: new Date().toISOString(),
    });
  });

  // Ingestion system stats & trigger
  app.get('/api/stats', (req, res) => {
    res.json({
      success: true,
      ...newsStore.getStats(),
    });
  });

  // Trigger manual refresh / poll
  app.post('/api/refresh', async (req, res) => {
    try {
      const result = await newsStore.ingestAll();
      const stats = newsStore.getStats();
      res.json({
        success: true,
        message: `Ingestion finished. Added/updated ${result.totalAdded} stories.`,
        stats,
      });
    } catch (error) {
      console.error('Error during manual refresh:', error);
      res.status(500).json({ success: false, error: 'Refresh failed' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeshX News Server running on http://localhost:${PORT}`);
  });
}

startServer();
