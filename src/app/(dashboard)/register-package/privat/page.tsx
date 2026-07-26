'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import ProfileEditableFields from '@/components/shared/ProfileEditableFields';
import ClassInfoPanel from '@/components/dashboard/registration/ClassInfoPanel';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Profile { nama: string; email: string; noWhatsapp: string | null }

const SEL = 'w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm';
const INP = SEL;

const ABILITY_OPTIONS = ['None', 'Beginner', 'Intermediate', 'Advanced'];
const LEVEL_OPTIONS = ['Not Sure (needs placement test)', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKEND = ['Saturday', 'Sunday'];

// Convert "BIPA 1" → "Level 1"
function convertTingkatToPreferredLevel(tingkat: string): string {
  const match = tingkat.match(/BIPA\s*(\d)/i);
  if (match) return `Level ${match[1]}`;
  return tingkat;
}

// Price matrix: [people][weekday, weekend]
const RATES: Record<number, { weekday: number; weekend: number }> = {
  1: { weekday: 250000, weekend: 300000 },
  2: { weekday: 230000, weekend: 280000 },
  3: { weekday: 210000, weekend: 260000 },
  4: { weekday: 190000, weekend: 240000 },
};

function fmt(n: number) {
  return 'IDR ' + n.toLocaleString('id-ID');
}

export default function RegisterPrivatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileNama, setProfileNama] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileWa, setProfileWa] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [step1Saving, setStep1Saving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 2 fields
  const [ability, setAbility] = useState('');
  const [preferredLevel, setPreferredLevel] = useState('');
  const [preferredClass, setPreferredClass] = useState<'Onsite' | 'Online' | ''>('');
  const [preferredDayGroup, setPreferredDayGroup] = useState<'Weekdays' | 'Weekend' | ''>('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [preferredHour, setPreferredHour] = useState('');
  const [numLearners, setNumLearners] = useState<number>(1);
  const [totalHours, setTotalHours] = useState<number>(10);
  const [courseStartDate, setCourseStartDate] = useState('');
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  useEffect(() => {
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

  // Reset days when class type changes
  useEffect(() => {
    setSelectedDays([]);
    setPreferredDayGroup('');
  }, [preferredClass]);

  // Reset days when group changes
  useEffect(() => {
    setSelectedDays([]);
  }, [preferredDayGroup]);

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

  // Real-time cost calculation
  const costCalc = useMemo(() => {
    const n = Math.min(4, Math.max(1, numLearners));
    const h = Math.max(0, totalHours);
    const rate = RATES[n] || RATES[1];
    // Weekend rate applies for anyone who selects Weekend day group (Onsite or Online)
    const isWeekend = preferredDayGroup === 'Weekend';
    const hourlyRate = isWeekend ? rate.weekend : rate.weekday;
    const tuition = n * h * hourlyRate;
    const reg = 100000;
    return { n, h, hourlyRate, tuition, reg, total: tuition + reg, isWeekend };
  }, [numLearners, totalHours, preferredDayGroup]);

  const availableDays = preferredDayGroup === 'Weekdays' ? WEEKDAYS
    : preferredDayGroup === 'Weekend' ? WEEKEND : [];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!ability) errs.ability = t('registerPackage.common.validAbility');
    if (!preferredLevel) errs.preferredLevel = t('registerPackage.common.validLevel');
    if (!preferredClass) errs.preferredClass = t('registerPackage.common.validClassType');
    if (preferredClass && !preferredDayGroup) errs.dayGroup = t('registerPackage.common.validDayGroup');
    if (selectedDays.length === 0) errs.days = t('registerPackage.common.validDays');
    if (!preferredHour) errs.preferredHour = t('registerPackage.common.validSchedule');
    if (numLearners < 1 || numLearners > 4) errs.numLearners = t('registerPackage.privat.validNumLearners');
    if (totalHours < 10) errs.totalHours = t('registerPackage.privat.validTotalHours');
    if (!courseStartDate) errs.courseStartDate = t('registerPackage.common.registrationError');
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitStatus('loading');
    const res = await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipe: 'PRIVAT',
        tingkat: preferredLevel.startsWith('Level ')
          ? `BIPA_${preferredLevel.split(' ')[1]}`
          : 'BIPA_1',
        kemampuanBI: ability,
        preferredLevel,
        preferredClass,
        preferredDays: selectedDays.join(', '),
        preferredHour,
        jumlahPemelajar: numLearners,
        totalHours,
        courseStartDate,
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">{t('registerPackage.privat.pageTitle')}</h1>

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
        <div className="lg:col-span-2"><ClassInfoPanel tipe="PRIVAT" /></div>

        <div className="lg:col-span-3">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{t('registerPackage.privat.step1Title')}</h2>
              <p className="text-sm text-gray-400 mb-6">{t('registerPackage.common.step1Desc')}</p>
              {profile
                ? <ProfileEditableFields 
                    nama={profileNama} 
                    onNamaChange={setProfileNama}
                    email={profileEmail} 
                    onEmailChange={setProfileEmail}
                    noWhatsapp={profileWa} 
                    onNoWhatsappChange={setProfileWa}
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
                <h2 className="text-lg font-bold text-gray-900 mb-1">{t('registerPackage.common.step2Title')}</h2>
                <p className="text-sm text-gray-400">{t('registerPackage.privat.step2Desc')}</p>
              </div>

              {/* BIPA Level — one combined field with Not Sure option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.common.preferredClassLevel')}</label>
                <select value={preferredLevel} onChange={e => setPreferredLevel(e.target.value)} className={SEL}>
                  <option value="">{t('registerPackage.common.selectPlaceholder')}</option>
                  {LEVEL_OPTIONS.map(o => (
                    <option key={o} value={o}>
                      {o === 'Not Sure (needs placement test)' ? t('registerPackage.common.notSure') : o}
                    </option>
                  ))}
                </select>
                {preferredLevel === 'Not Sure (needs placement test)' && (
                  <p className="text-xs text-gray-500 italic mt-1.5">
                    {t('registerPackage.common.notSureHint')}
                  </p>
                )}
                {step2Errors.preferredLevel && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredLevel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.common.currentIndonesianAbility')}</label>
                <select value={ability} onChange={e => setAbility(e.target.value)} className={SEL}>
                  <option value="">{t('registerPackage.common.selectPlaceholder')}</option>
                  {ABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {step2Errors.ability && <p className="text-xs text-red-600 mt-1">{step2Errors.ability}</p>}
              </div>

              {/* Preferred Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('registerPackage.common.preferredClassType')}</label>
                <div className="flex gap-3">
                  {(['Onsite', 'Online'] as const).map(o => (
                    <label key={o} className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${preferredClass === o ? 'border-brand-blue bg-brand-blue-light' : 'border-gray-200 hover:border-brand-blue/40'}`}>
                      <input type="radio" value={o} checked={preferredClass === o} onChange={() => setPreferredClass(o)} className="accent-brand-blue" />
                      <span className="text-sm font-medium">{o === 'Onsite' ? t('registerPackage.common.onsite') : t('registerPackage.common.online')}</span>
                    </label>
                  ))}
                </div>
                {step2Errors.preferredClass && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredClass}</p>}
              </div>

              {/* Day group — shown for both Onsite and Online */}
              {preferredClass !== '' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('registerPackage.privat.dayGroup')}</label>
                  <div className="flex gap-3">
                    {(['Weekdays', 'Weekend'] as const).map(g => (
                      <label key={g} className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${preferredDayGroup === g ? 'border-brand-blue bg-brand-blue-light' : 'border-gray-200 hover:border-brand-blue/40'}`}>
                        <input type="radio" value={g} checked={preferredDayGroup === g} onChange={() => setPreferredDayGroup(g)} className="accent-brand-blue" />
                        <span className="text-sm font-medium">{g === 'Weekdays' ? t('registerPackage.common.weekdays') : t('registerPackage.common.weekend')}</span>
                      </label>
                    ))}
                  </div>
                  {step2Errors.dayGroup && <p className="text-xs text-red-600 mt-1">{step2Errors.dayGroup}</p>}
                </div>
              )}

              {/* Day checkboxes */}
              {preferredDayGroup && availableDays.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('registerPackage.privat.preferredDays')}</label>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map(d => (
                      <label key={d} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer text-sm transition ${selectedDays.includes(d) ? 'border-brand-blue bg-brand-blue-light font-semibold' : 'border-gray-200 hover:border-brand-blue/40'}`}>
                        <input type="checkbox" checked={selectedDays.includes(d)} onChange={() => toggleDay(d)} className="accent-brand-blue" />
                        {d === 'Monday' ? t('registerPackage.common.mon') : d === 'Tuesday' ? t('registerPackage.common.tue') : d === 'Wednesday' ? t('registerPackage.common.wed') : d === 'Thursday' ? t('registerPackage.common.thu') : d === 'Friday' ? t('registerPackage.common.fri') : d === 'Saturday' ? t('registerPackage.common.sat') : t('registerPackage.common.sun')}
                      </label>
                    ))}
                  </div>
                  {step2Errors.days && <p className="text-xs text-red-600 mt-1">{step2Errors.days}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.privat.preferredHour')}</label>
                <input type="text" value={preferredHour} onChange={e => setPreferredHour(e.target.value)} className={INP} placeholder={t('registerPackage.privat.hourExample')} />
                {step2Errors.preferredHour && <p className="text-xs text-red-600 mt-1">{step2Errors.preferredHour}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.privat.numberOfLearners')}</label>
                  <input type="number" min={1} max={4} value={numLearners} onChange={e => setNumLearners(Number(e.target.value))} className={INP} />
                  {step2Errors.numLearners && <p className="text-xs text-red-600 mt-1">{step2Errors.numLearners}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.privat.totalHours')}</label>
                  <input type="number" min={10} value={totalHours} onChange={e => setTotalHours(Number(e.target.value))} className={INP} />
                  {step2Errors.totalHours && <p className="text-xs text-red-600 mt-1">{step2Errors.totalHours}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registerPackage.privat.preferredStartDate')}</label>
                <input type="date" min={today} value={courseStartDate} onChange={e => setCourseStartDate(e.target.value)} className={INP} />
                {step2Errors.courseStartDate && <p className="text-xs text-red-600 mt-1">{step2Errors.courseStartDate}</p>}
              </div>

              {/* Real-time cost calculator */}
              {costCalc.h > 0 && costCalc.n > 0 && (
                <div className="bg-brand-blue-light border border-brand-blue/20 rounded-xl p-4 text-sm">
                  <p className="font-bold text-brand-blue-dark mb-2 text-xs uppercase tracking-widest">{t('registerPackage.privat.estimatedCost')}</p>
                  <p className="text-gray-700">
                    {costCalc.n} {costCalc.n === 1 ? t('registerPackage.privat.costPerson') : t('registerPackage.privat.costPeople')} × {costCalc.h} {t('registerPackage.privat.costHours')} × {fmt(costCalc.hourlyRate)}/{t('registerPackage.privat.costPerHour')}
                    {costCalc.isWeekend ? ` ${t('registerPackage.privat.costWeekendRate')}` : ` ${t('registerPackage.privat.costWeekdayRate')}`}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">= {fmt(costCalc.tuition)} {t('registerPackage.privat.costRegistrationFee')} {fmt(costCalc.reg)}</p>
                  <p className="text-lg font-extrabold text-brand-blue-dark mt-1.5">
                    {t('registerPackage.privat.costTotal')}: {fmt(costCalc.total)}
                  </p>
                </div>
              )}

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
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('registerPackage.privat.yourDetails')}</p>
                  <Row label={t('common.name')} value={profile?.nama || '—'} />
                  <Row label={t('common.email')} value={profile?.email || '—'} />
                  <Row label={t('dashboard.profile.whatsappLabel')} value={profile?.noWhatsapp || '—'} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('registerPackage.common.classDetails')}</p>
                  <Row label={t('registerPackage.common.preferredLevel')} value={preferredLevel === 'Not Sure (needs placement test)' ? t('registerPackage.common.notSure') : preferredLevel} highlight={preferredLevel === 'Not Sure (needs placement test)'} />
                  <Row label={t('registerPackage.common.preferredClassType')} value={preferredClass === 'Onsite' ? t('registerPackage.common.onsite') : preferredClass === 'Online' ? t('registerPackage.common.online') : preferredClass} />
                  <Row label={t('registerPackage.privat.preferredDays')} value={selectedDays.join(', ') || '—'} />
                  <Row label={t('registerPackage.privat.preferredHour')} value={preferredHour} />
                  <Row label={t('registerPackage.privat.numberOfLearners')} value={String(numLearners)} />
                  <Row label={t('registerPackage.privat.totalHours')} value={String(totalHours)} />
                  <Row label={t('registerPackage.privat.preferredStartDate')} value={courseStartDate} />
                </div>
                <div className="bg-brand-blue-light rounded-xl p-4">
                  <Row label={t('registerPackage.privat.estimatedCost')} value={fmt(costCalc.total)} />
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
