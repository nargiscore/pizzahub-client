'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
type User = { _id: string; name: string; email: string; role: string; isBlocked?: boolean; businessName?: string; subscriptionPlan?: string; createdAt?: string };
export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]), [search, setSearch] = useState(''), [role, setRole] = useState(''), [loading, setLoading] = useState(true);
  async function load() { setLoading(true); try { const p = new URLSearchParams(); if (search) p.set('search', search); if (role) p.set('role', role); setUsers(await api<User[]>(`/admin/users?${p}`)); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); } }
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search, role]);
  async function block(user: User) { try { await api(`/admin/users/${user._id}/block`, { method: 'PATCH', body: JSON.stringify({ isBlocked: !user.isBlocked }) }); toast.success(user.isBlocked ? 'User unblocked' : 'User blocked'); load(); } catch (e: any) { toast.error(e.message); } }
  return <main className="section"><p className="hero-kicker">ACCOUNT DIRECTORY</p><h1>Manage Users</h1><p className="muted">Search registered vendors and customers, filter by role, and manage account access.</p><div className="filter-grid" style={{ gridTemplateColumns: '2fr 1fr' }}><input placeholder="Search name, email, or business" value={search} onChange={e => setSearch(e.target.value)} /><select value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="vendor">Vendor</option><option value="customer">Customer</option></select></div>
    {loading ? <div className="loading-panel">Loading users…</div> : users.length ? <div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Subscription</th><th>Joined</th><th>Access</th><th>Action</th></tr></thead><tbody>{users.map(u => <tr key={u._id}><td><b>{u.name || u.businessName || 'Unnamed user'}</b>{u.businessName && <small style={{ display: 'block', color: 'var(--muted)' }}>{u.businessName}</small>}</td><td>{u.email}</td><td><span className="status-pill">{u.role}</span></td><td>{u.role === 'vendor' ? u.subscriptionPlan || 'free' : '—'}</td><td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td><td><span className={`status-pill ${u.isBlocked ? 'status-rejected' : 'status-approved'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td><td><button className="btn secondary" onClick={() => block(u)}>{u.isBlocked ? 'Unblock' : 'Block'}</button></td></tr>)}</tbody></table></div> : <div className="empty-state">No users found.</div>}
  </main>;
}
