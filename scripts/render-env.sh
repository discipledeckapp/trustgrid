#!/bin/bash
# TrustGrid — Render Environment Variables
# Run: bash scripts/render-env.sh
# Or copy the block below directly into Render's "Paste as JSON" option

cat << 'ENV'
DATABASE_URL=postgresql://neondb_owner:npg_zoBs0ADwg4th@ep-quiet-union-alcq24ns.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
ENCRYPTION_KEY=f8b48c62f47d9e095216ddf7558cde582db8d42c8b99e14708c2be26c7a6849b
ID_HASH_SECRET=3b5fea0e0da10a2f1535be2d3d96463666d0a19df3cc4b4478f6627929444f2b
PREMBLY_API_KEY=live_sk_02dc73b7cf77464c9dbc021cd98a89dc
TERMII_API_KEY=TLshJQzNxNhXCOIEycTQXBmIyUaApTQDvKhHSwPrMbPkeYYFtqZmKJHFVsiFKW
TERMII_SENDER_ID=TrustGrid
IDENTITY_ADAPTER=LIVE
NODE_ENV=production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGINS=https://trustgrid.ng,https://app.trustgrid.ng,https://admin.trustgrid.ng,https://trustgrid-dashboard.vercel.app,https://trustgrid-admin.vercel.app
ENV
