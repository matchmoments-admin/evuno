import { setRequestLocale } from 'next-intl/server';

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto prose prose-invert">
        <h1 className="text-2xl font-semibold text-text mb-8">Terms of Service</h1>

        <p className="text-sm text-text-muted mb-6">
          Last updated: April 2026. These terms are a draft and subject to legal review before publication.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">1. Service Description</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            evuno Scout provides a free ROI calculator tool for property owners evaluating EV charger installation.
            The calculator produces estimates based on the inputs you provide and general market data. Results are
            indicative only and do not constitute financial advice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">2. Accuracy of Estimates</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            ROI calculations are based on average market data for Australia and Chile. Actual results will vary based
            on local electricity rates, installation costs, usage patterns, and other factors. evuno does not guarantee
            the accuracy of any estimate provided by the calculator.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">3. Consumer Rights</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Australian consumers are protected by the Australian Consumer Law (ACL). Chilean consumers are protected
            by Ley 19.496 (SERNAC). Nothing in these terms limits your statutory rights under applicable consumer
            protection legislation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">4. Contact</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            For inquiries: hello@evuno.co
          </p>
        </section>
      </div>
    </main>
  );
}
