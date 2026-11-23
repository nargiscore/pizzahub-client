'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
export default function Cancel() {
  useEffect(() => { authClient.getSession().then(s => { if (!s.data) location.replace('/sign-in'); else if ((s.data.user as any).isBlocked) location.replace('/sign-in?blocked=1'); else if ((s.data.user as any).role !== 'vendor') location.replace('/dashboard'); }); }, []);
  return <main className="container section"><div className="card" style={{ maxWidth: 620, margin: 'auto', textAlign: 'center' }}><p className="hero-kicker">CHECKOUT CANCELLED</p><h1>Payment cancelled</h1><p className="muted">No Premium subscription change was made. You can return to your vendor dashboard and try again later.</p><Link className="btn" href="/dashboard/vendor/subscription">Return to Subscription</Link></div></main>;
}
