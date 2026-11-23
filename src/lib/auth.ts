import { betterAuth } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { z } from 'zod';

const mongoUri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017');
const authSecret = process.env.BETTER_AUTH_SECRET || '';
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (process.env.NODE_ENV === 'production' && !mongoUri) throw new Error('MONGODB_URI is required in production');
if (process.env.NODE_ENV === 'production' && authSecret.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters in production');
if (process.env.NODE_ENV === 'production' && !googleConfigured) throw new Error('Google OAuth credentials are required in production');
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongoClient = client;
}

const db = client.db(process.env.MONGODB_DB_NAME || 'pizzahub');
export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: authSecret || 'local-development-secret-change-before-deploy-32chars',
 baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  socialProviders: googleConfigured ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! },
  } : {},
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;
      const password = ctx.body?.password;
      if (typeof password !== 'string' || password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        throw new APIError('BAD_REQUEST', { message: 'Password must be at least 6 characters and include uppercase and lowercase letters' });
      }
      if (ctx.body?.role !== undefined && !['vendor', 'customer'].includes(ctx.body.role)) {
        throw new APIError('BAD_REQUEST', { message: 'Public registration supports Vendor or Customer accounts only' });
      }
    }),
  },
  user: {
    modelName: 'users',
    additionalFields: {
      // Public users may choose only Vendor or Customer. Admin is provisioned
      // manually through a trusted database operation, never via sign-up.
      role: { type: 'string', required: true, defaultValue: 'customer', input: true, validator: { input: z.enum(['vendor', 'customer']) } },
      isBlocked: { type: 'boolean', required: false, defaultValue: false, input: false },
      businessName: { type: 'string', required: false, input: false },
      subscriptionPlan: { type: 'string', required: false, defaultValue: 'free', input: false },
      subscriptionExpiresAt: { type: 'date', required: false, input: false },
      stripeCustomerId: { type: 'string', required: false, input: false },
      stripeSubscriptionId: { type: 'string', required: false, input: false },
    },
  },
});
