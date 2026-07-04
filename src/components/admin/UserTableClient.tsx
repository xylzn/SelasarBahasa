'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  createdAt: Date;
  premiumExpiresAt: Date | null;
}

interface UserTableClientProps {
  users: User[];
}

export default function UserTableClient({ users }: UserTableClientProps) {
  const router = useRouter();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('USER');
  const [selectedPremiumExpiresAt, setSelectedPremiumExpiresAt] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const handleEditRole = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
    setSelectedPremiumExpiresAt(user.premiumExpiresAt 
      ? new Date(user.premiumExpiresAt).toISOString().slice(0, 16)
      : '');
  };

  const handleSaveRole = async (userId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole,
          premiumExpiresAt: selectedPremiumExpiresAt || null,
        }),
      });

      if (res.ok) {
        showToast('Pengguna berhasil diperbarui!', 'success');
        setEditingUserId(null);
        router.refresh();
      } else {
        throw new Error('Gagal mengubah peran pengguna');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah peran pengguna', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleClass = (role: string) => {
    return {
      ADMIN: 'bg-purple-100 text-purple-800',
      PREMIUM: 'bg-yellow-100 text-yellow-800',
      USER: 'bg-gray-100 text-gray-800',
    }[role] || 'bg-gray-100 text-gray-800';
  };

  const getPremiumStatus = (user: User) => {
    if (user.role !== 'PREMIUM') return null;
    if (!user.premiumExpiresAt) return 'Tidak ada batas waktu';
    
    const expiresAt = new Date(user.premiumExpiresAt);
    const now = new Date();
    if (expiresAt < now) {
      return (
        <span className="text-xs text-red-600 font-medium">Kadaluarsa</span>
      );
    }
    
    return (
      <span className="text-xs text-green-600 font-medium">
        Sampai {expiresAt.toLocaleDateString('id-ID')}
      </span>
    );
  };

  const handleAddMonths = (months: number) => {
    const now = new Date();
    now.setMonth(now.getMonth() + months);
    setSelectedPremiumExpiresAt(now.toISOString().slice(0, 16));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premium Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bergabung
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="USER">User</option>
                          <option value="PREMIUM">Premium</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(user.role)}`}>
                        {user.role.toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="datetime-local"
                          value={selectedPremiumExpiresAt}
                          onChange={(e) => setSelectedPremiumExpiresAt(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs"
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddMonths(1)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                          >
                            +1 Bulan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMonths(3)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                          >
                            +3 Bulan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMonths(6)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                          >
                            +6 Bulan
                          </button>
                        </div>
                      </div>
                    ) : (
                      getPremiumStatus(user)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveRole(user.id)}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                          {isUpdating ? 'Simpan...' : 'Simpan'}
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ubah
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
