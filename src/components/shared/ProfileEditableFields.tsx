'use client';

import { useLocale } from '@/components/providers/LocaleProvider';

interface ProfileEditableFieldsProps {
  nama: string;
  onNamaChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  noWhatsapp: string;
  onNoWhatsappChange: (v: string) => void;
}

const INP = 'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm transition';

export default function ProfileEditableFields({
  nama, onNamaChange,
  email, onEmailChange,
  noWhatsapp, onNoWhatsappChange,
}: ProfileEditableFieldsProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-4 pb-5 border-b border-gray-100">
      <p className="text-xs text-gray-400 italic">
        Your profile details (editable)
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('shared.profileEditableFields.fullName')}</label>
        <input value={nama} onChange={e => onNamaChange(e.target.value)} className={INP} placeholder={t('shared.profileEditableFields.fullNamePlaceholder')} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.email')}</label>
        <input type="email" value={email} onChange={e => onEmailChange(e.target.value)} className={INP} placeholder={t('shared.profileEditableFields.emailPlaceholder')} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('shared.profileEditableFields.whatsappNumber')}</label>
        <input value={noWhatsapp} onChange={e => onNoWhatsappChange(e.target.value)} className={INP} placeholder={t('shared.profileEditableFields.whatsappPlaceholder')} />
      </div>
    </div>
  );
}
