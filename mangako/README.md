# Mangako 📖

A modern manga reading platform built with Next.js 16, featuring a complete economy system, payment integration, and content management.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/mangako.git
cd mangako

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
mangako/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── vercel.json          # Vercel configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Storage**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Deployment**: Vercel

## 📦 Features

- 🎨 Beautiful, modern UI with dark mode
- 🔐 Secure authentication system
- 💰 Complete economy system with coins
- 💳 Stripe payment integration
- 📚 Chapter management and reading progress
- 🎯 Admin panel for content management
- 🖼️ Image upload to Supabase Storage
- 📱 Fully responsive design

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables (see below)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/mangako)

### Required Environment Variables

Set these in your Vercel project settings or `.env` file:

- `DATABASE_URL` - PostgreSQL connection string (with pgBouncer)
- `DIRECT_URL` - Direct PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your site URL (e.g., `https://yourdomain.com`)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## 🧪 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Create database migration
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by Mangako Team
