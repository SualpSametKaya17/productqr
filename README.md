# ProductQR — Multilingual Product Landing Page System

A Next.js application to manage multilingual product pages with QR code generation.

## Features

- **Admin Panel** — Add unlimited products and languages
- **Multilingual** — Per-product translations for every language
- **Auto language detection** — Reads `Accept-Language` header; manual switching via `?lang=` param
- **QR Code generation** — `/api/qr/[slug]` returns a PNG
- **Image uploads** — Upload and manage product images
- **Active/inactive toggle** — Control product visibility
- **SEO fields** — Per-translation `metaTitle` and `metaDescription`
- **Mobile-first** — Responsive public product pages at `/p/[slug]`

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma 7** + SQLite (`@prisma/adapter-better-sqlite3`)
- **Tailwind CSS v4**
- **qrcode** for QR PNG generation

## Quick Start

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key URLs

| Path | Description |
|------|-------------|
| `/admin` | Admin dashboard |
| `/admin/products` | Product list |
| `/admin/languages` | Language list |
| `/p/[slug]` | Public product page |
| `/p/[slug]?lang=tr` | Force language |
| `/api/qr/[slug]` | QR code PNG |
