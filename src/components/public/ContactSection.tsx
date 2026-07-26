'use client';

import Image from 'next/image';
import { Phone, Clock, Mail } from 'lucide-react';
import ContactForm from './ContactForm';
import { useLocale } from '@/components/providers/LocaleProvider';

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  PLACEHOLDER DATA — ganti dengan data asli sebelum production
//     Cari string "GANTI" di file ini untuk menemukan semua yang perlu diisi
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon: Phone,
    title: 'Call & WhatsApp',
    // GANTI DENGAN NOMOR ASLI ↓
    detail: '+62 8XX-XXXX-XXXX — GANTI DENGAN NOMOR ASLI',
    isPlaceholder: true,
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    // GANTI DENGAN JAM OPERASIONAL ASLI ↓
    detail: 'Senin–Jumat, 09.00–17.00 WIB — GANTI DENGAN JAM OPERASIONAL ASLI',
    isPlaceholder: true,
  },
  {
    icon: Mail,
    title: 'Tulis ke Kami',
    // GANTI DENGAN EMAIL ASLI ↓
    detail: 'hello@example.com — GANTI DENGAN EMAIL ASLI',
    isPlaceholder: true,
  },
];

export default function ContactSection() {
  const { t } = useLocale();
  return (
    <section className="py-20 bg-gray-50" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section heading ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-2">
          <div>
            <span className="inline-block bg-brand-blue-light text-brand-blue text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-3">
              {t('publicPages.contactSection.eyebrow')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {t('publicPages.contactSection.headingPrefix')}{' '}
              <span className="text-brand-blue">{t('publicPages.contactSection.title')}</span>
            </h2>
          </div>
          <p className="text-gray-500 md:text-right max-w-xs text-sm leading-relaxed">
            {t('publicPages.contactSection.subtitle')}
          </p>
        </div>

        {/* ── Main card: form kiri + ilustrasi kanan ──────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/*
            Mobile:  flex-col — ilustrasi DI ATAS (flex-col-reverse agar ilustrasi
                     yang ditulis belakangan tetap muncul di atas di mobile),
            Desktop: flex-row — form kiri, ilustrasi kanan
          */}
          <div className="flex flex-col-reverse md:flex-row">

            {/* Form — kiri (desktop) / bawah (mobile) */}
            <div className="flex-1 p-8 md:p-12">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('publicPages.contactSection.sendMessage')}</h3>
              <p className="text-sm text-gray-400 mb-7">
                {t('publicPages.contactSection.formDesc')}
              </p>
              <ContactForm />
            </div>

            {/* Ilustrasi — kanan (desktop) / atas (mobile) */}
            <div className="relative md:w-[42%] bg-gradient-to-br from-brand-blue-light/60 to-white flex items-center justify-center p-8 md:p-10 min-h-[260px]">
              {/* Decorative blob */}
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 w-40 h-40 bg-brand-orange-light rounded-full blur-2xl opacity-50 -translate-y-1/3 translate-x-1/3 pointer-events-none"
              />

              <div className="relative z-10 w-full max-w-xs">
                {/*
                  ── ILUSTRASI ──────────────────────────────────────────────
                  File: public/images/contact-illustration.svg
                  Kalau gambar tidak muncul (broken), cek / ganti file di:
                    public/images/contact-illustration.svg   (atau .png)
                  Lalu update src di bawah ini sesuai ekstensi yang benar.
                  ──────────────────────────────────────────────────────────
                */}
                <Image
                  src="/images/contact-illustration.svg"
                  alt={t('publicPages.contactSection.illustrationAlt')}
                  width={420}
                  height={360}
                  className="w-full h-auto drop-shadow-sm"
                  priority={false}
                />

                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 bg-brand-blue text-white text-xs font-semibold rounded-2xl px-4 py-2.5 shadow-lg shadow-brand-blue/20 flex items-center gap-2">
                  <span className="text-base">🎓</span>
                  <span>{t('publicPages.contactSection.learnWithUs')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3 kolom info kontak ─────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CONTACT_INFO.map(({ icon: Icon, title, detail, isPlaceholder }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3"
            >
              {/* Icon bulat */}
              <div className="w-12 h-12 rounded-full border-2 border-brand-blue/20 bg-brand-blue-light flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-brand-blue" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{title}</p>
              {/*
                isPlaceholder — teks berwarna oranye italic supaya jelas perlu diganti.
                Setelah data asli diisi di konstanta CONTACT_INFO di atas file ini,
                hapus prop isPlaceholder (atau set false) untuk styling normal.
              */}
              <p
                className={`text-xs leading-relaxed ${
                  isPlaceholder
                    ? 'text-brand-orange italic font-medium'
                    : 'text-gray-500'
                }`}
              >
                {detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
