# HalalSpot

A production-ready halal restaurant discovery platform supporting both iOS and Web, built with a modern monorepo architecture.

## 🏗️ Architecture

- **Monorepo**: Turborepo with pnpm workspaces
- **Web**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Mobile**: Expo (React Native, iOS-first)
- **Backend**: Supabase (PostgreSQL + PostGIS + Auth + Storage)
- **Maps**: Mapbox
- **Shared Code**: TypeScript types and Supabase queries

## 📁 Project Structure

```
HalalSpot/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # Expo iOS application
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── supabase/         # Supabase client & queries
├── supabase/
│   ├── migrations/       # SQL migrations
│   ├── seed.sql          # Development seed data
│   └── config.toml       # Supabase CLI config
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspace definition
└── turbo.json            # Turborepo pipeline config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Supabase CLI**: `npm install -g supabase`
- **Expo CLI**: `npm install -g expo-cli` (optional, for mobile)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd HalalSpot
   pnpm install
   ```

2. **Set up Supabase** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)):
   ```bash
   # For local development
   supabase start
   
   # Or link to remote project
   supabase link --project-ref your-project-ref
   ```

3. **Run migrations**:
   ```bash
   supabase db reset  # Local
   # or
   supabase db push   # Remote
   ```

4. **Configure environment variables**:
   ```bash
   # Copy example files
   cp .env.example .env
   cp apps/web/.env.local.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   
   # Fill in your Supabase and Mapbox credentials
   ```

5. **Generate TypeScript types**:
   ```bash
   pnpm db:generate-types
   ```

### Development

Run all apps concurrently:
```bash
pnpm dev
```

Or run individually:
```bash
# Web app (http://localhost:3000)
cd apps/web
pnpm dev

# Mobile app
cd apps/mobile
pnpm start
```

## 🗄️ Database Schema

### Tables

- **users**: User profiles (extends Supabase auth.users)
- **restaurants**: Restaurant listings with PostGIS location data
- **reviews**: User reviews (1-5 stars + comments)
- **favorites**: User's favorited restaurants

### Key Features

- **PostGIS** for efficient geolocation queries
- **Row Level Security (RLS)** for data protection
- **Automatic triggers** for timestamps and user profile creation
- **Functions** for nearby restaurant search and rating calculations

## 🔐 Authentication

Supabase Auth with:
- Email/password authentication
- OAuth providers (Google, Apple) - ready to configure
- Magic link support
- Secure session management (cookies on web, SecureStore on mobile)

## 🗺️ Maps Integration

**Mapbox** is used for both web and mobile:
- Interactive maps with custom styling
- Geolocation support
- Restaurant markers
- Distance calculations

**Get your Mapbox token**: https://account.mapbox.com/access-tokens/

## 📦 Workspace Packages

### `@halalspot/shared-types`
Shared TypeScript types and Zod validation schemas used across web and mobile.

### `@halalspot/supabase`
Reusable Supabase client factory and query functions.

## 🧪 Scripts

```bash
# Development
pnpm dev                    # Run all apps
pnpm build                  # Build all apps
pnpm type-check             # Type check all packages

# Database
pnpm db:generate-types      # Generate types from Supabase schema

# Formatting
pnpm format                 # Format code with Prettier
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick overview**:
- **Web**: Deploy to Vercel (automatic with GitHub integration)
- **Mobile**: Build with Expo EAS and submit to App Store
- **Database**: Use Supabase hosted service

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./.env.example)

## 🔑 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=
EXPO_PUBLIC_MAPBOX_TOKEN=
```

## 🏛️ Architecture Decisions

### Why Turborepo?
- Fast, incremental builds
- Efficient caching
- Simple monorepo management

### Why Supabase?
- PostgreSQL with PostGIS for geolocation
- Built-in authentication
- Real-time subscriptions (future feature)
- Generous free tier

### Why Mapbox?
- Better pricing than Google Maps
- Excellent React Native support
- Customizable map styles
- Lightweight and performant

### Why Expo?
- Faster development with managed workflow
- Easy deployment with EAS
- Great developer experience
- Over-the-air updates

## 🤝 Contributing

This is a production-ready starter. Key areas for expansion:
- [ ] Implement map components (Mapbox integration)
- [ ] Add restaurant submission form
- [ ] Build review system UI
- [ ] Add image upload (Supabase Storage)
- [ ] Implement real-time features
- [ ] Add admin dashboard for moderation

## 📄 License

MIT

---

**Built with ❤️ for the Muslim community**
