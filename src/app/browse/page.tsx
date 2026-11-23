'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

type Item = { _id: string; itemName: string; category: string; price: number; location: string; images?: string[]; vendor?: { name?: string; businessName?: string; subscriptionPlan?: string; isPremiumActive?: boolean } };
const categories = ['Classic Pizzas', 'Vegetarian Pizzas', 'Meat Lovers', 'Specialty / Gourmet Pizzas', 'Sides & Appetizers', 'Beverages & Desserts'];
export default function Browse() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]), [search, S] = useState(''), [category, C] = useState(''), [location, L] = useState(''), [sort, T] = useState('');
  const [loading, Q] = useState(true), [error, E] = useState(''), [total, setTotal] = useState(0);
  useEffect(() => { const params = new URLSearchParams(window.location.search); C(params.get('category') || ''); }, []);
  useEffect(() => {
    let active = true; Q(true); E(''); const p = new URLSearchParams(); if (search.trim()) p.set('search', search.trim()); if (category) p.set('category', category); if (location.trim()) p.set('location', location.trim()); if (sort) p.set('sort', sort); p.set('limit', '48');
    api<{ items: Item[]; total: number }>(`/menu?${p}`).then(d => { if (active) { setItems(d.items); setTotal(d.total); } }).catch(e => { if (active) E(e.message); }).finally(() => { if (active) Q(false); });
    return () => { active = false; };
  }, [search, category, location, sort]);
  async function viewDetails(id: string) { const session = await authClient.getSession(); if (!session.data) router.push('/sign-in'); else router.push(`/menu/${id}`); }
  return <main className="container section"><p className="hero-kicker">THE LOCAL PIZZA GUIDE</p><h1>Browse Pizza Menu</h1><p className="muted">Explore approved and available menu items from local restaurants.</p>
    <div className="filter-grid"><input placeholder="Search by item name or description" value={search} onChange={e => S(e.target.value)} /><select value={category} onChange={e => C(e.target.value)}><option value="">All categories</option>{categories.map(x => <option key={x}>{x}</option>)}</select><input placeholder="Filter by location" value={location} onChange={e => L(e.target.value)} /><select value={sort} onChange={e => T(e.target.value)}><option value="">Newest first</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select></div>
    <p className="muted" style={{ fontSize: 13 }}>{total} menu item{total === 1 ? '' : 's'} found</p>
    {loading ? <div className="empty-state">Loading menu items…</div> : error ? <div className="empty-state" role="alert">{error}</div> : items.length === 0 ? <div className="empty-state">No menu items match your filters. Try a different search.</div> : <div className="grid">{items.map(x => <article className="card item-card" key={x._id}>
      {x.images?.[0] ? <img className="menu-image" src={x.images[0]} alt={x.itemName} /> : <div className="menu-image" style={{ display: 'grid', placeItems: 'center', fontSize: 72 }}>🍕</div>}
      <h3>{x.itemName}</h3><p className="muted">{x.category} · {x.location}</p><p className="muted">{x.vendor?.businessName || x.vendor?.name || 'Local restaurant'} {x.vendor?.isPremiumActive && <span className="status-pill">Premium</span>}</p><strong style={{ fontSize: 20 }}>৳{x.price}</strong><button className="btn" onClick={() => viewDetails(x._id)}>View Details</button>
    </article>)}</div>}
  </main>;
}
