'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/providers/LocaleProvider';

interface MarkCompleteButtonProps {
  materiId: string;
  isCompleted: boolean;
}

export default function MarkCompleteButton({ materiId, isCompleted }: MarkCompleteButtonProps) {
  const { t } = useLocale();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompletedLocal, setIsCompletedLocal] = useState(isCompleted);
  const { showToast } = useToast();

  const handleClick = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/materi/${materiId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsCompletedLocal(true);
        showToast('Materi berhasil ditandai selesai!', 'success');
      } else {
        throw new Error('Failed to mark as complete');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menandai materi selesai', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompletedLocal) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
        <CheckCircle2 size={20} />
        <span className="font-medium">{t('materi.markComplete')}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition"
    >
      {isUpdating ? 'Menyimpan...' : 'Tandai Selesai'}
    </button>
  );
}
