import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DashboardLayoutContent from '@/components/dashboard/DashboardLayoutContent';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardLayoutContent
      userName={session.user.nama || 'User'}
      userRole={session.user.role || 'USER'}
      userEmail={session.user.email || ''}
      userFotoProfil={session.user.fotoProfil || null}
    >
      {children}
    </DashboardLayoutContent>
  );
}
