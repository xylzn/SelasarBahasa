'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, FileText, Video, HelpCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface SearchResult {
  id: string;
  judul: string;
  slug: string;
  kelas: string;
  tipe?: 'TEKS' | 'VIDEO';
}

interface SearchResults {
  materi: SearchResult[];
  tugas: SearchResult[];
  quiz: { id: string; judul: string; kelas: string }[];
}

export default function SearchBar() {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={t('shared.searchBar.placeholder')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && (results || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">{t('shared.searchBar.searching')}</div>
          )}
          
          {!isLoading && results && (
            <div className="divide-y divide-gray-100">
              {results.materi.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('shared.searchBar.materi')}</h4>
                  {results.materi.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/kelas/${item.kelas.toLowerCase()}/${(item.tipe || 'TEKS').toLowerCase()}/${item.slug}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition"
                    >
                      {item.tipe === 'VIDEO' ? <Video size={18} className="text-gray-400" /> : <FileText size={18} className="text-gray-400" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.judul}</p>
                        <p className="text-xs text-gray-500">{item.kelas}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.tugas.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('shared.searchBar.tugas')}</h4>
                  {results.tugas.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/kelas/${item.kelas.toLowerCase()}/tugas/${item.slug}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition"
                    >
                      <FileText size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.judul}</p>
                        <p className="text-xs text-gray-500">{item.kelas}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.quiz.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('shared.searchBar.quiz')}</h4>
                  {results.quiz.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/quiz/${item.id}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition"
                    >
                      <HelpCircle size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.judul}</p>
                        <p className="text-xs text-gray-500">{item.kelas}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.materi.length === 0 && results.tugas.length === 0 && results.quiz.length === 0 && (
                <div className="p-4 text-center text-gray-500">{t('shared.searchBar.noResults')}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
