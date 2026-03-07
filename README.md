# Kryvexis Inbox System

A Meta-ready customer inbox workspace for conversations, quotes, products, and team follow-up.

## What it includes
- Shared inbox workspace
- Contacts CRM
- Automations
- Analytics
- Quotes
- Products
- Settings / team overview
- Meta WhatsApp integration scaffold

## Current storage
- Local browser state for demo data
- Meta API routes ready for real credentials

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
Push to GitHub and import in Vercel.
Add Meta environment variables when you are ready to connect the live channel.

## Sample flow
1. Open Inbox
2. Click **Add sample lead**
3. Reply to messages
4. Add automation rules
5. Show quotes and products
6. Connect Meta when your live credentials are ready

## Meta WhatsApp integration

This project includes:

- `GET /api/meta/webhook` for webhook verification
- `POST /api/meta/webhook` for inbound webhook payloads
- `POST /api/meta/send` to send a WhatsApp text message
- `GET /api/meta/status` to inspect whether credentials are configured

### Required environment variables

- `META_MODE` (`sandbox` or `live`)
- `META_GRAPH_VERSION`
- `META_ACCESS_TOKEN`
- `META_PHONE_NUMBER_ID`
- `META_BUSINESS_ACCOUNT_ID` (optional)
- `META_WEBHOOK_VERIFY_TOKEN`
