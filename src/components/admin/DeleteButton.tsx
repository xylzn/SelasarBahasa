'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  id: string;
  apiPath: string;
  itemName?: string;
}

export default function DeleteButton({ id, apiPath, itemName = 'item ini' }: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert('Gagal menghapus item');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Hapus
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6 break-words">
              Apakah kamu yakin ingin menghapus <span className="font-medium text-gray-900">{itemName}</span>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}