'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@evuno/ui';

const plans = [
  { id: 'free', name: 'Free', price: '$0', features: ['Up to 2 chargers', 'Basic monitoring', 'Email support'] },
  { id: 'starter', name: 'Starter', price: '$49/mo', features: ['Up to 10 chargers', 'Session analytics', 'Remote management', '1.5% per session'] },
  { id: 'growth', name: 'Growth', price: '$99/mo', features: ['Up to 50 chargers', 'Advanced analytics', 'Priority support', '1.5% per session', 'White-label branding'] },
  { id: 'enterprise', name: 'Enterprise', price: '$199/mo', features: ['Unlimited chargers', 'Custom integrations', 'Dedicated support', '1.0% per session', 'Full white-label', 'SLA guarantee'] },
];

// Demo data
const currentPlan = 'growth';
const demoInvoices = [
  { id: 'inv_001', date: '2026-04-01', amount: '$99.00', status: 'paid' },
  { id: 'inv_002', date: '2026-03-01', amount: '$99.00', status: 'paid' },
  { id: 'inv_003', date: '2026-02-01', amount: '$49.00', status: 'paid' },
];

export default function BillingPage() {
  const t = useTranslations('nav');

  return (
    <div>
      <h1 className="text-xl font-semibold text-text mb-6">{t('billing')}</h1>

      {/* Plan Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === currentPlan ? 'border-accent' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.id === currentPlan && <Badge>Current</Badge>}
              </div>
              <p className="text-xl font-mono font-semibold text-accent">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-text-muted flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.id === currentPlan ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant={plans.indexOf(plan) > plans.findIndex((p) => p.id === currentPlan) ? 'default' : 'outline'}
                  className="w-full"
                >
                  {plans.indexOf(plan) > plans.findIndex((p) => p.id === currentPlan) ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-muted border-b border-border">
                <th className="text-left py-2 font-medium">Invoice</th>
                <th className="text-left py-2 font-medium">Date</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-right py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {demoInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm text-text font-mono">{invoice.id}</td>
                  <td className="py-3 text-sm text-text-muted">{invoice.date}</td>
                  <td className="py-3 text-sm text-text font-mono text-right">{invoice.amount}</td>
                  <td className="py-3 text-right">
                    <Badge variant="default">{invoice.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
