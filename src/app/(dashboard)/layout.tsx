import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Sidebar from '@/components/dashboard/Sidebar';

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
    <div className="flex min-h-screen">
      <Sidebar
        userName={session.user.nama || 'User'}
        userRole={session.user.role || 'USER'}
      />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
