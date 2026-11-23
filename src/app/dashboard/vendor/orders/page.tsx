'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
type Order = { _id: string; itemName: string; itemImage?: string; deliveryDate: string; deliveryAddress: string; message: string; status: string; customerName?: string; customerEmail?: string; createdAt: string };
export default function Orders() {
  const [items, I] = useState<Order[]>([]), [loading, L] = useState(true);
  async function load() { try { I(await api<Order[]>('/orders/vendor')); } catch (e: any) { toast.error(e.message); } finally { L(false); } }
  useEffect(() => { load(); }, []);
  async function act(id: string, status: string) { try { await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); toast.success(`Order ${status}`); load(); } catch (e: any) { toast.error(e.message); } }
  return <main className="section"><p className="hero-kicker">INCOMING REQUESTS</p><h1>Customer Orders</h1><p className="muted">Review customer and delivery details. Only pending orders can be accepted or rejected.</p>{loading ? <div className="loading-panel">Loading customer orders…</div> : items.length ? <div className="grid">{items.map(o => <article className="card" key={o._id} style={{ display: 'grid', gap: 9 }}>{o.itemImage && <img src={o.itemImage} className="menu-image" alt={o.itemName} style={{ height: 145 }} />}<h3 style={{ margin: 0 }}>{o.itemName}</h3><span className={`status-pill status-${o.status}`}>{o.status}</span><p><b>Customer:</b> {o.customerName || 'Customer'} · {o.customerEmail || ''}</p><p><b>Delivery:</b> {o.deliveryDate}</p><p><b>Address:</b> {o.deliveryAddress}</p><p><b>Message:</b> {o.message || 'No additional instructions'}</p><small className="muted">Requested {new Date(o.createdAt).toLocaleString()}</small>{o.status === 'pending' && <div style={{ display: 'flex', gap: 8 }}><button className="btn" onClick={() => act(o._id, 'accepted')}>Accept</button><button className="btn secondary" onClick={() => act(o._id, 'rejected')}>Reject</button></div>}</article>)}</div> : <div className="empty-state">No customer orders yet.</div>}</main>;
}
