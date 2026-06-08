# EcoTrack Deployment Guide

## Vercel Deployment (Frontend + Backend in One)

EcoTrack uses a unified deployment model where both the Next.js frontend and Express API run on Vercel. The Express API is bundled into the Next.js app at `/pages/api/backend/[...path].ts`.

### Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database** - Use one of these managed providers:
   - [Neon](https://neon.tech) - Serverless Postgres (recommended)
   - [Supabase](https://supabase.com) - Includes auth and storage
   - [Railway](https://railway.app) - Managed Postgres
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Built-in option

3. **Cloudinary Account** - For image uploads at [cloudinary.com](https://cloudinary.com)

### Required Environment Variables

Set these in your Vercel project settings:

```bash
# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
NEXTAUTH_SECRET="+8MgbUHgKUnTuK1273Ky9SnSE9eC8nMD2T2glmWoz5I="
NEXTAUTH_URL="https://your-app.vercel.app"

# API Security (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
API_JWT_SECRET="your-secure-api-jwt-secret-here"

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Environment
NODE_ENV="production"

# Optional: Only set these if using separate API server (not recommended for Vercel)
# API_BASE_URL=""
# NEXT_PUBLIC_API_BASE_URL=""
```

### Deployment Steps

#### 1. Prepare Database

Create your PostgreSQL database and get the connection string:

**For Neon:**
```bash
# Copy the connection string from Neon dashboard
# Format: postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**For Supabase:**
```bash
# Get connection string from Settings > Database
# Use the "Connection Pooling" URL for better performance
```

#### 2. Run Database Migrations

```bash
# Set your DATABASE_URL in .env
DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (admin user + sample data)
npm run db:seed
```

#### 3. Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add API_JWT_SECRET production
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

# Deploy to production
vercel --prod
```

**Option B: Via Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. Go to **Settings > Environment Variables**
5. Add all required environment variables listed above
6. Click **Deploy**

#### 4. Verify Deployment

After deployment completes:

1. Visit `https://your-app.vercel.app`
2. Test login with seeded credentials:
   - **Admin:** admin@ecotrack.local / Admin12345
   - **Resident:** john.doe@example.com / Password123
3. Test creating a new waste request
4. Test image upload (ensure Cloudinary is configured)
5. Check admin dashboard and analytics

### Architecture Notes

- **Unified Deployment**: Both frontend and backend run on Vercel
- **API Routes**: Express API is accessible at `/api/backend/*`
- **Serverless Functions**: Each API route runs as a serverless function
- **Cold Starts**: First request may be slow (Vercel's serverless nature)
- **Database Connection**: Prisma uses connection pooling for serverless
- **File Uploads**: Uses Cloudinary (Vercel filesystem is read-only)

### Environment-Specific Behavior

The app automatically detects whether API_BASE_URL is set:

- **If API_BASE_URL is NOT set** (recommended for Vercel):
  - API calls go to `/api/backend/*`
  - Uses the bundled Express API

- **If API_BASE_URL IS set** (separate API server):
  - API calls go to external server
  - Not recommended for Vercel deployment

### Troubleshooting

**Build Fails:**
```bash
# Ensure all packages are installed
npm install

# Check for TypeScript errors
npm run typecheck

# Try building locally first
npm run build
```

**Database Connection Errors:**
```bash
# Verify DATABASE_URL includes `?sslmode=require` for managed databases
# Ensure database accepts connections from Vercel IP ranges
# Check Prisma migrations are up to date
```

**Authentication Issues:**
```bash
# Ensure NEXTAUTH_SECRET is set and is a secure random string
# Verify NEXTAUTH_URL matches your Vercel deployment URL
# Check that NEXTAUTH_URL does NOT have a trailing slash
```

**API Errors:**
```bash
# Check Vercel function logs in dashboard
# Ensure API_JWT_SECRET is set
# Verify CORS_ORIGIN if using separate API
```

**Image Upload Fails:**
```bash
# Verify Cloudinary credentials are correct
# Check Cloudinary dashboard for usage limits
# Ensure upload preset allows unsigned uploads (if used)
```

### Performance Optimization

1. **Database Indexing**: Schema includes indexes on frequently queried fields
2. **Connection Pooling**: Prisma uses connection pooling for serverless
3. **Rate Limiting**: Applied to auth and upload endpoints
4. **Caching**: Consider adding Redis for session storage (future enhancement)
5. **CDN**: Vercel automatically serves static assets via CDN

### Monitoring

- **Vercel Dashboard**: Monitor deployments, function logs, and errors
- **Database Provider**: Monitor connection count and query performance
- **Cloudinary**: Track upload usage and bandwidth
- **Application Logs**: Check Vercel function logs for API errors

### Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database migrations have run
- [ ] Seed data is loaded
- [ ] Admin login works
- [ ] Resident registration works
- [ ] Waste request creation works
- [ ] Image upload works
- [ ] Email notifications work (if configured)
- [ ] Calendar view renders correctly
- [ ] Analytics dashboard loads

### Security Recommendations

1. **Rotate Secrets**: Regularly rotate NEXTAUTH_SECRET and API_JWT_SECRET
2. **Database Security**: Use strong passwords and SSL connections
3. **Cloudinary**: Restrict upload folder and file types
4. **Rate Limiting**: Currently in place for auth and uploads
5. **Environment Variables**: Never commit secrets to Git

### Scaling Considerations

- **Vercel Pro**: Upgrade for more concurrent executions
- **Database**: Scale up your PostgreSQL instance as needed
- **Cloudinary**: Upgrade plan for more storage and bandwidth
- **CDN**: Vercel Edge Network handles static asset caching

### Cost Estimates

**Free Tier (Hobby):**
- Vercel: Free (with limits)
- Neon: Free tier available
- Cloudinary: Free tier (25GB storage, 25GB bandwidth)

**Production (Small Scale):**
- Vercel Pro: $20/month
- Neon Scale: ~$10-30/month
- Cloudinary: ~$0-50/month depending on usage

---

## Alternative: Separate API Deployment

If you prefer to deploy the API separately:

### API-Only Deployment (Railway/Render)

1. Deploy `apps/api` to Railway or Render
2. Set environment variables on that platform
3. In Vercel, set:
   ```bash
   API_BASE_URL="https://your-api.railway.app/api"
   NEXT_PUBLIC_API_BASE_URL="https://your-api.railway.app/api"
   ```

This is NOT recommended for simplicity, but gives you more control over API scaling.
