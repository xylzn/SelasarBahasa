'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';
import { Eye, Pencil, Trash2, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

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
}

const ROLE_CLASS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  STUDENT: 'bg-brand-blue-light text-brand-blue',
};

const CloseBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition">
    <X size={20} />
  </button>
);

export default function UserTableClient({ users }: { users: User[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { t } = useLocale();

  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('STUDENT');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((user) =>
      !q ||
      user.nama.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q) ||
      (user.bio || '').toLowerCase().includes(q) ||
      (user.negara || '').toLowerCase().includes(q) ||
      (user.instansi || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const openEdit = (user: User) => { setEditUser(user); setEditRole(user.role); };

  const handleSave = async () => {
    if (!editUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) throw new Error();
      showToast('Pengguna berhasil diperbarui!', 'success');
      setEditUser(null);
      router.refresh();
    } catch {
      showToast('Gagal memperbarui pengguna', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Pengguna berhasil dihapus!', 'success');
      setDeleteUser(null);
      router.refresh();
    } catch {
      showToast('Gagal menghapus pengguna', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.userTable.searchPlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nama', 'Email', 'Role', 'Bergabung', 'Aksi'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isSelf = session?.user?.id === user.id;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.nama}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_CLASS[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button onClick={() => setDetailUser(user)} className="text-brand-blue hover:text-brand-blue/80" title={t('common.detail')}><Eye size={17} /></button>
                        <button onClick={() => openEdit(user)} className="text-brand-blue hover:text-brand-blue/80" title={t('common.edit')}><Pencil size={17} /></button>
                        <button onClick={() => setDeleteUser(user)} disabled={isSelf}
                          className={isSelf ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'} title={t('common.delete')}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                  {search ? 'Tidak ada hasil pencarian.' : 'Belum ada pengguna.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{t('admin.userTable.detailTitle')}</h3>
              <CloseBtn onClick={() => setDetailUser(null)} />
            </div>
            <div className="flex flex-col items-center mb-5">
              {detailUser.fotoProfil
                ? <img src={detailUser.fotoProfil} alt={detailUser.nama} className="w-20 h-20 rounded-full object-cover mb-3" />
                : <div className="w-20 h-20 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl mb-3">{getInitials(detailUser.nama)}</div>
              }
              <p className="font-bold text-gray-900">{detailUser.nama}</p>
              <p className="text-sm text-gray-500">{detailUser.email}</p>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Role', detailUser.role],
                ['Bio', detailUser.bio || '-'],
                ['Negara', detailUser.negara || '-'],
                ['Instansi', detailUser.instansi || '-'],
                ['Bergabung', new Date(detailUser.createdAt).toLocaleDateString('id-ID')],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="w-24 text-gray-400 flex-shrink-0">{label}</span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setDetailUser(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm">{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{t('admin.userTable.editRole')}</h3>
              <CloseBtn onClick={() => setEditUser(null)} />
            </div>
            <p className="text-sm text-gray-500 mb-4">{editUser.nama}</p>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white mb-6"
            >
              <option value="STUDENT">{t('admin.userTable.roleStudent')}</option>
              <option value="ADMIN">{t('admin.userTable.roleAdmin')}</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditUser(null)} disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={isUpdating}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition text-sm disabled:opacity-50">
                {isUpdating ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('common.confirmDelete')}</h3>
              <CloseBtn onClick={() => setDeleteUser(null)} />
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Hapus akun <span className="font-semibold text-gray-900">{deleteUser.nama}</span>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteUser(null)} disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50">{t('common.cancel')}</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50">
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
