'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import AuthShell from '@/components/shared/AuthShell';

const resetPasswordPageSchema = z.object({
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus ada huruf besar')
    .regex(/[0-9]/, 'Password harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Password harus ada simbol'),
  confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof resetPasswordPageSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { t } = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordPageSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        headline={t('auth.shell.loginHeadline')}
        subheadline={t('auth.shell.loginSubheadline')}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-blue-dark mb-4">
            {t('auth.resetPassword.invalidToken')}
          </h1>
          <Link
            href="/forgot-password"
            className="text-brand-orange font-bold hover:text-brand-orange/90"
          >
            Minta reset password baru
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      headline={t('auth.shell.loginHeadline')}
      subheadline={t('auth.shell.loginSubheadline')}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-blue-dark mb-2 tracking-tight">
          {t('auth.resetPassword.title')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100 text-sm font-medium">
          <AlertCircle size={20} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 border border-green-100 text-sm font-medium">
          {t('auth.resetPassword.successMessage')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            {t('auth.resetPassword.newPasswordLabel')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none pr-11 transition-all shadow-sm text-sm"
              placeholder="Masukkan password baru"
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
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            {t('auth.resetPassword.confirmPasswordLabel')}
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none pr-11 transition-all shadow-sm text-sm"
              placeholder="Masukkan password baru lagi"
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
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold btn-animate hover:bg-brand-blue/90 shadow-md hover:shadow-brand-blue/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? 'Reset...' : t('auth.resetPassword.submitButton')}
        </button>
      </form>
    </AuthShell>
  );
}
