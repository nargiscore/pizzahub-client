'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
export default function SignIn() {
  const [email, E] = useState(''), [password, P] = useState(''), [busy, B] = useState(false);
  async function google() { try { const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' }); if (result.error) toast.error(result.error.message || 'Google sign in failed'); } catch (e: any) { toast.error(e.message || 'Google sign in failed'); } }
  async function submit(e: React.FormEvent) { e.preventDefault(); B(true); try { const result = await authClient.signIn.email({ email, password }); if (result.error) throw new Error(result.error.message || 'Sign in failed'); toast.success('Signed in successfully'); location.href = '/dashboard'; } catch (e: any) { toast.error(e.message); } finally { B(false); } }
  return <main className="container section"><form className="card" style={{ maxWidth: 460, margin: 'auto', display: 'grid', gap: 18 }} onSubmit={submit}><p className="hero-kicker">WELCOME BACK</p><h1 style={{ margin: 0 }}>Sign in to PizzaHub</h1><label>Email<input type="email" required value={email} onChange={e => E(e.target.value)} /></label><label>Password<input type="password" required value={password} onChange={e => P(e.target.value)} /></label><Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</Button><button type="button" className="btn secondary" onClick={google}>Continue with Google</button><p className="muted">New to PizzaHub? <Link href="/sign-up" style={{ color: 'var(--brand)', fontWeight: 750 }}>Create an account</Link></p></form></main>;
}
