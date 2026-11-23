'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
export default function SignUp() {
  const [name, N] = useState(''), [email, E] = useState(''), [password, P] = useState(''), [role, R] = useState('customer'), [businessName, BN] = useState(''), [image, IM] = useState(''), [busy, B] = useState(false);
  async function google() { try { const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' }); if (result.error) toast.error(result.error.message || 'Google sign up failed'); } catch (e: any) { toast.error(e.message || 'Google sign up failed'); } }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) { toast.error('Password needs 6+ characters, one uppercase and one lowercase letter'); return; }
    if (role === 'vendor' && businessName.trim().length < 2) { toast.error('Enter your restaurant / business name'); return; }
    B(true);
    try {
      const result = await authClient.signUp.email({ name: name.trim(), email, password, role, ...(image.trim() ? { image: image.trim() } : {}) } as any);
      if (result.error) throw new Error(result.error.message || 'Registration failed');
      if (role === 'vendor' && businessName.trim()) { try { await api('/profile', { method: 'PATCH', body: JSON.stringify({ businessName: businessName.trim() }) }); } catch { toast.error('Account created. Please add your restaurant name in Profile Settings.'); } }
      toast.success('Account created successfully'); location.href = '/dashboard';
    } catch (e: any) { toast.error(e.message); } finally { B(false); }
  }
  return <main className="container section"><form className="card" style={{ maxWidth: 500, margin: 'auto', display: 'grid', gap: 16 }} onSubmit={submit}><p className="hero-kicker">JOIN THE PIZZHUB COMMUNITY</p><h1 style={{ margin: 0 }}>Create your account</h1><label>Full Name<input required minLength={2} maxLength={80} value={name} onChange={e => N(e.target.value)} /></label><label>Email<input type="email" required value={email} onChange={e => E(e.target.value)} /></label><label>Password<input type="password" required minLength={6} value={password} onChange={e => P(e.target.value)} /><small className="muted">At least 6 characters, including uppercase and lowercase letters.</small></label><label>Account Role<select value={role} onChange={e => R(e.target.value)}><option value="customer">Customer</option><option value="vendor">Vendor (Restaurant Owner)</option></select></label>{role === 'vendor' && <label>Restaurant / Business Name<input required value={businessName} onChange={e => BN(e.target.value)} /></label>}<label>Profile Image URL (optional)<input type="url" value={image} onChange={e => IM(e.target.value)} placeholder="https://…" /></label><Button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</Button><button type="button" className="btn secondary" onClick={google}>Continue with Google</button><p className="muted">Already registered? <Link href="/sign-in" style={{ color: 'var(--brand)', fontWeight: 750 }}>Sign In</Link></p></form></main>;
}
