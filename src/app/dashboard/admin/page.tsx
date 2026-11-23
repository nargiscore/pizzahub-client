'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
type Stats = { users: number; vendors: number; customers: number; items: number; pending: number; transactions: number; recentOrders: { _id: string; count: number }[] };
export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState('');
  useEffect(() => { api<Stats>('/admin/stats').then(setStats).catch(e => setError(e.message)); }, []);
  const metrics = stats ? [['Registered Users', stats.users], ['Vendors', stats.vendors], ['Customers', stats.customers], ['Menu Items', stats.items], ['Pending Reviews', stats.pending], ['Transactions', stats.transactions]] : [];
  const max = Math.max(1, ...(stats?.recentOrders || []).map(x => x.count));
  return <main className="section"><div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}><div><p className="hero-kicker">PLATFORM CONTROL</p><h1 style={{ margin: '5px 0' }}>Admin Overview</h1><p className="muted">Monitor users, menu approvals, and subscription activity.</p></div><Link className="btn" href="/dashboard/admin/menu-items">Review Menu Items</Link></div>
    {error ? <div className="empty-state">{error}</div> : !stats ? <div className="loading-panel">Loading platform statistics…</div> : <><div className="grid" style={{ marginTop: 24 }}>{metrics.map(([label, value]) => <Card className="metric-card" key={label as string}><small>{label}</small><strong>{value}</strong></Card>)}</div>
      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr', marginTop: 22 }}><div className="card"><h2>Order Activity</h2><p className="muted">Orders created during the last seven days</p><div className="chart-bars">{stats.recentOrders.map(x => <div className="chart-bar" key={x._id} style={{ height: `${Math.max(8, x.count / max * 100)}%` }}><span>{x._id.slice(5)}</span></div>)}</div></div><div className="card"><h2>Quick Actions</h2><div style={{ display: 'grid', gap: 10 }}><Link className="btn secondary" href="/dashboard/admin/users">Manage Users</Link><Link className="btn secondary" href="/dashboard/admin/menu-items">Manage Menu Items</Link><Link className="btn secondary" href="/dashboard/admin/transactions">View Transactions</Link></div></div></div></>}
  </main>;
}
