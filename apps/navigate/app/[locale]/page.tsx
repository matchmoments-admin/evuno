import { setRequestLocale } from 'next-intl/server';
import { MapView } from '../../components/map-view';

export default function NavigatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <MapView locale={locale} />;
}
