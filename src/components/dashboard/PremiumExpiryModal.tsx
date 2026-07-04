'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export default function PremiumExpiryModal() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);

  const shouldShowModal = useMemo(() => {
    if (
      !session?.user?.premiumExpiresAt ||
      session.user.role !== 'PREMIUM' ||
      isDismissed
    ) {
      return false;
    }

    const expiryDate = new Date(session.user.premiumExpiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 0 && diffHours <= 72;
  }, [session, isDismissed]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!shouldShowModal || !session?.user?.premiumExpiresAt) return;

    const expiryDate = new Date(session.user.premiumExpiresAt);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = expiryDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setIsDismissed(true);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [shouldShowModal, session?.user?.premiumExpiresAt]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (session?.user?.id) {
      sessionStorage.setItem(`premium_expiry_dismissed_${session.user.id}`, 'true');
    }
  };

  // Check session storage on mount
  useEffect(() => {
    if (session?.user?.id) {
      const dismissed = sessionStorage.getItem(`premium_expiry_dismissed_${session.user.id}`);
      if (dismissed) {
        setIsDismissed(true);
      }
    }
  }, [session?.user?.id]);

  if (!shouldShowModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border-4 border-orange-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Premium Akan Habis!
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="text-center mb-6">
          <p className="text-gray-700 mb-4">Premium kamu akan habis dalam:</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-100 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-sm text-orange-700">Jam</div>
            </div>
            <div className="bg-orange-100 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-sm text-orange-700">Menit</div>
            </div>
            <div className="bg-orange-100 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-sm text-orange-700">Detik</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Hubungi tim support untuk perpanjangan!</p>
        </div>
      </div>
    </div>
  );
}
