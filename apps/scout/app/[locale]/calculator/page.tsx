import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { CalculatorForm } from '../../../components/calculator-form';

export default function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations('calculator');

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text mb-2">{t('title')}</h1>
        <p className="text-text-muted">{t('subtitle')}</p>
      </div>
      <CalculatorForm />
    </main>
  );
}
