# EcoTrack — Waste Collection Management Platform

EcoTrack is a full-stack web application that connects residents with waste collection administrators. Residents can submit collection requests, upload photos, track pickup status, and view scheduled collections on a calendar. Admins manage the full operation — assigning requests, scheduling pickups, updating statuses, and monitoring analytics from a dedicated dashboard.

---

## Features

### Resident Portal
- Submit waste collection requests with waste type, address, description, and photo
- Track request status in real time (Pending → Assigned → Scheduled → In Progress → Collected)
- View upcoming and past collections on an interactive calendar
- Receive in-app notifications for status updates and schedule changes
- Manage profile and account settings

### Admin Portal
- Overview dashboard with key metrics (total requests, pending, assigned, completed, completion rate)
- Manage all incoming requests — assign to team members, update status, add notes
- Schedule collection dates and manage the collection calendar
- View and manage all registered users (activate/deactivate, change roles)
- Analytics: status distribution, waste type breakdown, monthly trends
- Full audit trail of all actions

### General
- Dark / light mode with toggle on every page, persists across sessions
- Fully responsive — works on mobile, tablet, and desktop
- Secure admin registration protected by an invite code
- Role-based access control (Resident vs Admin)
- Image uploads via Cloudinary

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Backend | Express.js (embedded inside Next.js via Pages API routes) |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless Postgres) |
| ORM | Prisma 6 |
| Auth | Custom JWT sessions with HTTP-only cookies |
| File Storage | Cloudinary |
| Validation | Zod |
| Charts | Recharts |
| Logging | Pino + pino-http |
| Monorepo | npm workspaces |

### Architecture note
The Express API (`apps/api`) is not deployed as a separate server. It is embedded directly inside the Next.js app via a Pages Router catch-all route at `/api/backend/*`. This means the entire application — frontend and backend — deploys as a single Next.js app with no separate API server needed.

---

## Project Structure

```
ecotrack/
├── apps/
│   ├── api/                  # Express API (auth, requests, schedules, notifications, analytics)
│   │   └── src/
│   │       ├── modules/      # Feature modules (auth, requests, admin, notifications, etc.)
│   │       ├── middleware/   # Auth, rate limiting, error handling, logging
│   │       ├── services/     # Cloudinary, notifications
│   │       └── config/       # Prisma client, env config
│   └── web/                  # Next.js frontend
│       ├── app/              # App Router pages (resident + admin layouts)
│       ├── components/       # UI components, forms, layout
│       ├── lib/              # API client, auth, server actions, schemas
│       └── pages/api/        # Express catch-all API bridge
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── .env                      # Environment variables
```

---

## Database Schema

Built on **Neon** (serverless PostgreSQL). The schema has six models:

- `User` — residents and admins, with roles and active status
- `WasteRequest` — the core request with waste type, address, status, and image
- `StatusHistory` — every status change on a request, with notes and actor
- `CollectionSchedule` — one-to-one schedule record per request with collection date
- `Notification` — per-user in-app notifications
- `AuditLog` — admin action audit trail

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-username/ecotrack.git
cd ecotrack
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://..."

# Auth — generate a strong random string for both
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
API_JWT_SECRET="your-secret"

# Admin registration — users need this code to create an admin account
ADMIN_INVITE_CODE="your-invite-code"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

Also create `apps/web/.env.local` with the same values — Next.js reads its env from its own directory:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
API_JWT_SECRET="your-secret"
ADMIN_INVITE_CODE="your-invite-code"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations against your Neon database
npm run db:seed        # Seed with sample admin and resident accounts
```

### 4. Start development

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Test Accounts

After seeding, these accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ecotrack.local` | `Admin12345` |
| Resident | `john.doe@example.com` | `Password123` |

To create a new admin account, go to the landing page → **Admin Access** → **Create an admin account** and enter the `ADMIN_INVITE_CODE` from your `.env`.

---

## Available Commands

```bash
npm run dev            # Start the Next.js development server
npm run build          # Build for production
npm run start          # Start the production server
npm run typecheck      # Type-check all packages
npm run lint           # Lint the web app
npm run db:generate    # Regenerate Prisma client after schema changes
npm run db:migrate     # Apply schema migrations to the database
npm run db:seed        # Seed the database with sample data
npm run db:studio      # Open Prisma Studio (database GUI)
```

---

## Deploying to Vercel

The app deploys as a single Next.js project — no separate API server needed.

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `apps/web`
4. Add these environment variables in Vercel project settings:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Strong random string |
| `NEXTAUTH_URL` | Your Vercel deployment URL, e.g. `https://ecotrack.vercel.app` |
| `API_JWT_SECRET` | Same value as `NEXTAUTH_SECRET` |
| `ADMIN_INVITE_CODE` | Code required to register as admin |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your Vercel deployment URL |

5. Deploy — Vercel runs `prisma generate && next build` automatically via the build script.

> `VERCEL_URL` is injected automatically by Vercel (without `https://`). The app handles this correctly — no extra config needed.

---

## License

MIT
