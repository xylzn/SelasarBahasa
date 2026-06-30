'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MateriForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTipe, setSelectedTipe] = useState<'TEKS' | 'VIDEO'>('TEKS');
  const [sumberDokumen, setSumberDokumen] = useState<'LINK' | 'UPLOAD'>('LINK');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfLink, setPdfLink] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. EXTRACT FORM DATA FIRST, before async calls!
      const formData = new FormData(e.currentTarget);
      const judul = formData.get('judul') as string;
      const slug = formData.get('slug') as string | undefined;
      const tipe = formData.get('tipe') as 'TEKS' | 'VIDEO';
      const kelas = formData.get('kelas') as string;
      const videoUrl = formData.get('videoUrl') as string | undefined;
      const isPremium = formData.get('isPremium') === 'true';
      const urutan = parseInt(formData.get('urutan') as string) || 0;
      const published = formData.get('published') === 'true';

      let pdfUrl: string | undefined = undefined;
      let sumber: 'LINK' | 'UPLOAD' | undefined = undefined;

      if (tipe === 'TEKS') {
        if (sumberDokumen === 'UPLOAD' && selectedFile) {
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
      }

      const data: any = {
        judul,
        slug,
        tipe,
        kelas,
        isPremium,
        urutan,
        published,
      };
      if (pdfUrl) data.pdfUrl = pdfUrl;
      if (videoUrl) data.videoUrl = videoUrl;
      if (sumber) data.sumberDokumen = sumber;

      const res = await fetch('/api/materi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/materi');
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        console.error('Status:', res.status);
        throw new Error(errorData.error || 'Gagal menambah materi');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menambah materi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Materi Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            name="judul"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan judul materi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (opsional)</label>
          <input
            type="text"
            name="slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Slug URL (auto-generated jika kosong)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select
              name="tipe"
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value as 'TEKS' | 'VIDEO')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="TEKS">PDF</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              name="kelas"
              defaultValue="DASAR"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="DASAR">Dasar</option>
              <option value="MENENGAH">Menengah</option>
              <option value="LANJUTAN">Lanjutan</option>
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
                    ? 'bg-blue-600 text-white border-blue-600'
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
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Upload File PDF
              </button>
            </div>

            {sumberDokumen === 'LINK' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link PDF</label>
                <input
                  type="url"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/materi.pdf"
                />
                {pdfLink && (
                  <div className="mt-2">
                    <a
                      href={pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Buka link di tab baru untuk testing →
                    </a>
                  </div>
                )}
              </div>
            )}

            {sumberDokumen === 'UPLOAD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload PDF (Maks 2MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              </div>
            )}
          </div>
        )}

        {selectedTipe === 'VIDEO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
            <input
              type="url"
              name="videoUrl"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input
              type="number"
              name="urutan"
              defaultValue={0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPremium"
              name="isPremium"
              value="true"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
              Materi Premium
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            value="true"
            defaultChecked
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Simpan Materi'}
          </button>
        </div>
      </form>
    </div>
  );
}
