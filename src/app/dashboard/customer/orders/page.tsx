
'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type History = {
  status: string;
  at: string;
};

type Order = {
  _id: string;
  itemName: string;
  itemImage?: string;
  vendorName?: string;
  deliveryDate: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  message?: string;
  statusHistory?: History[];
};

function formatDate(value?: string) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString();
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
    delivered: 'Delivered',
  };

  return labels[status.toLowerCase()] || status;
}

export default function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState('');
  const [cancelingId, setCancelingId] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      const data = await api<Order[]>('/orders/mine');
      setItems(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load your orders.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function cancelOrder(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) return;

    setCancelingId(id);

    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });

      toast.success('Your order has been cancelled successfully.');
      await loadOrders();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to cancel this order.';

      toast.error(message);
    } finally {
      setCancelingId('');
    }
  }

  return (
    <main className="section">
      <p className="hero-kicker">ORDER HISTORY</p>

      <h1>My Orders</h1>

      <p className="muted">
        Review your orders, check delivery information, and follow
        the progress of each request.
      </p>

      {loading ? (
        <div className="loading-panel">
          Loading your orders...
        </div>
      ) : items.length > 0 ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {items.map((order) => {
            const isExpanded = expanded === order._id;
            const isCanceling = cancelingId === order._id;
            const canCancel =
              order.status.toLowerCase() === 'pending';

            const history =
              order.statusHistory?.length
                ? order.statusHistory
                : [
                    {
                      status: 'pending',
                      at: order.createdAt,
                    },
                  ];

            return (
              <article className="card" key={order._id}>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {order.itemImage && (
                    <img
                      src={order.itemImage}
                      alt={order.itemName}
                      style={{
                        width: 100,
                        height: 82,
                        objectFit: 'cover',
                        borderRadius: 12,
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <h3 style={{ margin: '0 0 6px' }}>
                      {order.itemName}
                    </h3>

                    <p className="muted" style={{ margin: 0 }}>
                      {order.vendorName || 'Restaurant partner'}
                    </p>

                    <p className="muted" style={{ margin: '5px 0 0' }}>
                      Delivery: {order.deliveryDate || 'Not specified'}
                    </p>
                  </div>

                  <span
                    className={`status-pill status-${order.status.toLowerCase()}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div
                  className="grid"
                  style={{ marginTop: 16, gap: 12 }}
                >
                  <div>
                    <p style={{ marginBottom: 5 }}>
                      <b>Delivery Address</b>
                    </p>

                    <p className="muted" style={{ margin: 0 }}>
                      {order.deliveryAddress || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p style={{ marginBottom: 5 }}>
                      <b>Request Date</b>
                    </p>

                    <p className="muted" style={{ margin: 0 }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginTop: 16,
                  }}
                >
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() =>
                      setExpanded(isExpanded ? '' : order._id)
                    }
                  >
                    {isExpanded
                      ? 'Hide Details & Timeline'
                      : 'View Details & Timeline'}
                  </button>

                  {canCancel && (
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={isCanceling}
                      onClick={() => cancelOrder(order._id)}
                    >
                      {isCanceling
                        ? 'Cancelling...'
                        : 'Cancel Pending Order'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 18,
                      borderTop: '1px solid var(--line)',
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>
                      Order Details
                    </h3>

                    <p>
                      <b>Additional Message:</b>{' '}
                      <span className="muted">
                        {order.message || 'No additional instructions'}
                      </span>
                    </p>

                    <h3 style={{ marginTop: 22 }}>
                      Order Status Timeline
                    </h3>

                    <div
                      style={{
                        borderLeft: '2px solid var(--line)',
                        paddingLeft: 18,
                        display: 'grid',
                        gap: 16,
                      }}
                    >
                      {history.map((entry, index) => (
                        <div key={`${entry.status}-${index}`}>
                          <b style={{ textTransform: 'capitalize' }}>
                            {getStatusLabel(entry.status)}
                          </b>

                          <small
                            className="muted"
                            style={{ display: 'block', marginTop: 4 }}
                          >
                            {formatDate(entry.at)}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Orders Yet</h3>
          <p className="muted">
            You have not placed any orders yet. Explore the menu
            and place your first order!
          </p>
        </div>
      )}
    </main>
  );
}
