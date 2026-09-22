import React from 'react';
import { ArrowUp, ShieldCheck, ExternalLink, Heart } from 'lucide-react';
import { NewsCategory, Language } from '../types';
import { CATEGORIES } from '../utils/constants';

interface FooterProps {
  lang: Language;
  onSelectCategory: (cat: NewsCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onSelectCategory }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="deshx-main-footer" className="w-full bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Desh<span className="text-rose-500 font-serif italic">X</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {lang === 'hi'
                ? 'देशX भारत का अग्रणी मुफ़्त समाचार एग्रीगेटर है, जो शीर्ष राष्ट्रीय, वैश्विक, व्यापारिक और खेल समाचारों को 60 शब्दों के संक्षिप्त स्वरूप में प्रस्तुत करता है।'
                : 'DeshX is India’s premier free short-form news aggregator, delivering 60-word bite-sized summaries across national, business, sports, and technology in English and Hindi.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free • No Subscription or Paywall</span>
            </div>
          </div>

          {/* Column 2: Categories (1-5) */}
          <div>
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-3">
              {lang === 'hi' ? 'समाचार श्रेणियां (भाग 1)' : 'News Categories'}
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      scrollToTop();
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {lang === 'hi' ? cat.nameHi : cat.nameEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories (6-9) */}
          <div>
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-3">
              {lang === 'hi' ? 'अन्य विषय' : 'More Topics'}
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      scrollToTop();
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {lang === 'hi' ? cat.nameHi : cat.nameEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Aggregator Legal & Source Policy */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-3">
              {lang === 'hi' ? 'एग्रीगेशन नीति' : 'Publisher Attribution'}
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              DeshX aggregates and formats publicly accessible news bytes inspired by the Inshorts standard. Original article copyrights and full reporting belong exclusively to respective news agencies and media houses.
            </p>
            <p className="text-[11px] text-neutral-500">
              Monetized sustainably via Adsterra native ads with zero subscription fees for readers.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1">
            <span>© 2026 DeshX Media. Built for Indian readers nationwide.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors p-1"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
