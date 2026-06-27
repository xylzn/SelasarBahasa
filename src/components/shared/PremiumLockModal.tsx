'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PremiumLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumLockModal({ open, onOpenChange }: PremiumLockModalProps) {
  const router = useRouter();

  function handleLihatPaket() {
    onOpenChange(false);
    router.push('/#packages');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Konten Premium</h2>
        <p className="text-gray-600 text-center mb-6">
          Materi atau video ini khusus untuk member Premium. Upgrade sekarang untuk membuka akses penuh ke semua materi pembelajaran.
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleLihatPaket}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Lihat Paket Premium
          </button>
        </div>
      </div>
    </div>
  );
}
