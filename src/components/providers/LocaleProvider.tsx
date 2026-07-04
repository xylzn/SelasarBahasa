'use client';

import React, { createContext, useContext, useTransition } from 'react';

type Dictionary = Record<string, any>;

interface LocaleContextProps {
  locale: string;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export function LocaleProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: string;
  dictionary: Dictionary;
}) {
  const [isPending, startTransition] = useTransition();

  // Helper to resolve nested keys like about.features.materi.title
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = dictionary;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (replacements) {
      let resolved = value;
      Object.entries(replacements).forEach(([placeholder, val]) => {
        resolved = resolved.replace(`{${placeholder}}`, String(val));
      });
      return resolved;
    }

    return value;
  };

  const setLocale = (newLocale: string) => {
    // Set the cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    
    // Refresh page to load new server components and client dictionaries
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
