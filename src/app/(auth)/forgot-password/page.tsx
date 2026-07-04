'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import AuthShell from '@/components/shared/AuthShell';

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { t } = useLocale();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      headline={t('auth.shell.loginHeadline')}
      subheadline={t('auth.shell.loginSubheadline')}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-blue-dark mb-2 tracking-tight">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          {t('auth.forgotPassword.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100 text-sm font-medium">
          <AlertCircle size={20} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 border border-green-100 text-sm font-medium">
          {t('auth.forgotPassword.successMessage')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            {t('auth.forgotPassword.emailLabel')}
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all shadow-sm text-sm"
            placeholder="nama@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold btn-animate hover:bg-brand-blue/90 shadow-md hover:shadow-brand-blue/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? 'Mengirim...' : t('auth.forgotPassword.submitButton')}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          <Link href="/login" className="text-brand-orange font-bold hover:text-brand-orange/90 transition-colors">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
