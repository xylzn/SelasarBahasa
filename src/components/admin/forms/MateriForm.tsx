'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/providers/LocaleProvider';

interface MateriFormProps {
  initialData?: any;
}

export default function MateriForm({ initialData }: MateriFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTipe, setSelectedTipe] = useState<'TEKS' | 'VIDEO'>(initialData?.tipe || 'TEKS');
  const [sumberDokumen, setSumberDokumen] = useState<'LINK' | 'UPLOAD'>(initialData?.sumberDokumen || 'LINK');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfLink, setPdfLink] = useState(initialData?.pdfUrl || '');
  const [keepExistingFile, setKeepExistingFile] = useState(!!initialData?.pdfUrl && initialData?.sumberDokumen === 'UPLOAD');
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || '');
  const { showToast } = useToast();

  useEffect(() => {
    if (initialData?.pdfUrl) {
      if (initialData?.sumberDokumen === 'LINK') {
        setPdfLink(initialData.pdfUrl);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. EXTRACT FORM DATA FIRST, before async calls!
      const formData = new FormData(e.currentTarget);
      const judul = formData.get('judul') as string;
      const slug = formData.get('slug') as string | undefined;
      const tipe = formData.get('tipe') as 'TEKS' | 'VIDEO';
      const tipeKelas = formData.get('tipeKelas') as 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';
      const tingkatBIPA = formData.get('tingkatBIPA') as 'BIPA_1' | 'BIPA_2' | 'BIPA_3' | 'BIPA_4' | 'BIPA_5' | 'BIPA_6';
      const videoUrl = formData.get('videoUrl') as string | undefined;
      const urutan = parseInt(formData.get('urutan') as string) || 0;
      const published = formData.get('published') === 'true';

      let pdfUrl: string | undefined | null = undefined;
      let sumber: 'LINK' | 'UPLOAD' | undefined | null = undefined;

      if (tipe === 'TEKS') {
        if (initialData && keepExistingFile) {
          pdfUrl = initialData.pdfUrl;
          sumber = initialData.sumberDokumen;
        } else if (sumberDokumen === 'UPLOAD' && selectedFile) {
          // Upload file via API
          const uploadFormData = new FormData();
          uploadFormData.append('file', selectedFile);
          const uploadRes = await fetch('/api/upload/materi', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json();
            throw new Error(errData.error || 'Gagal upload file');
          }

          const uploadResult = await uploadRes.json();
          pdfUrl = uploadResult.url;
          sumber = 'UPLOAD';
        } else if (sumberDokumen === 'LINK' && pdfLink) {
          pdfUrl = pdfLink;
          sumber = 'LINK';
        }
      } else {
        // For VIDEO type, clear pdf-related fields
        pdfUrl = null;
        sumber = null;
      }

      const data: any = {
        judul,
        slug,
        tipe,
        tipeKelas,
        tingkatBIPA,
        urutan,
        published,
      };
      if (tipe === 'VIDEO') {
        data.deskripsi = deskripsi || null;
      } else {
        data.deskripsi = null;
      }
      if (pdfUrl !== undefined) data.pdfUrl = pdfUrl;
      if (videoUrl) data.videoUrl = videoUrl;
      if (sumber !== undefined) data.sumberDokumen = sumber;

      const url = initialData ? `/api/materi/${initialData.id}` : '/api/materi';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(initialData ? 'Materi berhasil diperbarui!' : 'Materi berhasil ditambahkan!', 'success');
        router.push('/admin/materi');
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        console.error('Status:', res.status);
        throw new Error(errorData.error || `Gagal ${initialData ? 'update' : 'menambah'} materi`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || `Gagal ${initialData ? 'update' : 'menambah'} materi`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{initialData ? 'Edit Materi' : 'Tambah Materi Baru'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.artikel.judul')}</label>
          <input
            type="text"
            name="judul"
            required
            defaultValue={initialData?.judul}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            placeholder={t('admin.forms.materi.judulPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.materi.slugOpsional')}</label>
          <input
            type="text"
            name="slug"
            defaultValue={initialData?.slug}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            placeholder={t('admin.forms.materi.slugPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.materi.tipe')}</label>
            <select
              name="tipe"
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value as 'TEKS' | 'VIDEO')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            >
              <option value="TEKS">{t('admin.forms.materi.pdf')}</option>
              <option value="VIDEO">{t('admin.forms.materi.video')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminShared.tipeKelas')}</label>
            <select
              name="tipeKelas"
              defaultValue={initialData?.tipeKelas || 'REGULER'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            >
              <option value="REGULER">{t('adminShared.reguler')}</option>
              <option value="PRIVAT">{t('adminShared.privat')}</option>
              <option value="ANAK_REMAJA">{t('adminShared.anakRemaja')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminShared.tingkatBipa')}</label>
            <select
              name="tingkatBIPA"
              defaultValue={initialData?.tingkatBIPA || 'BIPA_1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            >
              <option value="BIPA_1">{t('adminShared.bipa1')}</option>
              <option value="BIPA_2">{t('adminShared.bipa2')}</option>
              <option value="BIPA_3">{t('adminShared.bipa3')}</option>
              <option value="BIPA_4">{t('adminShared.bipa4')}</option>
              <option value="BIPA_5">{t('adminShared.bipa5')}</option>
              <option value="BIPA_6">{t('adminShared.bipa6')}</option>
            </select>
          </div>
        </div>

        {selectedTipe === 'TEKS' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSumberDokumen('LINK')}
                className={`flex-1 px-4 py-2 rounded-lg border transition ${
                  sumberDokumen === 'LINK'
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Gunakan Link
              </button>
              <button
                type="button"
                onClick={() => setSumberDokumen('UPLOAD')}
                className={`flex-1 px-4 py-2 rounded-lg border transition ${
                  sumberDokumen === 'UPLOAD'
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Upload File PDF
              </button>
            </div>

            {sumberDokumen === 'LINK' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.materi.linkPdf')}</label>
                <input
                  type="url"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder={t('admin.forms.materi.pdfUrlPlaceholder')}
                />
                {pdfLink && (
                  <div className="mt-2">
                    <a
                      href={pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-blue hover:underline"
                    >
                      Buka link di tab baru untuk testing →
                    </a>
                  </div>
                )}
              </div>
            )}

            {sumberDokumen === 'UPLOAD' && (
              <div>
                {initialData?.sumberDokumen === 'UPLOAD' && initialData?.pdfUrl && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      File saat ini: <span className="font-medium">{initialData.pdfUrl.split('/').pop()}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="keepFile"
                        checked={keepExistingFile}
                        onChange={(e) => setKeepExistingFile(e.target.checked)}
                        className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                      />
                      <label htmlFor="keepFile" className="text-sm text-gray-700">
                        Pertahankan file ini
                      </label>
                    </div>
                  </div>
                )}
                {(!initialData || !keepExistingFile) && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload PDF (Maks 2MB)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          File terpilih: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Ganti file
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {selectedTipe === 'VIDEO' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.materi.urlVideo')}</label>
              <input
                type="url"
                name="videoUrl"
                defaultValue={initialData?.videoUrl}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                placeholder={t('admin.forms.materi.videoUrlPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder={t('admin.forms.materi.deskripsiPlaceholder')}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.materi.urutan')}</label>
            <input
              type="number"
              name="urutan"
              defaultValue={initialData?.urutan || 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            value="true"
            defaultChecked={initialData?.published ?? true}
            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Terbitkan
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Simpan Materi'}
          </button>
        </div>
      </form>
    </div>
  );
}
