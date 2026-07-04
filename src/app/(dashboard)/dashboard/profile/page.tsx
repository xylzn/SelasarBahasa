'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Camera } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import Cropper from 'react-easy-crop';

interface UserProfile {
  id: string;
  nama: string;
  email: string;
  bio?: string | null;
  negara?: string | null;
  instansi?: string | null;
  fotoProfil?: string | null;
  role: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Crop state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: '',
    bio: '',
    negara: '',
    instansi: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            nama: data.nama || '',
            bio: data.bio || '',
            negara: data.negara || '',
            instansi: data.instansi || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setMessage(null);

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'avatar.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', croppedFile);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, fotoProfil: data.fotoProfil } : null));
        await updateSession();
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || t('profile.uploadError') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.uploadError') });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setMessage({ type: 'success', text: t('profile.saveSuccess') });
        await updateSession();
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || t('profile.saveError') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.saveError') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="flex items-center gap-6 mb-8">
            <div className="w-28 h-28 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = profile?.nama
    ? profile.nama
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-brand-blue-dark mb-6">{t('profile.title')}</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            {profile?.fotoProfil ? (
              <img
                src={profile.fotoProfil}
                alt={profile.nama}
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-brand-blue text-white p-2 rounded-full shadow-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">{t('profile.changePhoto')}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.namaLabel')}</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bioLabel')}</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              maxLength={160}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/160</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.negaraLabel')}</label>
            <input
              type="text"
              value={formData.negara}
              onChange={(e) => setFormData({ ...formData, negara: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.instansiLabel')}</label>
            <input
              type="text"
              value={formData.instansi}
              onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
              placeholder={t('profile.instansiPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{t('profile.emailReadonly')}</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              t('profile.saveButton')
            )}
          </button>
        </div>
      </form>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Sesuaikan Foto</h3>
              <button
                onClick={() => setImageSrc(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden mb-6">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setImageSrc(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                disabled={uploading}
              >
                Batal
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Mengunggah...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}