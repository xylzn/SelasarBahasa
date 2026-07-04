'use client';

import { BookOpen, Award, Users, CheckCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function AboutSection() {
  const { t } = useLocale();

  const features = [
    {
      icon: BookOpen,
      title: t('about.features.materi.title'),
      description: t('about.features.materi.desc'),
      colorClass: 'bg-brand-blue-light text-brand-blue',
    },
    {
      icon: Award,
      title: t('about.features.sertifikat.title'),
      description: t('about.features.sertifikat.desc'),
      colorClass: 'bg-brand-orange-light text-brand-orange',
    },
    {
      icon: Users,
      title: t('about.features.komunitas.title'),
      description: t('about.features.komunitas.desc'),
      colorClass: 'bg-green-50 text-green-600',
    },
    {
      icon: CheckCircle,
      title: t('about.features.quiz.title'),
      description: t('about.features.quiz.desc'),
      colorClass: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-brand-blue-light/20" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 reveal">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-blue-dark mb-4">
            {t('about.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t('about.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 reveal"
              >
                <div className={`w-14 h-14 ${feature.colorClass} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-blue-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
