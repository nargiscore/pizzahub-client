'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

type MenuItem = { _id: string; itemName: string; category: string; description: string; price: number; location: string; images?: string[]; vendor?: { name?: string; businessName?: string; subscriptionPlan?: string; isPremiumActive?: boolean } };
const categories = [
  ['🍕', 'Classic Pizzas', 'Timeless favorites, baked fresh'], ['🥦', 'Vegetarian Pizzas', 'Fresh, colorful ingredients'], ['🥓', 'Meat Lovers', 'Hearty and full of flavor'],
  ['✨', 'Specialty / Gourmet Pizzas', 'Creative signature combinations'], ['🧄', 'Sides & Appetizers', 'The perfect extras'], ['🥤', 'Beverages & Desserts', 'A sweet finish'],
];
export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api<MenuItem[]>('/menu/featured').then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  return <main>
    <section className="hero"><div className="container hero-inner"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
      <p className="hero-kicker">FRESH FROM LOCAL OVENS</p><h1>Good pizza brings people together.</h1><p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 540, color: '#70584b' }}>Discover neighborhood pizza shops, explore their menus, and order your next favorite with PizzaHub.</p><Link className="btn" href="/browse">Explore Pizza Menu <span>→</span></Link>
      <div style={{ display: 'flex', gap: 22, marginTop: 28, color: '#765c4d', fontSize: 13, fontWeight: 700 }}><span>✓ Local restaurants</span><span>✓ Easy ordering</span><span>✓ Fresh favorites</span></div>
    </motion.div><motion.div className="hero-art" initial={{ opacity: 0, scale: .85, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .7 }}>🍕</motion.div></div></section>

    <section className="section container"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 18, flexWrap: 'wrap' }}><div><p className="hero-kicker">HANDPICKED FOR YOU</p><h2 style={{ fontSize: 36, margin: '6px 0' }}>Featured Menu Items</h2><p className="muted">Fresh picks from approved restaurant partners.</p></div><Link href="/browse" style={{ color: 'var(--brand)', fontWeight: 800 }}>Browse all menu →</Link></div>
      {loading ? <div className="empty-state" style={{ marginTop: 24 }}>Loading featured menu items…</div> : items.length ? <div className="grid" style={{ marginTop: 25 }}>{items.slice(0, 6).map((item, index) => <motion.article className="card item-card" key={item._id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}>
        {item.images?.[0] ? <img className="menu-image" src={item.images[0]} alt={item.itemName} /> : <div className="menu-image" style={{ display: 'grid', placeItems: 'center', fontSize: 70 }}>🍕</div>}
        <h3>{item.itemName}</h3><p className="muted">{item.category} · {item.location}</p><p className="muted">{item.vendor?.businessName || item.vendor?.name || 'Local restaurant'} {item.vendor?.isPremiumActive ? '✦ Premium' : ''}</p><strong style={{ fontSize: 20 }}>৳{item.price}</strong><Link className="btn" href={`/menu/${item._id}`}>View Details</Link>
      </motion.article>)}</div> : <div className="empty-state" style={{ marginTop: 24 }}>No approved menu items are available yet. Check back soon or explore the menu.</div>}
    </section>

    <section className="section" style={{ background: 'var(--surface)' }}><div className="container"><p className="hero-kicker">FIND YOUR FAVORITE</p><h2 style={{ fontSize: 36, margin: '6px 0 24px' }}>Explore Pizza Categories</h2><div className="grid">{categories.map(([icon, name, desc]) => <Link key={name} href={`/browse?category=${encodeURIComponent(name)}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}><span style={{ fontSize: 34 }}>{icon}</span><span><b>{name}</b><small className="muted" style={{ display: 'block', marginTop: 4 }}>{desc}</small></span><span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>→</span></Link>)}</div></div></section>

    <section className="section container"><p className="hero-kicker">THE PIZZHUB DIFFERENCE</p><h2 style={{ fontSize: 36, margin: '6px 0 24px' }}>Why Choose PizzaHub?</h2><div className="grid"><motion.article className="card" whileHover={{ y: -4 }}><h3>📍 Local favorites</h3><p className="muted">Discover nearby pizza shops and explore what each restaurant makes best.</p></motion.article><motion.article className="card" whileHover={{ y: -4 }}><h3>🧾 Clear menu details</h3><p className="muted">Compare item descriptions, categories, prices, and restaurant locations before ordering.</p></motion.article><motion.article className="card" whileHover={{ y: -4 }}><h3>📦 Order updates</h3><p className="muted">Send your delivery request and follow its status as the restaurant responds.</p></motion.article></div></section>

    <section className="section" style={{ background: 'var(--surface-2)' }}><div className="container"><p className="hero-kicker">THREE SIMPLE STEPS</p><h2 style={{ fontSize: 36, margin: '6px 0 24px' }}>How PizzaHub Works</h2><div className="grid"><div className="card"><span className="hero-kicker">01 / EXPLORE</span><h3>Find your pizza</h3><p className="muted">Browse approved restaurant menus and filter by category or location.</p></div><div className="card"><span className="hero-kicker">02 / ORDER</span><h3>Send your request</h3><p className="muted">Choose an item, select a delivery date, and provide your address.</p></div><div className="card"><span className="hero-kicker">03 / ENJOY</span><h3>Track the response</h3><p className="muted">See when the restaurant accepts or rejects your order request.</p></div></div></div></section>
  </main>;
}
