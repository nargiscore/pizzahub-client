# PizzaHub Client

Next.js 15 App Router frontend for PizzaHub Assignment 9. See the project-root README for the complete assignment feature map, API setup, Google OAuth, ImgBB, Stripe, admin provisioning, and deployment checklist.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Required client environment variables: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MONGODB_URI`, `MONGODB_DB_NAME`.

`BETTER_AUTH_SECRET` must exactly match the server `JWT_SECRET`. Do not commit `.env.local`.
