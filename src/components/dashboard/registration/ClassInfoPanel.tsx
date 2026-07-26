import { CheckCircle2, Clock, Users, DollarSign, RotateCcw } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

type ClassType = 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';
type Theme = 'teal' | 'orange';

interface ClassInfoPanelProps {
  tipe: ClassType;
  theme?: Theme;
}

const Section = ({ title, children, theme = 'teal' }: { title: string; children: React.ReactNode; theme?: Theme }) => (
  <div className="mb-5">
    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'orange' ? 'text-brand-orange' : 'text-brand-blue'}`}>
      {title}
    </h3>
    {children}
  </div>
);

const Item = ({ icon: Icon, text, theme = 'teal' }: { icon: React.ElementType; text: string; theme?: Theme }) => (
  <div className="flex items-start gap-2 text-sm text-gray-600 mb-1.5">
    <Icon size={14} className={`mt-0.5 flex-shrink-0 ${theme === 'orange' ? 'text-brand-orange' : 'text-brand-blue'}`} />
    <span>{text}</span>
  </div>
);

const P = 'dashboard.registration.classInfoPanel';

function fmt(n: number) {
  return 'IDR ' + n.toLocaleString('id-ID');
}

const PRIVAT_RATES = [
  { people: 1, weekday: 250000, weekend: 300000 },
  { people: 2, weekday: 230000, weekend: 280000 },
  { people: 3, weekday: 210000, weekend: 260000 },
  { people: 4, weekday: 190000, weekend: 240000 },
];

export default function ClassInfoPanel({ tipe, theme = 'teal' }: ClassInfoPanelProps) {
  const { t } = useLocale();
  const headColor = theme === 'orange' ? 'text-brand-orange-dark' : 'text-brand-blue-dark';
  const headerBg = theme === 'orange' ? 'bg-brand-orange-light text-brand-orange-dark' : 'bg-brand-blue-light text-brand-blue-dark';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 h-full ${theme === 'orange' ? 'border-brand-orange/20' : 'border-gray-100'}`}>
      {tipe === 'REGULER' && (
        <>
          <h2 className={`text-xl font-extrabold mb-1 ${headColor}`}>{t(`${P}.regularTitle`)}</h2>
          <p className="text-sm text-gray-500 mb-5">{t(`${P}.regularDesc`)}</p>

          <Section title={t(`${P}.program`)} theme={theme}>
            <Item icon={CheckCircle2} text={t(`${P}.reg_levels`)} theme={theme} />
            <Item icon={Clock} text={t(`${P}.reg_hoursPerLevel`)} theme={theme} />
            <Item icon={Clock} text={t(`${P}.reg_schedule`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.classSize`)} theme={theme}>
            <Item icon={Users} text={t(`${P}.reg_minStudents`)} theme={theme} />
            <Item icon={Users} text={t(`${P}.reg_maxStudents`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.fees`)} theme={theme}>
            <Item icon={DollarSign} text={t(`${P}.reg_tuition`)} theme={theme} />
            <Item icon={DollarSign} text={t(`${P}.reg_registrationFee`)} theme={theme} />
            <Item icon={DollarSign} text={t(`${P}.reg_placementTest`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.refundPolicy`)} theme={theme}>
            <Item icon={RotateCcw} text={t(`${P}.reg_refund70`)} theme={theme} />
            <Item icon={RotateCcw} text={t(`${P}.reg_refund0`)} theme={theme} />
          </Section>
        </>
      )}

      {tipe === 'PRIVAT' && (
        <>
          <h2 className={`text-xl font-extrabold mb-1 ${headColor}`}>{t(`${P}.privateTitle`)}</h2>
          <p className="text-sm text-gray-500 mb-5">{t(`${P}.privateDesc`)}</p>

          <Section title={t(`${P}.program`)} theme={theme}>
            <Item icon={CheckCircle2} text={t(`${P}.priv_minHours`)} theme={theme} />
            <Item icon={Clock} text={t(`${P}.priv_weekdaySchedule`)} theme={theme} />
            <Item icon={Clock} text={t(`${P}.priv_onlineSchedule`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.pricingPerHour`)} theme={theme}>
            <div className="overflow-x-auto mt-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className={headerBg}>
                    <th className="px-3 py-2 text-left rounded-tl-lg font-semibold">{t(`${P}.people`)}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t(`${P}.weekdays`)}</th>
                    <th className="px-3 py-2 text-left rounded-tr-lg font-semibold">{t(`${P}.weekend`)}</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIVAT_RATES.map((r, i) => (
                    <tr key={r.people} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 py-2 font-medium text-gray-700">{r.people}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {r.people === 1
                          ? `${fmt(r.weekday)}/${t(`${P}.perHour`)}`
                          : `${fmt(r.weekday)}/${t(`${P}.perHour`)}/${t(`${P}.perPerson`)}`}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {r.people === 1
                          ? `${fmt(r.weekend)}/${t(`${P}.perHour`)}`
                          : `${fmt(r.weekend)}/${t(`${P}.perHour`)}/${t(`${P}.perPerson`)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">{t(`${P}.registrationFee`)}</p>
          </Section>

          <Section title={t(`${P}.refundPolicy`)} theme={theme}>
            <Item icon={RotateCcw} text={t(`${P}.priv_refund70`)} theme={theme} />
            <Item icon={RotateCcw} text={t(`${P}.priv_refund0`)} theme={theme} />
          </Section>
        </>
      )}

      {tipe === 'ANAK_REMAJA' && (
        <>
          <h2 className={`text-xl font-extrabold mb-1 ${headColor}`}>{t(`${P}.childrenTitle`)}</h2>
          <p className="text-sm text-gray-500 mb-5">{t(`${P}.childrenDesc`)}</p>

          <Section title={t(`${P}.ageCategories`)} theme={theme}>
            <Item icon={Users} text={t(`${P}.child_classA`)} theme={theme} />
            <Item icon={Users} text={t(`${P}.child_classB`)} theme={theme} />
            <Item icon={Users} text={t(`${P}.child_classC`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.program`)} theme={theme}>
            <Item icon={CheckCircle2} text={t(`${P}.child_levels`)} theme={theme} />
            <Item icon={Clock} text={t(`${P}.child_schedule`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.classSize`)} theme={theme}>
            <Item icon={Users} text={t(`${P}.child_minStudents`)} theme={theme} />
            <Item icon={Users} text={t(`${P}.child_maxStudents`)} theme={theme} />
          </Section>

          <Section title={t(`${P}.fees`)} theme={theme}>
            <Item icon={DollarSign} text={t(`${P}.child_tuition`)} theme={theme} />
            <Item icon={DollarSign} text={t(`${P}.child_registrationFee`)} theme={theme} />
          </Section>
        </>
      )}
    </div>
  );
}
