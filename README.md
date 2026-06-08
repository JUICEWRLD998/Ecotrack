# EcoTrack - Waste Management System

A modern waste collection management platform built with Next.js, Express, and PostgreSQL. EcoTrack enables residents to submit waste collection requests and administrators to manage, schedule, and track collections efficiently.

## 🚀 Features

### For Residents
- **Request Submission**: Submit waste collection requests with images
- **Request Tracking**: Monitor request status in real-time
- **Calendar View**: View upcoming collection schedules
- **Notifications**: Receive updates on request progress
- **Dashboard**: Track pending and completed requests

### For Administrators
- **Request Management**: View, assign, and update requests
- **User Management**: Manage resident accounts
- **Scheduling**: Schedule and reschedule collections
- **Analytics Dashboard**: View metrics, trends, and performance data
- **Audit Logging**: Track all administrative actions

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form + Zod
- Recharts

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Rate Limiting (express-rate-limit)
- Structured Logging (pino)

**Auth:**
- NextAuth.js v5
- Role-based access control (RBAC)

**External Services:**
- Cloudinary (image uploads)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Cloudinary account (for image uploads)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ecotrack
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb ecotrack

# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/ecotrack"
```

### 3. Configure Environment Variables

Edit `.env` and fill in:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecotrack"

# Auth (secrets already generated)
NEXTAUTH_SECRET="+8MgbUHgKUnTuK1273Ky9SnSE9eC8nMD2T2glmWoz5I="
API_JWT_SECRET="+8MgbUHgKUnTuK1273Ky9SnSE9eC8nMD2T2glmWoz5I="

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### 6. Login Credentials

After seeding, use these credentials:

**Admin:**
- Email: `admin@ecotrack.local`
- Password: `Admin12345`

**Resident:**
- Email: `john.doe@example.com`
- Password: `Password123`

## 📁 Project Structure

```
ecotrack/
├── apps/
│   ├── api/              # Express API server
│   │   └── src/
│   │       ├── config/   # Environment, Prisma config
│   │       ├── middleware/ # Auth, validation, rate limiting
│   │       ├── modules/  # Feature modules (auth, requests, etc.)
│   │       ├── services/ # External services (Cloudinary, email)
│   │       └── utils/    # Helpers, error handling
│   └── web/              # Next.js frontend
│       ├── app/          # App router pages
│       │   ├── (public)  # Public routes (login, register)
│       │   ├── (resident)# Resident dashboard
│       │   └── (admin)   # Admin dashboard
│       ├── components/   # React components
│       └── lib/          # Client utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts          # Seed data script
└── packages/
    └── shared/          # Shared types and schemas
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both API and web in watch mode
npm run dev:web          # Start only Next.js
npm run dev:api          # Start only Express API

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Production
npm run build            # Build for production
npm run typecheck        # Type check all workspaces
npm run lint             # Lint code
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting (configured in editor)
- **Rate Limiting**: Applied to auth and upload endpoints
- **Error Handling**: Centralized error handler with logging
- **Validation**: Zod schemas for all inputs

## 🎨 UI Components

Built with Shadcn UI and Tailwind CSS:

- **Toast Notifications**: Success/error feedback (Sonner)
- **Confirmation Dialogs**: For destructive actions
- **Error Boundaries**: Graceful error handling
- **Loading States**: Proper pending states on forms
- **Responsive Design**: Mobile-first approach

## 🔒 Security

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Rate limiting on auth endpoints
- ✅ CSRF protection via NextAuth
- ✅ SQL injection prevention (Prisma)
- ✅ Input validation (Zod)
- ✅ Secure headers (Helmet)
- ✅ CORS configuration
- ✅ Role-based access control

## 📊 Database Schema

Key models:
- **User**: Residents and admins
- **WasteRequest**: Collection requests
- **CollectionSchedule**: Scheduled collections
- **Notification**: In-app notifications
- **StatusHistory**: Request status audit trail
- **AuditLog**: Administrative action logging
- **EmailLog**: Email delivery tracking

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

Both frontend and backend run on Vercel as a unified deployment.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run typecheck` and `npm run lint`
4. Submit a pull request

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests/my` - Get user's requests
- `GET /api/requests/:id` - Get request details
- `GET /api/admin/requests` - List all requests (admin)
- `PATCH /api/admin/requests/:id/status` - Update status (admin)

### Schedules
- `POST /api/admin/schedules` - Create schedule (admin)
- `GET /api/schedules/my` - Get user's schedules
- `GET /api/admin/schedules` - List all schedules (admin)

### Analytics
- `GET /api/admin/analytics/overview` - Dashboard metrics (admin)

Full API documentation available in [WASTE_MANAGEMENT_BLUEPRINT.md](./WASTE_MANAGEMENT_BLUEPRINT.md)

## 📈 Monitoring

**Development:**
- Console logging with Pino
- Prisma query logging

**Production:**
- Structured JSON logs (Pino)
- Vercel function logs
- Database query monitoring
- Error tracking (error boundaries)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL format
postgresql://user:password@host:5432/database
```

### Port Already in Use
```bash
# Kill process on port 3000 or 4000
npx kill-port 3000 4000
```

### Prisma Client Errors
```bash
# Regenerate client
npm run db:generate
```

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Shadcn UI](https://ui.shadcn.com)
- [Vercel](https://vercel.com)

---

**Built with ❤️ for efficient waste management**
