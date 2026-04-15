import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@evuno/ui';

export default function SettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div>
      <h1 className="text-xl font-semibold text-text mb-6">
        {locale === 'es' ? 'Configuracion' : 'Settings'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'es' ? 'Proximamente' : 'Coming Soon'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            {locale === 'es'
              ? 'La configuracion de tu cuenta, notificaciones y preferencias estara disponible pronto.'
              : 'Account settings, notifications, and preferences will be available soon.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
