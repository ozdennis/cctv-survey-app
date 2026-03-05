# PT. Pantauan Nusantara - Enterprise Portal

Professional Integration Partner for CCTV, Network Infrastructure, and Website Development.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cctv-survey-app/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login portal
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── sales/             # Sales portal
│   │   ├── finance/           # Finance portal
│   │   ├── vendor/            # Vendor portal
│   │   └── support/           # Support portal
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities
│   └── utils/                 # Helper functions
├── supabase/
│   ├── migrations/            # Database migrations
│   └── create_admin.sql       # Admin user setup script
└── public/                    # Static assets
```

## 🌐 Domain Structure

| Domain | Purpose | Access |
|--------|---------|--------|
| `pantauannusantara.com` | **Landing page** (public) | Everyone |
| `portal.pantauannusantara.com` | Portal login & dashboard | Authenticated users |
| `sales.pantauannusantara.com` | Sales portal | Sales team |
| `finance.pantauannusantara.com` | Finance portal | Finance team |
| `vendor.pantauannusantara.com` | Vendor portal | Vendors |
| `support.pantauannusantara.com` | Support portal | Support team |

### Local Testing

```bash
# Landing page (root domain)
http://localhost:3000/

# Portal (use subdomain)
http://portal.localtest.me:3000/
http://sales.localtest.me:3000/
http://finance.localtest.me:3000/
```

## 🔐 First-Time Setup

### 1. Create Admin User

1. Go to `/login` and sign up with your email
2. Open Supabase SQL Editor
3. Run the script in `supabase/create_admin.sql`
4. Your account will be activated with admin role

### 2. Configure Supabase

All migrations are in `supabase/migrations/`. Run:

```bash
supabase db reset
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Build Commands

```bash
# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🛠 Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** CSS-in-JS (styled-jsx)
- **Fonts:** Rajdhani, IBM Plex Mono, Work Sans
- **Analytics:** Vercel Speed Insights

## 📞 Contact

- **Email:** sales@pantauannusantara.com
- **WhatsApp:** +62 851 0047 6464
- **Website:** www.pantauannusantara.com

---

© 2026 PT. Pantauan Nusantara Teknologi. All rights reserved.
