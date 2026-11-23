'use client';
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem('pizzahub-theme'); const value = saved === 'dark'; setDark(value); document.documentElement.dataset.theme = value ? 'dark' : 'light'; }, []);
  function toggle() { const value = !dark; setDark(value); document.documentElement.dataset.theme = value ? 'dark' : 'light'; localStorage.setItem('pizzahub-theme', value ? 'dark' : 'light'); }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle dark and light theme">{dark ? '☀️' : '🌙'}</button>;
}
