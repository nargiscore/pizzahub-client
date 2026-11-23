
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

type Item = {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  location: string;
  images?: string[];
  vendor?: {
    name?: string;
    businessName?: string;
    subscriptionPlan?: string;
    isPremiumActive?: boolean;
  };
};

const categories = [
  'Classic Pizzas',
  'Vegetarian Pizzas',
  'Meat Lovers',
  'Specialty / Gourmet Pizzas',
  'Sides & Appetizers',
  'Beverages & Desserts',
];

export default function Browse() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // Initialize category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get('category') || '');
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch menu items
  useEffect(() => {
    let active = true;

    async function fetchItems() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      if (category) {
        params.set('category', category);
      }

      if (location.trim()) {
        params.set('location', location.trim());
      }

      if (sort) {
        params.set('sort', sort);
      }

      params.set('limit', '48');

      try {
        const data = await api<{ items: Item[]; total: number }>(
          `/menu?${params.toString()}`
        );

        if (active) {
          setItems(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load menu items. Please try again.'
          );
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchItems();

    return () => {
      active = false;
    };
  }, [debouncedSearch, category, location, sort]);

  async function viewDetails(id: string) {
    try {
      const session = await authClient.getSession();

      if (!session.data) {
        router.push('/sign-in');
        return;
      }

      router.push(`/menu/${id}`);
    } catch {
      router.push('/sign-in');
    }
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setLocation('');
    setSort('');
  }

  return (
    <main className="container section">
      <p className="hero-kicker">THE LOCAL PIZZA GUIDE</p>

      <h1>Browse Pizza Menu</h1>

      <p className="muted">
        Explore approved and available menu items from local restaurants.
      </p>

      <div className="filter-grid">
        <input
          type="search"
          placeholder="Search by item name or description"
          aria-label="Search menu items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Filter by location"
          aria-label="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          aria-label="Sort menu items"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          margin: '16px 0',
        }}
      >
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          {loading
            ? 'Searching menu items...'
            : `${total} menu item${total === 1 ? '' : 's'} found`}
        </p>

        <button
          type="button"
          className="btn"
          onClick={clearFilters}
          disabled={!search && !category && !location && !sort}
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="empty-state" role="status">
          Loading menu items…
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => setDebouncedSearch((value) => `${value} `)}
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          No menu items match your filters. Try a different search.
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <article className="card item-card" key={item._id}>
              {item.images?.[0] ? (
                <img
                  className="menu-image"
                  src={item.images[0]}
                  alt={item.itemName}
                />
              ) : (
                <div
                  className="menu-image"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 72,
                  }}
                  aria-label="Pizza image unavailable"
                >
                  🍕
                </div>
              )}

              <h3>{item.itemName}</h3>

              <p className="muted">
                {item.category} · {item.location}
              </p>

              <p className="muted">
                {item.vendor?.businessName ||
                  item.vendor?.name ||
                  'Local restaurant'}{' '}
                {item.vendor?.isPremiumActive && (
                  <span className="status-pill">Premium</span>
                )}
              </p>

              <strong style={{ fontSize: 20 }}>
                ৳{item.price}
              </strong>

              <button
                type="button"
                className="btn"
                onClick={() => viewDetails(item._id)}
              >
                View Details
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
