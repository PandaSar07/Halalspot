# Supabase Setup Guide

This guide walks you through setting up Supabase for the HalalSpot project, both for local development and production.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Production Setup](#production-setup)
3. [Running Migrations](#running-migrations)
4. [Configuring Authentication](#configuring-authentication)
5. [Setting up Storage](#setting-up-storage)
6. [Generating TypeScript Types](#generating-typescript-types)

---

## Local Development Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

### 2. Start Local Supabase

From the project root:

```bash
cd HalalSpot
supabase start
```

This will:
- Start a local PostgreSQL database
- Start Supabase Studio (local dashboard)
- Start Auth, Storage, and other services
- Output your local credentials

**Save these credentials!** Example output:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJh...
service_role key: eyJh...
```

### 3. Configure Environment Variables

Copy the local credentials to your `.env` files:

**Root `.env`**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... # from supabase start output
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh... # same as above
```

**`apps/web/.env.local`**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

**`apps/mobile/.env`**:
```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

### 4. Run Migrations

```bash
supabase db reset
```

This will:
- Reset the database
- Run all migrations in `supabase/migrations/`
- Apply seed data from `supabase/seed.sql`

### 5. Access Supabase Studio

Open http://localhost:54323 in your browser to:
- View tables and data
- Test queries
- Manage authentication
- View logs

---

## Production Setup

### 1. Create a Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: HalalSpot
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

### 2. Get Your Credentials

Once the project is created:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJh...`)
   - **service_role key** (keep this secret!)

### 3. Configure Production Environment Variables

**For Vercel (Web App)**:
1. Go to your Vercel project settings
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```

**For Expo (Mobile App)**:
1. Create `apps/mobile/.env.production`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```

### 4. Link Your Local Project to Production

```bash
supabase link --project-ref your-project-ref
```

Find your project ref in the Supabase dashboard URL:
`https://app.supabase.com/project/YOUR-PROJECT-REF`

### 5. Push Migrations to Production

```bash
supabase db push
```

This will apply all migrations from `supabase/migrations/` to your production database.

---

## Running Migrations

### Create a New Migration

```bash
supabase migration new migration_name
```

This creates a new file in `supabase/migrations/`.

### Apply Migrations

**Local**:
```bash
supabase db reset  # Reset and apply all migrations
```

**Production**:
```bash
supabase db push   # Push new migrations only
```

### Rollback (Local Only)

```bash
supabase db reset
```

---

## Configuring Authentication

### Email/Password Authentication

Already enabled by default. Users can sign up with email and password.

### OAuth Providers (Google, Apple)

#### Google OAuth

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Google**
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add Client ID and Secret in Supabase Dashboard

#### Apple Sign-In (Required for iOS App Store)

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Apple**
3. Get credentials from [Apple Developer](https://developer.apple.com/):
   - Create a Services ID
   - Configure Sign in with Apple
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add Service ID and Key in Supabase Dashboard

### Email Confirmations

**Development**: Disabled by default (see `supabase/config.toml`)

**Production**: 
1. Go to **Authentication** → **Settings**
2. Enable "Confirm email"
3. Configure email templates

---

## Setting up Storage

### Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create a bucket: `restaurant-images`
3. Set policies:
   - **Public**: Allow public read access
   - **Authenticated**: Allow authenticated users to upload

### Storage Policies (RLS)

```sql
-- Allow public to read images
CREATE POLICY "Public can view restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Generating TypeScript Types

### Automatic Generation

The project includes a script to generate TypeScript types from your Supabase schema.

**From project root**:
```bash
pnpm db:generate-types
```

This will:
1. Connect to your Supabase instance (local or remote)
2. Generate types from the database schema
3. Save to `packages/shared-types/src/database.types.ts`

### Manual Generation

```bash
supabase gen types typescript --local > packages/shared-types/src/database.types.ts
```

For production:
```bash
supabase gen types typescript --project-ref your-project-ref > packages/shared-types/src/database.types.ts
```

---

## Troubleshooting

### "Connection refused" errors

Make sure Supabase is running:
```bash
supabase status
```

If not running:
```bash
supabase start
```

### Migrations not applying

Reset the database:
```bash
supabase db reset
```

### Type generation fails

Make sure you're linked to a project:
```bash
supabase link --project-ref your-project-ref
```

### Can't access Supabase Studio

Check if it's running on the correct port:
```bash
supabase status
```

Default: http://localhost:54323

---

## Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Check status
supabase status

# View logs
supabase logs

# Reset database
supabase db reset

# Push migrations to production
supabase db push

# Generate types
pnpm db:generate-types
```

---

## Next Steps

After setting up Supabase:

1. ✅ Run migrations
2. ✅ Generate TypeScript types
3. ✅ Configure environment variables
4. ✅ Test authentication
5. ✅ Set up storage buckets
6. 🚀 Start building!

For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).
