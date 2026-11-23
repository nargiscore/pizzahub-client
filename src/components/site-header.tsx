'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import ThemeToggle from './theme-toggle';

export default function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = session?.user as any;
  const role = user?.role;
  async function logout() { await authClient.signOut(); setOpen(false); router.push('/'); router.refresh(); }
  const links = [{ href: '/', label: 'Home' }, { href: '/browse', label: 'Browse Menu' }];
  return <header className="site-header"><nav className="container nav-inner">
    <Link href="/" className="brand"><span className="brand-mark">P</span><span>Pizza<span className="brand-accent">Hub</span></span></Link>
    <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
    <div className={`nav-links ${open ? 'nav-open' : ''}`}>
      {links.map(link => <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''} onClick={() => setOpen(false)}>{link.label}</Link>)}
      {!isPending && session && <Link href={`/dashboard/${role || 'customer'}`} onClick={() => setOpen(false)}>Dashboard</Link>}
      <ThemeToggle />
      {!isPending && !session && <><Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link><Link className="btn nav-cta" href="/sign-up" onClick={() => setOpen(false)}>Get Started</Link></>}
      {!isPending && session && <div className="profile-menu">
        <button className="profile-trigger" onClick={() => setOpen(!open)}>{user?.image ? <img className="avatar" src={user.image} alt="Profile" style={{ objectFit: 'cover' }} /> : <span className="avatar">{(user?.name || 'U').slice(0,1).toUpperCase()}</span>}<span>{user?.name || 'Account'}</span><span>⌄</span></button>
        <div className="profile-dropdown"><Link href={`/dashboard/${role || 'customer'}`}>Dashboard</Link><Link href="/profile-settings">Profile Settings</Link><button onClick={logout}>Sign Out</button></div>
      </div>}
    </div>
  </nav></header>;
}
