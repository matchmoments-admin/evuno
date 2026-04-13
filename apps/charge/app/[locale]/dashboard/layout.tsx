import { setRequestLocale } from 'next-intl/server';
import { DashboardSidebar } from '../../../components/dashboard-sidebar';

export default function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar locale={locale} />
      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  );
}
