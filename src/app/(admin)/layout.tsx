import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminLayoutContent from '@/components/admin/AdminLayoutContent';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <AdminLayoutContent
      userName={session.user.nama || 'Admin'}
      userEmail={session.user.email || ''}
      userFotoProfil={(session.user as any).fotoProfil || null}
    >
      {children}
    </AdminLayoutContent>
  );
}
