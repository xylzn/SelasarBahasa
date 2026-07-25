type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export const translateTipeKelas = (
  code: string,
  t: TFunction
): string => {
  return t(`common.enums.tipeKelas.${code}`);
};

export const translateTingkatBipa = (
  code: string,
  t: TFunction
): string => {
  return t(`common.enums.tingkatBipa.${code}`);
};

export const translateKelasStatus = (
  code: string,
  t: TFunction
): string => {
  return t(`common.enums.kelasStatus.${code}`);
};

export const getIntlLocale = (locale: string): string => {
  switch (locale) {
    case 'id':
      return 'id-ID';
    case 'en':
      return 'en-GB';
    case 'de':
      return 'de-DE';
    default:
      return 'en-GB';
  }
};

export const formatDate = (
  date: Date | string | number,
  locale: string,
  opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getIntlLocale(locale), opts).format(d);
};

export const formatDateTime = (
  date: Date | string | number,
  locale: string
): string => {
  return formatDate(date, locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
