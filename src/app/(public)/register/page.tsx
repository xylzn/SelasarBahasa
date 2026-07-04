'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

const registerSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus ada huruf besar')
    .regex(/[0-9]/, 'Password harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Password harus ada simbol'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: data.nama,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal mendaftar');
      }

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = () => {
    if (!password) return [];
    const checks = [
      { condition: password.length >= 8, text: 'Minimal 8 karakter' },
      { condition: /[A-Z]/.test(password), text: 'Ada huruf besar' },
      { condition: /[0-9]/.test(password), text: 'Ada angka' },
      { condition: /[^A-Za-z0-9]/.test(password), text: 'Ada simbol' },
    ];
    return checks;
  };

  const { t } = useLocale();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange-light/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/40 reveal">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-blue-dark mb-2 tracking-tight">
            {t('register.title')}
          </h1>
          <p className="text-gray-500 text-sm font-medium">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100 text-sm font-medium">
            <AlertCircle size={20} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">{t('register.fullName')}</label>
            <input
              {...register('nama')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all shadow-sm text-sm"
              placeholder={t('register.namePlaceholder')}
            />
            {errors.nama && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.nama.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">{t('register.email')}</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all shadow-sm text-sm"
              placeholder="nama@email.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">{t('register.password')}</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none pr-11 transition-all shadow-sm text-sm"
                placeholder={t('register.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.password.message}</p>
            )}
            {password && (
              <div className="mt-3 space-y-1.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                {checkPasswordStrength().map((check, i) => (
                  <div key={i} className={`text-xs flex items-center gap-2 font-medium ${check.condition ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle2 size={14} className={check.condition ? 'text-green-500' : 'text-gray-300'} />
                    {check.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">{t('register.confirmPassword')}</label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none pr-11 transition-all shadow-sm text-sm"
                placeholder={t('register.confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold btn-animate hover:bg-brand-blue/90 shadow-md hover:shadow-brand-blue/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {t('register.hasAccount')}{' '}
            <Link href="/login" className="text-brand-orange font-bold hover:text-brand-orange/90 transition-colors">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
