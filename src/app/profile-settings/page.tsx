
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

type Profile = {
  name: string;
  email: string;
  image?: string;
  role: string;
  businessName?: string;
};

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const session = await authClient.getSession();

        if (!active) return;

        if (!session.data) {
          window.location.replace('/sign-in');
          return;
        }

        const user = session.data.user as typeof session.data.user & {
          role?: string;
          isBlocked?: boolean;
        };

        if (user.isBlocked) {
          window.location.replace('/sign-in?blocked=1');
          return;
        }

        if (
          !user.role ||
          !['admin', 'vendor', 'customer'].includes(user.role)
        ) {
          window.location.replace('/');
          return;
        }

        const data = await api<Profile>('/profile');

        if (!active) return;

        setProfile(data);
        setName(data.name || '');
        setImage(data.image || '');
        setBusinessName(data.businessName || '');
      } catch (error) {
        if (!active) return;

        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to load profile'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || !profile) return;

    const cleanName = name.trim();
    const cleanImage = image.trim();
    const cleanBusinessName = businessName.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      toast.error('Name must be between 2 and 80 characters');
      return;
    }

    if (
      profile.role === 'vendor' &&
      (cleanBusinessName.length < 2 ||
        cleanBusinessName.length > 100)
    ) {
      toast.error(
        'Business name must be between 2 and 100 characters'
      );
      return;
    }

    if (cleanImage) {
      try {
        const imageUrl = new URL(cleanImage);

        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          toast.error('Please enter a valid image URL');
          return;
        }
      } catch {
        toast.error('Please enter a valid image URL');
        return;
      }
    }

    setBusy(true);

    try {
      const updatedProfile = await api<Profile>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: cleanName,
          image: cleanImage,
          ...(profile.role === 'vendor'
            ? { businessName: cleanBusinessName }
            : {}),
        }),
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              ...updatedProfile,
              name: updatedProfile.name || cleanName,
              image: updatedProfile.image ?? cleanImage,
              ...(profile.role === 'vendor'
                ? {
                    businessName:
                      updatedProfile.businessName ??
                      cleanBusinessName,
                  }
                : {}),
            }
          : current
      );

      setName(updatedProfile.name || cleanName);
      setImage(updatedProfile.image ?? cleanImage);

      if (profile.role === 'vendor') {
        setBusinessName(
          updatedProfile.businessName ?? cleanBusinessName
        );
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to update profile. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="loading-panel">
          Loading profile…
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container section">
        <div className="card" style={{ maxWidth: 620, margin: 'auto' }}>
          <h2>Unable to load profile</h2>
          <p className="muted">
            Please sign in again or try refreshing the page.
          </p>
          <button
            className="btn"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <form
        className="card"
        onSubmit={save}
        style={{
          maxWidth: 620,
          margin: 'auto',
          display: 'grid',
          gap: 16,
        }}
      >
        <p className="hero-kicker">
          ACCOUNT PREFERENCES
        </p>

        <h1 style={{ margin: 0 }}>
          Profile Settings
        </h1>

        <p className="muted">
          {profile.email} · {profile.role}
        </p>

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

        {profile.role === 'vendor' && (
          <label>
            Restaurant / Business Name

            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
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

        {image.trim() && (
          <div>
            <p className="muted">Profile Image Preview</p>

            <img
              src={image.trim()}
              alt="Profile preview"
              width={84}
              height={84}
              style={{
                width: 84,
                height: 84,
                objectFit: 'cover',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Saving Changes…' : 'Save Changes'}
        </button>

        <p className="muted">
          Your account role and subscription status cannot
          be changed through profile settings.
        </p>
      </form>
    </main>
  );
}
