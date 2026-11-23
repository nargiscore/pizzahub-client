import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { SignJWT } from 'jose';
import { auth } from '@/lib/auth';
export async function GET() {
  if (!process.env.BETTER_AUTH_SECRET) return NextResponse.json({ message: 'JWT signing is not configured' }, { status: 503 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  if (!['admin', 'vendor', 'customer'].includes(user.role) || user.isBlocked) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime('10m').sign(secret);
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
