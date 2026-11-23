'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
type Transaction = { _id: string; vendorId: string; plan: string; amount: number | null; currency: string; status: string; createdAt: string; stripeSessionId: string; vendor?: { name?: string; email?: string; businessName?: string } };
export default function Transactions() {
  const [items, setItems] = useState<Transaction[]>([]), [loading, setLoading] = useState(true);
  useEffect(() => { api<Transaction[]>('/admin/transactions').then(setItems).catch(e => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  return <main className="section"><p className="hero-kicker">BILLING RECORDS</p><h1>Transactions</h1><p className="muted">Read-only records of vendor subscription payments. Payment records cannot be edited by admins.</p>
    {loading ? <div className="loading-panel">Loading transactions…</div> : items.length ? <div className="table-wrap"><table><thead><tr><th>Vendor</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th>Stripe Session</th></tr></thead><tbody>{items.map(t => <tr key={t._id}><td><b>{t.vendor?.businessName || t.vendor?.name || 'Vendor'}</b><small style={{ display: 'block', color: 'var(--muted)' }}>{t.vendor?.email}</small></td><td>{t.plan}</td><td>{t.amount == null ? '—' : `${(t.amount / 100).toFixed(2)} ${(t.currency || '').toUpperCase()}`}</td><td><span className={`status-pill status-${t.status}`}>{t.status}</span></td><td>{new Date(t.createdAt).toLocaleString()}</td><td><code>{t.stripeSessionId?.slice(0, 18) || '—'}</code></td></tr>)}</tbody></table></div> : <div className="empty-state">No transactions recorded yet.</div>}
  </main>;
}
