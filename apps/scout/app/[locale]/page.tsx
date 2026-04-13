import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default function ScoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations('home');

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-semibold text-text mb-4">
          {t('title')}
        </h1>
        <p className="text-base text-text-muted mb-8">
          {t('subtitle')}
        </p>
        <Link
          href={`/${locale}/calculator`}
          className="inline-flex items-center justify-center h-12 px-8 bg-accent text-bg font-medium rounded-consumer hover:bg-accent-hover transition-colors"
        >
          {t('cta')}
        </Link>
      </div>
    </main>
  );
}
