'use client';

import { useEffect, useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface ContactMessage {
  id: string;
  nama: string;
  email: string;
  pesan: string;
  isRead: boolean;
  createdAt: Date;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { showDialog } = useConfirmDialog();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/contact');
        if (res.ok) {
          setMessages(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleToggleRead = async (message: ContactMessage) => {
    try {
      const res = await fetch(`/api/contact/${message.id}`, { method: 'PATCH' });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, isRead: !m.isRead } : m
          )
        );
        showToast('Status pesan diperbarui!', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal memperbarui status pesan', 'error');
    }
  };

  const handleDelete = (message: ContactMessage) => {
    showDialog({
      title: 'Hapus Pesan',
      message: 'Yakin ingin menghapus pesan ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/contact/${message.id}`, { method: 'DELETE' });
          if (res.ok) {
            setMessages((prev) => prev.filter((m) => m.id !== message.id));
            showToast('Pesan berhasil dihapus!', 'success');
          }
        } catch (e) {
          console.error(e);
          showToast('Gagal menghapus pesan', 'error');
        }
      },
    });
  };

  const columns: Column<ContactMessage>[] = [
    { key: 'nama', header: 'Nama' },
    { key: 'email', header: 'Email' },
    {
      key: 'pesan',
      header: 'Pesan',
      render: (value: any) => (value as string).slice(0, 50) + ((value as string).length > 50 ? '...' : ''),
    },
    {
      key: 'isRead',
      header: 'Status',
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value as boolean) ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {(value as boolean) ? 'Dibaca' : 'Baru'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (value: any) => new Date(value as Date).toLocaleDateString('id-ID'),
    },
  ];

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesan Kontak</h1>
        <p className="text-gray-600">Lihat dan kelola pesan dari pengguna.</p>
      </div>
      <DataTable
        columns={columns}
        data={messages}
        onEdit={handleToggleRead}
        onDelete={handleDelete}
      />
    </div>
  );
}
