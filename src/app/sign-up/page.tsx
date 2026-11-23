
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [businessName, setBusinessName] = useState('');
  const [image, setImage] = useState('');

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
          result.error.message || 'Google sign up failed'
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Google sign up failed'
      );
      setGoogleBusy(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || googleBusy) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanBusinessName = businessName.trim();
    const cleanImage = image.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      toast.error('Name must be between 2 and 80 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      toast.error(
        'Password needs 6+ characters, one uppercase and one lowercase letter'
      );
      return;
    }

    if (role === 'vendor' && cleanBusinessName.length < 2) {
      toast.error('Enter your restaurant / business name');
      return;
    }

    if (role === 'vendor' && cleanBusinessName.length > 100) {
      toast.error('Business name cannot exceed 100 characters');
      return;
    }

    setBusy(true);

    try {
      const result = await authClient.signUp.email({
        name: cleanName,
        email: cleanEmail,
        password,
        role,
        ...(cleanImage ? { image: cleanImage } : {}),
      } as any);

      if (result.error) {
        throw new Error(
          result.error.message || 'Registration failed'
        );
      }

      let profileWarning = false;

      if (role === 'vendor' && cleanBusinessName) {
        try {
          await api('/profile', {
            method: 'PATCH',
            body: JSON.stringify({
              businessName: cleanBusinessName,
            }),
          });
        } catch {
          profileWarning = true;
        }
      }

      if (profileWarning) {
        toast.warning(
          'Account created. Please add your restaurant name in Profile Settings.'
        );
      } else {
        toast.success('Account created successfully');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to create account. Please try again.'
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
          maxWidth: 500,
          margin: 'auto',
          display: 'grid',
          gap: 16,
        }}
        onSubmit={submit}
      >
        <p className="hero-kicker">
          JOIN THE PIZZHUB COMMUNITY
        </p>

        <h1 style={{ margin: 0 }}>
          Create your account
        </h1>

        <label>
          Full Name
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </label>

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
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              style={{ flex: 1, minWidth: 0 }}
            />

            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <small className="muted">
            At least 6 characters, including uppercase and lowercase
            letters.
          </small>
        </label>

        <label>
          Account Role

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="vendor">
              Vendor (Restaurant Owner)
            </option>
          </select>
        </label>

        {role === 'vendor' && (
          <label>
            Restaurant / Business Name

            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your restaurant name"
            />
          </label>
        )}

        <label>
          Profile Image URL (optional)

          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/profile.jpg"
          />
        </label>

        <Button
          type="submit"
          disabled={busy || googleBusy}
        >
          {busy ? 'Creating account…' : 'Create Account'}
        </Button>

        <button
          type="button"
          className="btn secondary"
          onClick={google}
          disabled={busy || googleBusy}
        >
          {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
        </button>

        <p className="muted">
          Already registered?{' '}
          <Link
            href="/sign-in"
            style={{
              color: 'var(--brand)',
              fontWeight: 750,
            }}
          >
            Sign In
          </Link>
        </p>
      </form>
    </main>
  );
}
