import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();

  const { name, email, phone, company, country, roiResult } = data;

  // For MVP: log the lead and optionally send via Resend
  // In production, replace with actual Resend integration
  console.log('[Scout Lead]', {
    name,
    email,
    phone,
    company,
    country,
    paybackYears: roiResult?.paybackYears,
    recommendation: roiResult?.recommendation,
    fiveYearProfit: roiResult?.fiveYearProfit,
    timestamp: new Date().toISOString(),
  });

  // If RESEND_API_KEY is configured, send notification email
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'scout@evuno.co',
          to: 'sales@evuno.co',
          subject: `[Scout Lead] ${name} — ${country} — ${roiResult?.recommendation}`,
          html: `
            <h2>New Scout Lead</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Country:</strong> ${country}</p>
            <hr>
            <p><strong>Payback:</strong> ${roiResult?.paybackYears?.toFixed(1)} years</p>
            <p><strong>Recommendation:</strong> ${roiResult?.recommendation}</p>
            <p><strong>5-Year Profit:</strong> ${roiResult?.fiveYearProfit}</p>
          `,
        }),
      });
    } catch (err) {
      console.error('[Scout Lead] Email send failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
