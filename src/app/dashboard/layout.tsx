'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

const navigation: Record<string, { label: string; href: string }[]> = {
  admin: [{ label: 'Overview', href: '/dashboard/admin' }, { label: 'Manage Users', href: '/dashboard/admin/users' }, { label: 'Manage Menu Items', href: '/dashboard/admin/menu-items' }, { label: 'Transactions', href: '/dashboard/admin/transactions' }],
  vendor: [{ label: 'Overview', href: '/dashboard/vendor' }, { label: 'My Menu Items', href: '/dashboard/vendor/my-items' }, { label: 'Add Menu Item', href: '/dashboard/vendor/add-item' }, { label: 'Customer Orders', href: '/dashboard/vendor/orders' }, { label: 'Subscription', href: '/dashboard/vendor/subscription' }],
  customer: [{ label: 'Overview', href: '/dashboard/customer' }, { label: 'My Orders', href: '/dashboard/customer/orders' }],
};
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname(); const router = useRouter();
  const user = session?.user as any; const role = user?.role as string;
  useEffect(() => { if (isPending) return; if (!session) router.replace('/sign-in'); else if ((session.user as any).isBlocked) router.replace('/sign-in?blocked=1'); else if (!['admin', 'vendor', 'customer'].includes(role)) router.replace('/'); else if (!pathname.startsWith(`/dashboard/${role}`) && pathname !== '/dashboard') router.replace(`/dashboard/${role}`); }, [isPending, session, role, pathname, router]);
  if (isPending || !session || !navigation[role]) return <main className="container section"><div className="loading-panel">Loading your secure dashboard…</div></main>;
  return <div className="dashboard-wrap"><aside className="dashboard-sidebar"><div className="sidebar-user">{user?.image ? <img className="avatar avatar-large" src={user.image} alt="Profile" style={{ objectFit: 'cover' }} /> : <span className="avatar avatar-large">{(user?.name || 'U').slice(0,1).toUpperCase()}</span>}<div><b>{user?.name}</b><small>{role} account</small></div></div><p className="sidebar-label">WORKSPACE</p>{navigation[role].map(item => <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'selected' : ''}`}>{item.label}</Link>)}<Link href={`/dashboard/${role}/profile-settings`} className="sidebar-link">
  Profile Settings
</Link><Link href="/" className="sidebar-link">Back to Website</Link></aside><section className="dashboard-content">{children}</section></div>;
}
