'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import ProfileEditableFields from '@/components/shared/ProfileEditableFields';
import ClassInfoPanel from '@/components/dashboard/registration/ClassInfoPanel';
import { useLocale } from '@/components/providers/LocaleProvider';

interface KelasOption { id: string; tingkat: string; nama: string; _count: { enrollments: number }; minKuota: number }
interface Profile { nama: string; email: string; noWhatsapp: string | null }

const SEL = 'w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm';
const INP = SEL;

const ABILITY_OPTIONS = ['None', 'Beginner', 'Intermediate'];
const LEVEL_OPTIONS = ['Not Sure (needs placement test)', 'Level 1', 'Level 2', 'Level 3', 'Level 4'];
const CLASS_OPTIONS = ['Onsite', 'Online'];
const HOUR_OPTIONS = ['10.00–11.00 WIB', '13.00–14.00 WIB', '15.00–16.00 WIB'];

const AGE_CATEGORIES = [
  { value: 'Class A (5–10 years)', label: 'Class A — 5 to 10 years old' },
  { value: 'Class B (11–15 years)', label: 'Class B — 11 to 15 years old' },
  { value: 'Class C (16–18 years)', label: 'Class C — 16 to 18 years old' },
];

function getAutoCategory(age: number): string {
  if (age >= 5 && age <= 10) return 'Class A (5–10 years)';
  if (age >= 11 && age <= 15) return 'Class B (11–15 years)';
  if (age >= 16 && age <= 18) return 'Class C (16–18 years)';
  return '';
}

// Convert "BIPA 1" → "Level 1"
function convertTingkatToPreferredLevel(tingkat: string): string {
  const match = tingkat.match(/BIPA\s*(\d)/i);
  if (match) return `Level ${match[1]}`;
  return tingkat;
}

export default function RegisterAnakPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileNama, setProfileNama] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileWa, setProfileWa] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [step1Saving, setStep1Saving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 2 fields
  const [childName, setChildName] = useState('');
  const [ability, setAbility] = useState('');
  const [preferredLevel, setPreferredLevel] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [preferredClass, setPreferredClass] = useState('');
  const [preferredHour, setPreferredHour] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [childAge, setChildAge] = useState<number | ''>('');
  const [kelasId, setKelasId] = useState('');
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/kelas-available?tipe=ANAK_REMAJA').then(r => r.json()).then(data => {
      setKelasList(data);
      // Apply kelasId from query after data is loaded
      const qKelasId = searchParams.get('kelasId');
      if (qKelasId && data.some((k: KelasOption) => k.id === qKelasId)) {
        setKelasId(qKelasId);
      }
    });
    fetch('/api/profile/me').then(r => r.json()).then((p: Profile) => {
      setProfile(p);
      setProfileNama(p.nama || '');
      setProfileEmail(p.email || '');
      setProfileWa(p.noWhatsapp || '');
    });

    // Apply preferredLevel from query
    const qPreferredLevel = searchParams.get('preferredLevel');
    if (qPreferredLevel) {
      const normalized = convertTingkatToPreferredLevel(qPreferredLevel);
      if (LEVEL_OPTIONS.includes(normalized)) {
        setPreferredLevel(normalized);
      } else if (LEVEL_OPTIONS.includes(qPreferredLevel)) {
        setPreferredLevel(qPreferredLevel);
      }
    }

    // Apply ability from query
    const qAbility = searchParams.get('ability');
    if (qAbility && ABILITY_OPTIONS.includes(qAbility)) {
      setAbility(qAbility);
    }
  }, [searchParams]);

  const handleStep1Continue = async () => {
    setStep1Error('');
    setStep1Saving(true);
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: profileNama, email: profileEmail, noWhatsapp: profileWa }),
    });
    setStep1Saving(false);
    if (!res.ok) {
      const d = await res.json();
      setStep1Error(d.error || t('registerPackage.common.profileSaveError'));
      return;
    }
    setStep(2);
  };

  // Auto-set category when age changes
  useEffect(() => {
    if (childAge !== '' && childAge >= 5) {
      setAgeCategory(getAutoCategory(Number(childAge)));
    }
  }, [childAge]);

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!childName.trim()) errs.childName = t('registerPackage.anak.childFullName');
    if (!ability) errs.ability = t('registerPackage.common.validAbility');
    if (!preferredLevel) errs.preferredLevel = t('registerPackage.common.validLevel');
    if (!ageCategory) errs.ageCategory = t('registerPackage.common.validAgeCategory');
    if (!preferredClass) errs.preferredClass = t('registerPackage.common.validClassType');
    if (!preferredHour) errs.preferredHour = t('registerPackage.common.validSchedule');
    if (!namaWali.trim()) errs.namaWali = t('registerPackage.anak.guardianFullName');
    if (childAge === '' || Number(childAge) < 5 || Number(childAge) > 18) errs.childAge = t('registerPackage.anak.childAge');
    if (!kelasId) errs.kelasId = t('registerPackage.common.validClass');
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitStatus('loading');
    const res = await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kelasId,
        namaWali,
        umurAnak: Number(childAge),
        namaAnak: childName,
        kemampuanBI: ability,
        preferredLevel,
        ageCategory,
        preferredClass,
        pilihanWaktuAnak: preferredHour,
      }),
    });
    if (res.ok) {
      setSubmitStatus('success');
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      const d = await res.json();
      setErrorMsg(d.error || t('registerPackage.common.registrationError'));
      setSubmitStatus('error');
      setStep(3);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <CheckCircle2 size={52} className="text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">{t('registerPackage.common.submittedTitle')}</h2>
          <p className="text-gray-500 text-sm">{t('registerPackage.common.redirecting')}</p>
        </div>
      </div>
    );
  }

  const selectedKelas = kelasList.find(k => k.id === kelasId);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">{t('registerPackage.anak.pageTitle')}</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              s < step ? 'bg-green-500 text-white' : s === step ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s < step ? '✓' : s}</div>
            <span className={`text-xs font-medium hidden sm:block ${s === step ? 'text-brand-blue' : 'text-gray-400'}`}>
              {s === 1 ? t('registerPackage.common.stepYourDetails') : s === 2 ? t('registerPackage.common.stepClassDetails') : t('registerPackage.common.stepReview')}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2"><ClassInfoPanel tipe="ANAK_REMAJA" /></div>

        <div className="lg:col-span-3">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{t('registerPackage.anak.step1Title')}</h2>
              <p className="text-sm text-gray-400 mb-6">{t('registerPackage.anak.step1DescGuardian')}</p>
              {profile
                ? <ProfileEditableFields
                    nama={profileNama} onNamaChange={setProfileNama}
                    email={profileEmail} onEmailChange={setProfileEmail}
                    noWhatsapp={profileWa} onNoWhatsappChange={setProfileWa}
                  />
                : <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />
              }
              {step1Error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle size={15} /> {step1Error}
                </div>
              )}
              <button onClick={handleStep1Continue} disabled={step1Saving}
                className="mt-6 w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {step1Saving ? t('registerPackage.common.saving') : <>{t('registerPackage.common.continue')} <ChevronRight size={16} /></>}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{t('registerPackage.anak.step2TitleFull')}</h2>
                <p className="text-sm text-gray-400">{t('registerPackage.anak.step2Desc')}</p>
              </div>

              {/* Child info */}
              <div className="pb-4 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t('registerPackage.anak.childInformation')}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.anak.childFullName')}</label>
                    <input type="text" value={childName} onChange={e => setChildName(e.target.value)} className={INP} placeholder={t('registerPackage.anak.childFullName')} />
                    {step2Errors.childName && <p className="text-xs text-red-600 mt-1">{step2Errors.childName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.anak.childAge')}</label>
                      <input type="number" min={5} max={18} value={childAge} onChange={e => setChildAge(Number(e.target.value))} className={INP} placeholder="5–18" />
                      {step2Errors.childAge && <p className="text-xs text-red-600 mt-1">{step2Errors.childAge}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.anak.ageCategory')}</label>
                      <select value={ageCategory} onChange={e => setAgeCategory(e.target.value)} className={SEL}>
                        <option value="">{t('registerPackage.common.selectPlaceholder')}</option>
                        {AGE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      {ageCategory && childAge !== '' && (
                        <p className="text-xs text-brand-blue mt-1">{t('registerPackage.anak.autoSelected')}</p>
                      )}
                      {step2Errors.ageCategory && <p className="text-xs text-red-600 mt-1">{step2Errors.ageCategory}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.anak.guardianFullName')}</label>
                    <input type="text" value={namaWali} onChange={e => setNamaWali(e.target.value)} className={INP} placeholder={t('registerPackage.anak.parentOrGuardian')} />
                    {step2Errors.namaWali && <p className="text-xs text-red-600 mt-1">{step2Errors.namaWali}</p>}
                  </div>
                </div>
              </div>

              {/* Class preferences */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t('registerPackage.anak.classPreferences')}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.anak.childCurrentAbility')}</label>
                    <select value={ability} onChange={e => setAbility(e.target.value)} className={SEL}>
                      <option value="">{t('registerPackage.common.selectPlaceholder')}</option>
                      {ABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {step2Errors.ability && <p className="text-xs text-red-600 mt-1">{step2Errors.ability}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.common.preferredLevel')}</label>
                    <select value={preferredLevel} onChange={e => setPreferredLevel(e.target.value)} className={SEL}>
                      <option value="">{t('registerPackage.common.selectPlaceholder')}</option>
                      {LEVEL_OPTIONS.map(o => (
                        <option key={o} value={o}>
                          {o === 'Not Sure (needs placement test)' ? t('registerPackage.common.notSure') : o}
                        </option>
                      ))}
                    </select>
                    {step2Errors.preferredLevel && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredLevel}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.common.preferredClassLevel')}</label>
                    <select value={kelasId} onChange={e => setKelasId(e.target.value)} className={SEL}>
                      <option value="">{t('registerPackage.common.selectAvailableLevel')}</option>
                      {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama || k.tingkat.replace('_', ' ')}</option>)}
                    </select>
                    {step2Errors.kelasId && <p className="text-xs text-red-600 mt-1">{step2Errors.kelasId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('registerPackage.common.preferredClassType')}</label>
                    <div className="flex gap-3">
                      {CLASS_OPTIONS.map(o => (
                        <label key={o} className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${preferredClass === o ? 'border-brand-blue bg-brand-blue-light' : 'border-gray-200 hover:border-brand-blue/40'}`}>
                          <input type="radio" value={o} checked={preferredClass === o} onChange={() => setPreferredClass(o)} className="accent-brand-blue" />
                          <span className="text-sm font-medium">{o === 'Onsite' ? t('registerPackage.common.onsite') : t('registerPackage.common.online')}</span>
                        </label>
                      ))}
                    </div>
                    {step2Errors.preferredClass && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredClass}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('registerPackage.common.preferredSchedule')}</label>
                    <div className="flex flex-wrap gap-2">
                      {HOUR_OPTIONS.map(o => (
                        <label key={o} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer text-sm transition ${preferredHour === o ? 'border-brand-blue bg-brand-blue-light font-semibold' : 'border-gray-200 hover:border-brand-blue/40'}`}>
                          <input type="radio" value={o} checked={preferredHour === o} onChange={() => setPreferredHour(o)} className="accent-brand-blue" />
                          {o}
                        </label>
                      ))}
                    </div>
                    {step2Errors.preferredHour && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredHour}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm flex items-center gap-1">
                  <ChevronLeft size={15} /> {t('profile.cancel')}
                </button>
                <button onClick={() => { if (validateStep2()) setStep(3); }} className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition text-sm flex items-center justify-center gap-2">
                  {t('registerPackage.common.step3Title')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{t('registerPackage.common.step3Title')}</h2>
              <p className="text-sm text-gray-400 mb-6">{t('registerPackage.common.step3Desc')}</p>

              {submitStatus === 'error' && (
                <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <div className="space-y-3 text-sm mb-6">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('registerPackage.anak.guardian')}</p>
                  <Row label={t('common.name')} value={profile?.nama || '—'} />
                  <Row label={t('common.email')} value={profile?.email || '—'} />
                  <Row label={t('dashboard.profile.whatsappLabel')} value={profile?.noWhatsapp || '—'} />
                  <Row label={t('registerPackage.anak.guardianFullName')} value={namaWali} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('registerPackage.anak.child')}</p>
                  <Row label={t('registerPackage.anak.childFullName')} value={childName} />
                  <Row label={t('registerPackage.anak.childAge')} value={String(childAge)} />
                  <Row label={t('registerPackage.anak.ageCategory')} value={ageCategory} />
                  <Row label={t('registerPackage.anak.childCurrentAbility')} value={ability} />
                  <Row label={t('registerPackage.common.preferredLevel')} value={preferredLevel === 'Not Sure (needs placement test)' ? t('registerPackage.common.notSure') : preferredLevel} highlight={preferredLevel === 'Not Sure (needs placement test)'} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('registerPackage.anak.class')}</p>
                  <Row label={t('registerPackage.common.preferredClassLevel')} value={selectedKelas ? (selectedKelas.nama || selectedKelas.tingkat.replace('_', ' ')) : '—'} />
                  <Row label={t('registerPackage.common.preferredClassType')} value={preferredClass === 'Onsite' ? t('registerPackage.common.onsite') : preferredClass === 'Online' ? t('registerPackage.common.online') : preferredClass} />
                  <Row label={t('registerPackage.common.preferredSchedule')} value={preferredHour} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm flex items-center gap-1">
                  <ChevronLeft size={15} /> {t('profile.cancel')}
                </button>
                <button onClick={handleSubmit} disabled={submitStatus === 'loading'} className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition text-sm disabled:opacity-50">
                  {submitStatus === 'loading' ? t('registerPackage.common.submitting') : t('registerPackage.common.submitRegistration')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className={`font-medium text-right ${highlight ? 'text-brand-orange' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}
