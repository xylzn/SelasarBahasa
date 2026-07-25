'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="bg-gray-50 border-t border-gray-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-brand-blue mb-4">{t('common.brandName')}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {t('footer.desc')}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-brand-blue-dark mb-4 text-sm uppercase tracking-wider">{t('footer.menu')}</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="/" className="hover:text-brand-orange transition-colors font-medium">
                  {t('navbar.home')}
                </a>
              </li>
              <li>
                <a href="/artikel" className="hover:text-brand-orange transition-colors font-medium">
                  {t('navbar.articles')}
                </a>
              </li>
              <li>
                <a href="/#packages" className="hover:text-brand-orange transition-colors font-medium">
                  {t('footer.menu')} - {t('sidebar.packages')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-brand-blue-dark mb-4 text-sm uppercase tracking-wider">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>{t('publicPages.footer.emailContact')}</li>
              <li>{t('publicPages.footer.whatsappContact')}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} {t('common.brandName')}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
