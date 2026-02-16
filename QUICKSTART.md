# Quick Start Guide - Windows Setup

## ⚠️ Important: Docker Required for Local Supabase

To run Supabase locally, you need **Docker Desktop** installed. 

### Option 1: Install Docker Desktop (Recommended for Local Development)

1. **Download Docker Desktop for Windows**:
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer

2. **After Installation**:
   ```powershell
   # Verify Docker is running
   docker --version
   
   # Start Supabase
   npx supabase start
   ```

3. **First time setup** (after Docker is installed):
   ```powershell
   cd HalalSpot
   npx supabase start
   npx supabase db reset
   ```

### Option 2: Use Supabase Cloud (Skip Local Setup)

If you don't want to install Docker, you can use Supabase's hosted service:

1. **Create a Supabase project**:
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created (~2 minutes)

2. **Get your credentials**:
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon/public key

3. **Configure environment variables**:
   
   **`.env`**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   **`apps/web/.env.local`**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   **`apps/mobile/.env`**:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Push migrations to cloud**:
   ```powershell
   # Link to your project
   npx supabase link --project-ref your-project-ref
   
   # Push migrations
   npx supabase db push
   ```

## Next Steps

### After Supabase is Set Up (Either Local or Cloud):

1. **Install project dependencies**:
   ```powershell
   pnpm install
   ```

2. **Generate TypeScript types**:
   ```powershell
   pnpm db:generate-types
   ```

3. **Get a Mapbox token**:
   - Go to: https://account.mapbox.com/access-tokens/
   - Create a new token
   - Add to your `.env` files

4. **Start development**:
   ```powershell
   # Start web app
   cd apps/web
   pnpm dev
   # Visit http://localhost:3000
   
   # Or start mobile app (in a new terminal)
   cd apps/mobile
   pnpm start
   ```

## Recommended Approach for You

Since Docker isn't installed, I recommend:

1. **For now**: Use **Supabase Cloud** (Option 2) - it's free and gets you started immediately
2. **Later**: Install Docker if you want local development capabilities

This way you can start building features right away without waiting for Docker installation!

## Troubleshooting

### "pnpm: command not found"

Install pnpm:
```powershell
npm install -g pnpm
```

### "npx supabase" is slow

The first time you run `npx supabase`, it downloads the CLI. Subsequent runs will be faster.

### Need help?

Check the full guides:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed Supabase setup
- [README.md](./README.md) - Full project documentation
