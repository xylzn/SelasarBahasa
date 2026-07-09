'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import AuthShell from '@/components/shared/AuthShell';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto redirect jika sudah login
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [session, status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah');
      }
    } catch (e) {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  const { t } = useLocale();

  return (
    <AuthShell
      headline={t('auth.shell.loginHeadline')}
      subheadline={t('auth.shell.loginSubheadline')}
      
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-blue-dark mb-2 tracking-tight">
          {t('login.title')}
        </h1>
        <p className="text-gray-500 text-sm font-medium">{t('login.welcome')}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100 text-sm font-medium">
          <AlertCircle size={20} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">{t('login.email')}</label>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">{t('login.password')}</label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-orange font-medium hover:text-brand-orange/90"
            >
              {t('login.forgotPasswordLink')}
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none pr-11 transition-all shadow-sm text-sm"
              placeholder={t('login.passwordPlaceholder')}
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold btn-animate hover:bg-brand-blue/90 shadow-md hover:shadow-brand-blue/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          {t('login.noAccount')}{' '}
          <Link href="/register" className="text-brand-orange font-bold hover:text-brand-orange/90 transition-colors">
            {t('login.registerNow')}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
