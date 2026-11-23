
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import ThemeToggle from './theme-toggle';

export default function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user as any;
  const role = user?.role;

  async function logout() {
    await authClient.signOut();
    setMobileMenuOpen(false);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse Menu' },
  ];

  return (
    <header className="site-header">
      <nav className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">P</span>
          <span>
            Pizza<span className="brand-accent">Hub</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div
          id="primary-navigation"
          className={`nav-links ${mobileMenuOpen ? 'nav-open' : ''}`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => {
                setMobileMenuOpen(false);
                setProfileOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}

          {!isPending && session && (
            <Link
              href={`/dashboard/${role || 'customer'}`}
              onClick={() => {
                setMobileMenuOpen(false);
                setProfileOpen(false);
              }}
            >
              Dashboard
            </Link>
          )}

          <ThemeToggle />

          {!isPending && !session && (
            <>
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>

              <Link
                className="btn nav-cta"
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}

          {!isPending && session && (
            <div className="profile-menu">
              <button
                type="button"
                className="profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {user?.image ? (
                  <img
                    className="avatar"
                    src={user.image}
                    alt="Profile"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span className="avatar">
                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}

                <span>{user?.name || 'Account'}</span>
                <span>⌄</span>
              </button>

              <div
                className="profile-dropdown"
                style={{ display: profileOpen ? 'block' : 'none' }}
              >
                <Link
                  href={`/dashboard/${role || 'customer'}`}
                  onClick={() => setProfileOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href="/profile-settings"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile Settings
                </Link>

                <button type="button" onClick={logout}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
