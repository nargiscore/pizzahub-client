'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
type Profile = { name: string; email: string; image?: string; role: string; businessName?: string };
export default function Profile() {
  const [profile, P] = useState<Profile | null>(null), [name, N] = useState(''), [image, I] = useState(''), [businessName, BN] = useState(''), [busy, B] = useState(false);
  useEffect(() => { authClient.getSession().then(s => { if (!s.data) { location.replace('/sign-in'); return; } if ((s.data.user as any).isBlocked) { location.replace('/sign-in?blocked=1'); return; } if (!['admin', 'vendor', 'customer'].includes((s.data.user as any).role)) {
  location.replace('/');
  return;
} api<Profile>('/profile').then(p => { P(p); N(p.name || ''); I(p.image || ''); BN(p.businessName || ''); }).catch(e => toast.error(e.message)); }); }, []);
  async function save() { B(true); try { await api('/profile', { method: 'PATCH', body: JSON.stringify({ name, image, ...(profile?.role === 'vendor' ? { businessName } : {}) }) }); toast.success('Profile updated'); } catch (e: any) { toast.error(e.message); } finally { B(false); } }
  if (!profile) return <main className="container section"><div className="loading-panel">Loading profile…</div></main>;
  return <main className="container section"><div className="card" style={{ maxWidth: 620, margin: 'auto', display: 'grid', gap: 16 }}><p className="hero-kicker">ACCOUNT PREFERENCES</p><h1 style={{ margin: 0 }}>Profile Settings</h1><p className="muted">{profile.email} · {profile.role}</p><label>Full Name<input required minLength={2} value={name} onChange={e => N(e.target.value)} /></label>{profile.role === 'vendor' && <label>Restaurant / Business Name<input required minLength={2} value={businessName} onChange={e => BN(e.target.value)} /></label>}<label>Profile Image URL (optional)<input type="url" value={image} onChange={e => I(e.target.value)} placeholder="https://…" /></label>{image && <img src={image} alt="Profile preview" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: '50%' }} />}<button className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save Changes'}</button><p className="muted">Your account role and subscription status cannot be changed through profile settings.</p></div></main>;
}
