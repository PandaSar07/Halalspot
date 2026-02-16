# Deployment Guide

This guide covers deploying HalalSpot to production:
- **Web App** → Vercel
- **Mobile App** → Expo EAS + Apple App Store
- **Database** → Supabase (hosted)

---

## Prerequisites

- [ ] Supabase production project created (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [ ] Mapbox account with access token
- [ ] Vercel account (free tier works)
- [ ] Expo account (free tier works)
- [ ] Apple Developer account ($99/year, required for App Store)

---

## 1. Deploy Web App to Vercel

### Option A: Automatic Deployment (Recommended)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/halalspot.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo run build --filter=@halalspot/web`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Future pushes to `main` will auto-deploy

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
cd HalalSpot
vercel --cwd apps/web

# Follow prompts and add environment variables
```

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 2. Deploy Mobile App with Expo EAS

### Initial Setup

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   cd apps/mobile
   eas build:configure
   ```

   This creates `eas.json`:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": true
         }
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
           "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
           "EXPO_PUBLIC_MAPBOX_TOKEN": "pk.your-mapbox-token"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

### Build for iOS

1. **Create a production build**:
   ```bash
   eas build --platform ios --profile production
   ```

   This will:
   - Prompt for Apple Developer credentials
   - Create provisioning profiles
   - Build the app in the cloud
   - Provide a download link

2. **Wait for build** (usually 10-20 minutes)

3. **Download the `.ipa` file** when complete

### Submit to App Store

1. **Configure app metadata**:
   - Update `app.json` with final app name, bundle ID, etc.
   - Prepare App Store assets (screenshots, description, etc.)

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios --latest
   ```

   Or manually:
   - Download the `.ipa` from EAS
   - Upload to App Store Connect using Transporter app
   - Fill in app metadata in App Store Connect
   - Submit for review

3. **App Store Requirements**:
   - Privacy policy URL (required)
   - App description and screenshots
   - Apple Sign-In configured (if using other OAuth)
   - Location permission justification

### Over-the-Air (OTA) Updates

Expo allows you to push updates without App Store review:

```bash
eas update --branch production --message "Bug fixes"
```

**Note**: OTA updates only work for JavaScript/TypeScript changes, not native code.

---

## 3. Environment Variables Summary

### Web App (Vercel)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
NEXT_PUBLIC_APP_URL=https://halalspot.vercel.app
```

### Mobile App (EAS)

In `eas.json` under `build.production.env`:
```json
{
  "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJh...",
  "EXPO_PUBLIC_MAPBOX_TOKEN": "pk.your-mapbox-token"
}
```

---

## 4. Post-Deployment Checklist

### Web App
- [ ] Site loads correctly
- [ ] Authentication works (sign up, login, logout)
- [ ] Environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured (optional)

### Mobile App
- [ ] App builds successfully
- [ ] TestFlight build works
- [ ] Authentication works
- [ ] Location permissions work
- [ ] Maps display correctly
- [ ] App Store metadata complete
- [ ] Privacy policy published

### Database
- [ ] Migrations applied to production
- [ ] RLS policies enabled
- [ ] Seed data removed (if not needed)
- [ ] Backups configured
- [ ] Connection pooling enabled (for scale)

---

## 5. Monitoring & Analytics

### Vercel Analytics

Enable in Vercel dashboard:
- Go to your project
- Navigate to "Analytics"
- Enable Web Analytics

### Supabase Monitoring

Monitor in Supabase Dashboard:
- Database performance
- API usage
- Auth events
- Storage usage

### Expo Analytics

Consider adding:
- [Expo Analytics](https://docs.expo.dev/guides/using-analytics/)
- [Sentry](https://sentry.io/) for error tracking

---

## 6. CI/CD Pipeline (Optional)

### GitHub Actions for Web

Create `.github/workflows/deploy-web.yml`:

```yaml
name: Deploy Web to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm turbo run build --filter=@halalspot/web
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
```

### GitHub Actions for Mobile

Create `.github/workflows/build-mobile.yml`:

```yaml
name: Build Mobile App

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - 'packages/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g eas-cli
      - run: eas build --platform ios --non-interactive --no-wait
        working-directory: apps/mobile
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## 7. Scaling Considerations

### Database
- Enable connection pooling in Supabase
- Add database indexes for frequently queried fields
- Consider upgrading Supabase plan for more resources

### Web App
- Vercel auto-scales
- Consider adding CDN for images
- Implement caching strategies

### Mobile App
- Monitor API usage
- Implement pagination for large lists
- Use image optimization

---

## 8. Security Best Practices

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable RLS on all Supabase tables
- [ ] Validate user input on both client and server
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting (Supabase has built-in)
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 9. Troubleshooting

### Build Failures

**Web (Vercel)**:
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify TypeScript compiles locally

**Mobile (EAS)**:
- Check build logs: `eas build:list`
- Verify `app.json` configuration
- Ensure Apple Developer credentials are correct

### Runtime Errors

- Check Vercel logs for web app
- Use Expo's error reporting for mobile
- Monitor Supabase logs for database issues

---

## 10. Cost Estimates

### Free Tier (MVP)
- **Vercel**: Free (hobby plan)
- **Supabase**: Free (up to 500MB database, 1GB file storage)
- **Expo**: Free (unlimited builds)
- **Mapbox**: Free (50k map loads/month)
- **Apple Developer**: $99/year

### Paid Tier (Growth)
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Mapbox**: Pay as you go (~$5/1000 users/month)
- **Expo**: Free (or $29/month for priority builds)

---

## Support

For deployment issues:
- **Vercel**: https://vercel.com/docs
- **Expo**: https://docs.expo.dev
- **Supabase**: https://supabase.com/docs

---

**Ready to deploy? Start with the web app on Vercel, then move to mobile!** 🚀
