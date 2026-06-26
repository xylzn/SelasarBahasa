'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';

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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!confirm('Yakin ingin menghapus pesan ini?')) return;
    try {
      const res = await fetch(`/api/contact/${message.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: 'nama', header: 'Nama' },
    { key: 'email', header: 'Email' },
    {
      key: 'pesan',
      header: 'Pesan',
      render: (pesan: string) => pesan.slice(0, 50) + (pesan.length > 50 ? '...' : ''),
    },
    {
      key: 'isRead',
      header: 'Status',
      render: (isRead: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isRead ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {isRead ? 'Dibaca' : 'Baru'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (date: Date) => new Date(date).toLocaleDateString('id-ID'),
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
