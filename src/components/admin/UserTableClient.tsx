'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  bio: string | null;
  negara: string | null;
  instansi: string | null;
  fotoProfil: string | null;
  createdAt: Date;
  premiumExpiresAt: Date | null;
}

interface UserTableClientProps {
  users: User[];
}

export default function UserTableClient({ users }: UserTableClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  // State for modals
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Form state for edit
  const [editForm, setEditForm] = useState({
    role: 'USER',
    premiumExpiresAt: '',  // ISO date string or empty
    isUnlimited: false,
  });

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEditProfile = (user: User) => {
    const expiresAt = user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
    // Format to YYYY-MM-DD for input[type=date]
    const dateStr = expiresAt ? expiresAt.toISOString().split('T')[0] : '';
    setEditUser(user);
    setEditForm({
      role: user.role,
      premiumExpiresAt: dateStr,
      isUnlimited: user.role === 'PREMIUM' && !user.premiumExpiresAt,
    });
  };

  const handleSaveProfile = async () => {
    if (!editUser) return;
    setIsUpdating(true);
    try {
      // Build payload — premiumExpiresAt only relevant for PREMIUM role
      const payload: Record<string, unknown> = { role: editForm.role };
      if (editForm.role === 'PREMIUM') {
        payload.premiumExpiresAt = editForm.isUnlimited
          ? null
          : editForm.premiumExpiresAt
          ? new Date(editForm.premiumExpiresAt).toISOString()
          : null;
      } else {
        payload.premiumExpiresAt = null; // clear when switching away from PREMIUM
      }

      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Profil pengguna berhasil diperbarui!', 'success');
        setEditUser(null);
        router.refresh();
      } else {
        throw new Error('Gagal memperbarui profil');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memperbarui profil pengguna', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Pengguna berhasil dihapus!', 'success');
        setDeleteUser(null);
        router.refresh();
      } else {
        throw new Error('Gagal menghapus pengguna');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pengguna', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              const isCurrentUser = session?.user?.id === user.id;

              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(user.role)}`}>
                      {user.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getPremiumStatus(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                    <button
                      onClick={() => setDetailUser(user)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditProfile(user)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit Profil"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteUser(user)}
                      disabled={isCurrentUser}
                      className={`${isCurrentUser ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}`}
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Detail Pengguna</h3>
              <button
                onClick={() => setDetailUser(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              {detailUser.fotoProfil ? (
                <img
                  src={detailUser.fotoProfil}
                  alt={detailUser.nama}
                  className="w-24 h-24 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {getInitials(detailUser.nama)}
                </div>
              )}
              <h4 className="text-xl font-semibold text-gray-900">{detailUser.nama}</h4>
              <p className="text-gray-500">{detailUser.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Peran</label>
                <p className="text-gray-900">{detailUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bio</label>
                <p className="text-gray-900">{detailUser.bio || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Negara</label>
                <p className="text-gray-900">{detailUser.negara || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instansi</label>
                <p className="text-gray-900">{detailUser.instansi || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Bergabung</label>
                <p className="text-gray-900">{new Date(detailUser.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
              {detailUser.role === 'PREMIUM' && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Premium Expires At</label>
                  <p className="text-gray-900">
                    {detailUser.premiumExpiresAt
                      ? new Date(detailUser.premiumExpiresAt).toLocaleDateString('id-ID')
                      : 'Tidak ada batas waktu'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Edit Profil Pengguna</h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value,
                      // reset premium fields when switching role
                      premiumExpiresAt: '',
                      isUnlimited: false,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white"
                >
                  <option value="USER">USER</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Premium expiry — hanya muncul saat role PREMIUM */}
              {editForm.role === 'PREMIUM' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-yellow-800">Batas Waktu Premium</p>

                  {/* Unlimited toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() =>
                        setEditForm({ ...editForm, isUnlimited: !editForm.isUnlimited, premiumExpiresAt: '' })
                      }
                      className={`w-11 h-6 rounded-full transition-colors flex items-center ${
                        editForm.isUnlimited ? 'bg-brand-blue' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                          editForm.isUnlimited ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      Unlimited <span className="text-gray-400">(tanpa batas waktu)</span>
                    </span>
                  </label>

                  {/* Date picker — tersembunyi saat unlimited */}
                  {!editForm.isUnlimited && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Expiry</label>
                      <input
                        type="date"
                        value={editForm.premiumExpiresAt}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEditForm({ ...editForm, premiumExpiresAt: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isUpdating}
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
              <button
                onClick={() => setDeleteUser(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6 break-words">
              Apakah kamu yakin ingin menghapus akun <span className="font-medium text-gray-900">{deleteUser.nama}</span>? Tindakan ini tidak bisa dibatalkan, dan user akan menerima email pemberitahuan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteUser(null)}
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
    </div>
  );
}