'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'id', name: 'ID', flag: '🇮🇩' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'de', name: 'DE', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-brand-blue bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 active:scale-95"
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <span className="font-semibold text-xs tracking-wide">{currentLanguage.name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-250">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-brand-blue-light/50 transition-colors ${
                locale === lang.code ? 'text-brand-blue font-bold bg-brand-blue-light/40' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
