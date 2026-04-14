import { setRequestLocale } from 'next-intl/server';

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto prose prose-invert">
        <h1 className="text-2xl font-semibold text-text mb-8">Privacy Policy</h1>

        <p className="text-sm text-text-muted mb-6">
          Last updated: April 2026. This policy is a draft and subject to legal review before publication.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">1. Information We Collect</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            When you use the evuno Scout ROI calculator, we collect the information you provide in the calculator form
            (property type, location, charger configuration) and, if you request a detailed report, your contact information
            (name, email, phone, company). We also collect standard web analytics data (page views, browser type, country).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">2. How We Use Your Information</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            We use your calculator inputs solely to generate your ROI assessment. Contact information from the lead capture
            form is used to send you the detailed report and to contact you about evuno Charge services. We do not sell
            your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">3. Data Retention</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Calculator inputs are processed in your browser and are not stored on our servers. Contact information from
            lead capture forms is retained for 24 months or until you request deletion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">4. Your Rights</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            You may request access to, correction of, or deletion of your personal information at any time by contacting
            us at privacy@evuno.co. Australian residents have rights under the Privacy Act 1988. Chilean residents have
            rights under Ley 21.719 (effective 1 December 2026).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-text mb-3">5. Contact</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            For privacy inquiries, contact: privacy@evuno.co
          </p>
        </section>
      </div>
    </main>
  );
}
