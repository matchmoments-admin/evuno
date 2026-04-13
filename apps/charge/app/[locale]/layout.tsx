import { DM_Sans, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import '../globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export const metadata = {
  title: 'evuno Charge — EV Charging Station Management',
  description: 'White-label OCPP charging station management platform for operators in Chile and Australia.',
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = useMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans bg-bg text-text min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
