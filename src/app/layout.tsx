import './globals.css';
import { Toaster } from 'sonner';
import SiteHeader from '@/components/site-header';
import Link from 'next/link';

export const metadata = {
  title: 'PizzaHub | Fresh Pizza, Local Favorites',
  description: 'Discover local pizza restaurants, browse fresh menus, and order your favorites with PizzaHub.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>
    <SiteHeader />
    {children}
    <footer className="site-footer"><div className="container footer-grid">
      <div><Link href="/" className="footer-brand">🍕 PizzaHub</Link><p>Local pizza shops. Fresh favorites. Simple ordering.</p></div>
      <div><h3>Explore</h3><Link href="/browse">Browse Menu</Link><Link href="/sign-up">Create Account</Link><Link href="/sign-in">Sign In</Link></div>
      <div><h3>Contact</h3><a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@pizzahub.example'}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@pizzahub.example'}</a><p>Serving local pizza lovers every day.</p></div>
      <div><h3>Follow Us</h3><div className="social-links"><a href="https://facebook.com" aria-label="Facebook">f</a><a href="https://x.com" aria-label="X">𝕏</a><a href="https://instagram.com" aria-label="Instagram">◎</a></div></div>
    </div><div className="container footer-bottom">© {new Date().getFullYear()} PizzaHub. All rights reserved.</div></footer>
    <Toaster richColors position="top-right" />
  </body></html>;
}
