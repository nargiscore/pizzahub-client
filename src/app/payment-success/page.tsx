'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
type Profile = { subscriptionPlan?: string };
export default function Success() {
  const [status, S] = useState<'loading' | 'active' | 'pending' | 'error'>('loading');
  async function check() { try { const session = await authClient.getSession(); if (!session.data) { location.replace('/sign-in'); return; } const user = session.data.user as any; if (user.isBlocked) { location.replace('/sign-in?blocked=1'); return; } if (user.role !== 'vendor') { location.replace('/dashboard'); return; } const p = await api<Profile>('/profile'); S(p.subscriptionPlan === 'premium' ? 'active' : 'pending'); } catch { S('error'); } }
  useEffect(() => { check(); }, []);
  return <main className="container section"><div className="card" style={{ maxWidth: 620, margin: 'auto', textAlign: 'center' }}><p className="hero-kicker">STRIPE CHECKOUT</p><h1>{status === 'active' ? 'Premium is active!' : status === 'pending' ? 'Payment confirmation received' : status === 'error' ? 'Unable to verify status' : 'Verifying subscription…'}</h1><p className="muted">{status === 'active' ? 'Your vendor account has Premium access.' : status === 'pending' ? 'Stripe is processing the verified webhook. Premium will be enabled only after the server confirms the payment. Refresh this page in a moment.' : status === 'error' ? 'Please visit your subscription page to check the current status.' : 'Checking your current vendor subscription status.'}</p><div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}><button className="btn secondary" onClick={check}>Refresh Status</button><Link className="btn" href="/dashboard/vendor/subscription">Subscription</Link></div></div></main>;
}
