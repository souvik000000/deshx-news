import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  type: 'banner' | 'native' | 'sidebar' | '300x250' | '468x60' | '160x600';
  className?: string;
}

/**
 * Banner 300x250 Ad Component
 * Key: 6a02a1e301eec66a0277d7f198600d12
 * Source: https://www.highrevenueformat.com/6a02a1e301eec66a0277d7f198600d12/invoke.js
 */
export const Banner300x250Ad: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '300';
    iframe.height = '250';
    iframe.title = 'Advertisement 300x250';
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '300px';
    iframe.style.height = '250px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';

    container.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: transparent;
                  overflow: hidden;
                  width: 300px;
                  height: 250px;
                }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '6a02a1e301eec66a0277d7f198600d12',
                  'format' : 'iframe',
                  'height' : 250,
                  'width' : 300,
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://www.highrevenueformat.com/6a02a1e301eec66a0277d7f198600d12/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Could not initialize 300x250 ad iframe:', err);
    }
  }, []);

  return (
    <div
      id="ad-slot-sidebar-300x250"
      className={`w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[290px] relative overflow-hidden shadow-xs transition-colors ${className}`}
    >
      <div className="w-full flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
        <span>Sponsored</span>
        <span>Adsterra 300x250</span>
      </div>

      <div
        ref={containerRef}
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] flex items-center justify-center relative bg-neutral-200/50 dark:bg-neutral-800/40 rounded-lg overflow-hidden"
      >
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 absolute pointer-events-none">
          Advertisement (300x250)
        </span>
      </div>
    </div>
  );
};

/**
 * Banner 468x60 Ad Component
 * Key: eaf8ae26c56a5d0b845eb49ea811f667
 * Source: https://www.highrevenueformat.com/eaf8ae26c56a5d0b845eb49ea811f667/invoke.js
 */
export const Banner468x60Ad: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '468';
    iframe.height = '60';
    iframe.title = 'Advertisement 468x60';
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '468px';
    iframe.style.height = '60px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';

    container.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: transparent;
                  overflow: hidden;
                  width: 468px;
                  height: 60px;
                }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : 'eaf8ae26c56a5d0b845eb49ea811f667',
                  'format' : 'iframe',
                  'height' : 60,
                  'width' : 468,
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://www.highrevenueformat.com/eaf8ae26c56a5d0b845eb49ea811f667/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Could not initialize 468x60 ad iframe:', err);
    }
  }, []);

  return (
    <div
      id="ad-slot-banner-468x60"
      className={`w-full my-3 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-[480px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-xs transition-colors">
        <div className="w-full flex items-center justify-between text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium px-2 pb-1">
          <span>Sponsored</span>
          <span>Adsterra 468x60</span>
        </div>

        <div
          ref={containerRef}
          className="w-[468px] max-w-full h-[60px] flex items-center justify-center relative bg-neutral-200/50 dark:bg-neutral-800/40 rounded overflow-hidden"
        >
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 absolute pointer-events-none">
            Advertisement (468x60)
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Banner 160x600 Wide Skyscraper Ad Component
 * Key: eaa4aa94b610be7d2b84028233d3fc9c
 * Source: https://www.highrevenueformat.com/eaa4aa94b610be7d2b84028233d3fc9c/invoke.js
 */
export const Banner160x600Ad: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '160';
    iframe.height = '600';
    iframe.title = 'Advertisement 160x600';
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '160px';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';

    container.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: transparent;
                  overflow: hidden;
                  width: 160px;
                  height: 600px;
                }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : 'eaa4aa94b610be7d2b84028233d3fc9c',
                  'format' : 'iframe',
                  'height' : 600,
                  'width' : 160,
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://www.highrevenueformat.com/eaa4aa94b610be7d2b84028233d3fc9c/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Could not initialize 160x600 ad iframe:', err);
    }
  }, []);

  return (
    <div
      id="ad-slot-skyscraper-160x600"
      className={`w-full max-w-[200px] mx-auto bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[640px] relative overflow-hidden shadow-xs transition-colors ${className}`}
    >
      <div className="w-full flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
        <span>Sponsored</span>
        <span>Adsterra 160x600</span>
      </div>

      <div
        ref={containerRef}
        className="w-[160px] h-[600px] min-w-[160px] min-h-[600px] flex items-center justify-center relative bg-neutral-200/50 dark:bg-neutral-800/40 rounded overflow-hidden"
      >
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 absolute pointer-events-none text-center px-2">
          Advertisement (160x600)
        </span>
      </div>
    </div>
  );
};

/**
 * Native Banner Ad Component
 * Container ID: container-c62c852beecacb2923b91a56b9c82a6f
 * Script: https://pl31370387.profitableratecpmnetwork.com/c62c852beecacb2923b91a56b9c82a6f/invoke.js
 */
export const NativeBannerAd: React.FC<{
  className?: string;
  useIframe?: boolean;
}> = ({ className = '', useIframe = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (useIframe) {
      container.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '110';
      iframe.title = 'Native Banner Advertisement';
      iframe.setAttribute('frameBorder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.style.width = '100%';
      iframe.style.minHeight = '100px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';

      container.appendChild(iframe);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  * { box-sizing: border-box; }
                  body {
                    margin: 0;
                    padding: 4px;
                    background: transparent;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: system-ui, -apple-system, sans-serif;
                  }
                  #container-c62c852beecacb2923b91a56b9c82a6f {
                    width: 100%;
                    min-height: 90px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  }
                </style>
              </head>
              <body>
                <div id="container-c62c852beecacb2923b91a56b9c82a6f"></div>
                <script async="async" data-cfasync="false" src="https://pl31370387.profitableratecpmnetwork.com/c62c852beecacb2923b91a56b9c82a6f/invoke.js"></script>
              </body>
            </html>
          `);
          doc.close();
        }
      } catch (err) {
        console.warn('Could not initialize native banner iframe:', err);
      }
    } else {
      // Direct DOM injection
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src =
        'https://pl31370387.profitableratecpmnetwork.com/c62c852beecacb2923b91a56b9c82a6f/invoke.js';

      container.appendChild(script);

      return () => {
        try {
          if (container.contains(script)) {
            container.removeChild(script);
          }
        } catch {}
      };
    }
  }, [useIframe]);

  return (
    <div
      id="ad-slot-native-banner"
      className={`w-full my-3 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-[728px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-xs transition-colors">
        <div className="w-full flex items-center justify-between text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium px-2 pb-1">
          <span>Sponsored</span>
          <span>Native Banner • High CPM</span>
        </div>

        {useIframe ? (
          <div ref={containerRef} className="w-full min-h-[90px] flex items-center justify-center" />
        ) : (
          <div className="w-full min-h-[90px] flex items-center justify-center relative">
            <div
              id="container-c62c852beecacb2923b91a56b9c82a6f"
              ref={containerRef}
              className="w-full min-h-[90px] flex items-center justify-center"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Universal AdUnit Component supporting banner, sidebar, 300x250, 468x60, 160x600, and in-feed native
 */
export const AdUnit: React.FC<AdUnitProps> = ({ type, className = '' }) => {
  if (type === 'sidebar' || type === '300x250') {
    return <Banner300x250Ad className={className} />;
  }

  if (type === '468x60') {
    return <Banner468x60Ad className={className} />;
  }

  if (type === '160x600') {
    return <Banner160x600Ad className={className} />;
  }

  if (type === 'banner') {
    // Native Banner ad placed at top leaderboard section
    return <NativeBannerAd className={className} useIframe={false} />;
  }

  // Native In-Feed Ad (Placed every 4-5 cards in feed or in article modal)
  return (
    <article
      id="ad-slot-native-feed"
      className={`bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs p-3 sm:p-4 flex flex-col justify-between transition-colors ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
        <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
          Sponsored By Adsterra
        </span>
        <span className="text-neutral-400 dark:text-neutral-500">Native In-Feed Ad</span>
      </div>

      {/* Render the Native Banner inside an isolated frame for feed safety */}
      <NativeBannerAd useIframe={true} className="my-0" />
    </article>
  );
};
