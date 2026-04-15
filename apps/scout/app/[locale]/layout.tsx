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

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'evuno Scout — EV Charger ROI Calculator',
  description: 'Free ROI assessment tool for property owners considering EV charger installation in Chile and Australia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SCOUT_URL ?? 'https://scout.evuno.co'),
  openGraph: {
    title: 'evuno Scout — Should You Install EV Chargers?',
    description: 'Free ROI assessment for property owners. Calculate payback period, annual revenue, and 5-year profit for EV charging stations.',
    siteName: 'evuno Scout',
    type: 'website',
    locale: 'en',
    alternateLocale: 'es',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'evuno Scout — EV Charger ROI Calculator',
    description: 'Free ROI assessment for property owners in Chile and Australia.',
  },
  alternates: {
    canonical: '/',
    languages: { en: '/en', es: '/es' },
  },
  robots: { index: true, follow: true },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'evuno',
                  url: 'https://evuno.co',
                  description: 'EV charging platform for operators and drivers in Chile and Australia',
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'evuno Scout',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  description: 'Free ROI calculator for EV charger installation. Estimate payback period, annual revenue, and 5-year profit.',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                  author: { '@type': 'Organization', name: 'evuno' },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans bg-bg text-text min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
