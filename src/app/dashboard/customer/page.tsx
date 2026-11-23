
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Order = {
  _id: string;
  status: string;
  itemName: string;
  deliveryDate: string;
  createdAt: string;
};

export default function Customer() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Order[]>('/orders/mine')
      .then(setOrders)
      .catch((e) => setError(e.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const accepted = orders.filter((o) => o.status === 'accepted').length;
  const rejected = orders.filter((o) => o.status === 'rejected').length;
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;

  const counts = [
    ['Total Orders', orders.length],
    ['Pending', pending],
    ['Accepted', accepted],
    ['Rejected', rejected],
  ];

  const statusData = [
    ['Pending', pending],
    ['Accepted', accepted],
    ['Rejected', rejected],
    ['Cancelled', cancelled],
  ];

  return (
    <main className="section">
      <p className="hero-kicker">YOUR PIZZA ACTIVITY</p>
      <h1>Customer Overview</h1>
      <p className="muted">
        Keep track of your order requests and delivery plans.
      </p>

      {loading ? (
        <div className="loading-panel">Loading your dashboard...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <>
          <div className="grid" style={{ marginTop: 22 }}>
            {counts.map(([label, value]) => (
              <div className="metric-card" key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              marginTop: 22,
            }}
          >
            <div className="card">
              <h2>Order Status</h2>
              <p className="muted">Your current order breakdown</p>

              <div className="chart-bars">
                {statusData.map(([label, count]) => (
                  <div
                    className="chart-bar"
                    key={label}
                    style={{
                      height: `${Math.max(
                        8,
                        (Number(count) / Math.max(1, orders.length)) * 100
                      )}%`,
                    }}
                  >
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <h2>Recent Orders</h2>
                <Link
                  className="btn secondary"
                  href="/dashboard/customer/orders"
                >
                  View All Orders
                </Link>
              </div>

              {orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '13px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div>
                    <b>{order.itemName}</b>
                    <small className="muted" style={{ display: 'block' }}>
                      Delivery: {order.deliveryDate}
                    </small>
                  </div>

                  <span className={`status-pill status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              ))}

              {!orders.length && (
                <p className="muted">
                  No orders yet.{' '}
                  <Link href="/browse" style={{ color: 'var(--brand)' }}>
                    Explore the menu
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
