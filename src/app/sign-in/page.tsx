
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function google() {
    if (busy || googleBusy) return;

    setGoogleBusy(true);

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });

      if (result.error) {
        throw new Error(
          result.error.message || 'Google sign in failed'
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Google sign in failed'
      );

      setGoogleBusy(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || googleBusy) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setBusy(true);

    try {
      const result = await authClient.signIn.email({
        email: cleanEmail,
        password,
      });

      if (result.error) {
        throw new Error(
          result.error.message || 'Sign in failed'
        );
      }

      toast.success('Signed in successfully');

      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container section">
      <form
        className="card"
        style={{
          maxWidth: 460,
          margin: 'auto',
          display: 'grid',
          gap: 18,
        }}
        onSubmit={submit}
      >
        <p className="hero-kicker">
          WELCOME BACK
        </p>

        <h1 style={{ margin: 0 }}>
          Sign in to PizzaHub
        </h1>

        <label>
          Email

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </label>

        <label>
          Password

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                flex: 1,
                minWidth: 0,
              }}
            />

            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          disabled={busy || googleBusy}
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </Button>

        <button
          type="button"
          className="btn secondary"
          onClick={google}
          disabled={busy || googleBusy}
        >
          {googleBusy
            ? 'Connecting to Google…'
            : 'Continue with Google'}
        </button>

        <p className="muted">
          New to PizzaHub?{' '}
          <Link
            href="/sign-up"
            style={{
              color: 'var(--brand)',
              fontWeight: 750,
            }}
          >
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
