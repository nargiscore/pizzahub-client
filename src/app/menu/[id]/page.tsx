'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

type Item = { _id: string; itemName: string; description: string; category: string; price: number; location: string; images: string[]; vendorId: string; vendor?: { name?: string; businessName?: string; image?: string; subscriptionPlan?: string; isPremiumActive?: boolean } };
export default function Details() {
  const { id } = useParams<{ id: string }>(), router = useRouter();
  const [item, I] = useState<Item | null>(null), [date, D] = useState(''), [address, A] = useState(''), [message, M] = useState(''), [busy, B] = useState(false), [error, E] = useState('');
  useEffect(() => { let alive = true; (async () => { const session = await authClient.getSession(); if (!session.data) { router.replace('/sign-in'); return; } const user = session.data.user as any; if (user.isBlocked) { router.replace('/sign-in?blocked=1'); return; } if (user.role !== 'customer') { router.replace('/dashboard'); return; } try { const data = await api<Item>(`/menu/${id}`); if (alive) I(data); } catch (e: any) { if (alive) E(e.message); } })(); return () => { alive = false; }; }, [id, router]);
  async function order(e: React.FormEvent) { e.preventDefault(); B(true); try { await api('/orders', { method: 'POST', body: JSON.stringify({ itemId: id, deliveryDate: date, deliveryAddress: address, message }) }); toast.success('Order request submitted'); router.push('/dashboard/customer/orders'); } catch (e: any) { toast.error(e.message); } finally { B(false); } }
  if (error) return <main className="container section"><div className="empty-state" role="alert">{error}<p><button className="btn secondary" onClick={() => router.push('/browse')}>Back to Browse</button></p></div></main>;
  if (!item) return <main className="container section"><div className="loading-panel">Loading menu item…</div></main>;
  const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return <main className="container section"><div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(300px,.8fr)', alignItems: 'start' }}>
    <section className="card">{item.images?.length ? <div className="grid">{item.images.slice(0, 5).map((src, i) => <img key={src} className="menu-image" style={{ height: i === 0 ? 300 : 130, gridColumn: i === 0 ? '1/-1' : 'auto' }} src={src} alt={`${item.itemName} ${i + 1}`} />)}</div> : <div className="menu-image" style={{ height: 300, display: 'grid', placeItems: 'center', fontSize: 120 }}>🍕</div>}
      <p className="hero-kicker" style={{ marginTop: 20 }}>{item.category}</p><h1>{item.itemName}</h1><p className="muted">{item.description}</p><h2 style={{ color: 'var(--brand)' }}>৳{item.price}</h2><p><b>Location:</b> {item.location}</p><div className="card" style={{ background: 'var(--surface-2)', boxShadow: 'none' }}><b>{item.vendor?.businessName || item.vendor?.name || 'Restaurant partner'}</b>{item.vendor?.isPremiumActive && <span className="status-pill" style={{ marginLeft: 8 }}>Premium Vendor</span>}<p className="muted">Restaurant partner on PizzaHub</p></div>
    </section>
    <form className="card" onSubmit={order} style={{ display: 'grid', gap: 16 }}><p className="hero-kicker">PLACE YOUR REQUEST</p><h2 style={{ margin: 0 }}>Order Details</h2><p className="muted">Your account and the selected restaurant are detected automatically.</p><label>Delivery Date<input type="date" min={today} required value={date} onChange={e => D(e.target.value)} /></label><label>Delivery Address<textarea required minLength={8} value={address} onChange={e => A(e.target.value)} placeholder="House, road, area, city" /></label><label>Additional Message / Special Instructions<textarea value={message} onChange={e => M(e.target.value)} maxLength={1000} placeholder="Any delivery instructions (optional)" /></label><button className="btn" disabled={busy}>{busy ? 'Submitting order…' : 'Submit Order Request'}</button><small className="muted">PizzaHub does not collect customer pizza payments through Stripe.</small></form>
  </div></main>;
}
