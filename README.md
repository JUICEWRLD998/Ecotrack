# EcoTrack - Waste Management System

A simple waste collection management platform for residents and administrators.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and configure:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="your-database-url"

# Auth Secrets
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
API_JWT_SECRET="your-secret-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server Config
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Initialize Database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed with sample data
```

### 4. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

### 5. Login Credentials

**Admin:**
- Email: `admin@ecotrack.local`
- Password: `Admin12345`

**Resident:**
- Email: `john.doe@example.com`
- Password: `Password123`

---

## 📁 Project Structure

```
ecotrack/
├── apps/
│   ├── api/          # Express API (embedded in Next.js)
│   └── web/          # Next.js frontend
├── prisma/           # Database schema & migrations
└── .env              # Environment variables
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Prisma, PostgreSQL
- **Auth**: NextAuth.js
- **Storage**: Cloudinary

---

## 📝 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run typecheck    # Type check all code
npm run lint         # Lint code
```

---

## 🚀 Deployment

The app runs on a **single Next.js server** (port 3000) with the Express API embedded at `/api/backend/*`.

Deploy to Vercel:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

---

## 📄 License

MIT License
