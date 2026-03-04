# Kryvexis Inbox SaaS (Product Shell + Real DB) 🚀

This is a **Vercel-ready** Next.js SaaS product (Apple-clean UI) with **Supabase Auth + Postgres**.
No WhatsApp APIs yet — but you can **inject demo leads** and run real demos.

## 1) Setup (local)
```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: http://localhost:3000

## 2) Supabase setup
1. Create a Supabase project
2. In Supabase SQL editor, run: `supabase/schema.sql`
3. In Supabase Auth settings, disable email confirmations for testing (optional)

## 3) Env vars
Put in `.env.local` (and in Vercel project env vars):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL (e.g. https://your-vercel-domain)

## 4) Demo mode (no APIs)
- Signup -> Onboarding -> Create workspace
- Go to Inbox -> Click "Inject demo lead"
- Add automation rule: keyword `price` -> auto reply `Here are our packages...`
- Inject demo lead again and watch auto reply appear

## 5) Deploy (Vercel)
- Push to GitHub
- Import repo in Vercel
- Add env vars
- Deploy ✅

## Pages
- / (marketing)
- /login
- /signup
- /onboarding
- /app/inbox
- /app/contacts
- /app/automations
- /app/analytics
- /app/settings

## Next upgrades (when you say so)
- Quotes + invoices
- Team invites + roles UI
- Notes, tags, SLA timers
- Realtime (Supabase realtime)
- WhatsApp Cloud API integration
