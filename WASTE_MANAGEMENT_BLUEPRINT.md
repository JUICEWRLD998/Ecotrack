# Waste Management Web Application Blueprint

## Project Overview

The Waste Management Web Application provides a communication platform between residents and waste collection administrators. Residents can submit waste collection requests when bins are full, upload supporting images, track request progress, receive notifications, and view upcoming collection schedules. Admins can manage requests, assign work, schedule collections, update statuses, manage users, and monitor analytics.

## Technology Stack

### Frontend

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- Recharts
- FullCalendar

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

### Authentication

- Auth.js / NextAuth
- Email and password authentication
- Role-based access control

### External Services

- Cloudinary for image uploads
- Resend for email notifications
- Vercel for frontend deployment
- Hosted PostgreSQL database

## System Architecture

```txt
Resident/Admin Browser
        |
        v
Next.js 15 App Router Frontend
        |
        | Auth.js session / API calls
        v
Express.js API Server
        |
        | Prisma ORM
        v
PostgreSQL Database

External services:
- Cloudinary: bin image uploads
- Resend: transactional emails
- Vercel: frontend hosting
- Hosted PostgreSQL: production database
```

The Next.js application owns the user interface, protected pages, forms, dashboards, calendars, and session-aware rendering. The Express API owns business workflows, database mutations, upload signatures, analytics queries, and notification triggers. Prisma is the only database access layer.

RBAC must be enforced in both frontend route protection and backend API middleware. Client-side checks improve user experience, but server-side checks are authoritative.

## User Roles

### Resident

Residents can register, log in, update their profile, submit collection requests, upload bin images, view request history, track request statuses, receive email notifications, and view upcoming collection schedules.

### Admin

Admins can log in, view dashboards, filter and manage requests, assign requests, schedule collection dates, update request statuses, manage users, send notifications, and view analytics.

## Database ERD

```txt
User
 ├─ has many WasteRequest as resident
 ├─ has many WasteRequest as assigned admin
 ├─ has many Notification
 ├─ has many StatusHistory records as actor
 └─ has many AuditLog records as actor

WasteRequest
 ├─ belongs to User as resident
 ├─ optionally belongs to User as assigned admin
 ├─ has many StatusHistory records
 └─ has many CollectionSchedule records

CollectionSchedule
 └─ belongs to WasteRequest

Notification
 └─ belongs to User

StatusHistory
 ├─ belongs to WasteRequest
 └─ optionally belongs to User as changedBy

AuditLog
 └─ optionally belongs to User as actor
```

## Prisma Schema Design

```prisma
enum UserRole {
  RESIDENT
  ADMIN
}

enum WasteType {
  HOUSEHOLD
  RECYCLABLE
  ORGANIC
}

enum RequestStatus {
  PENDING
  ASSIGNED
  SCHEDULED
  IN_PROGRESS
  COLLECTED
}

model User {
  id            String          @id @default(cuid())
  name          String
  email         String          @unique
  password      String
  role          UserRole        @default(RESIDENT)
  isActive      Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  requests      WasteRequest[]  @relation("ResidentRequests")
  assigned      WasteRequest[]  @relation("AssignedRequests")
  notifications Notification[]
  statusChanges StatusHistory[]
  auditLogs     AuditLog[]

  @@index([role])
  @@index([createdAt])
}

model WasteRequest {
  id             String               @id @default(cuid())
  userId         String
  assignedToId   String?
  wasteType      WasteType
  address        String
  description    String?
  imageUrl       String?
  status         RequestStatus        @default(PENDING)
  preferredDate  DateTime?
  scheduledDate  DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  user           User                 @relation("ResidentRequests", fields: [userId], references: [id])
  assignedTo     User?                @relation("AssignedRequests", fields: [assignedToId], references: [id])
  schedules      CollectionSchedule[]
  statusHistory  StatusHistory[]

  @@index([userId])
  @@index([assignedToId])
  @@index([status])
  @@index([wasteType])
  @@index([scheduledDate])
  @@index([createdAt])
}

model CollectionSchedule {
  id             String       @id @default(cuid())
  requestId      String
  collectionDate DateTime
  notes          String?
  createdAt      DateTime     @default(now())

  request        WasteRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
  @@index([collectionDate])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

model StatusHistory {
  id          String        @id @default(cuid())
  requestId   String
  status      RequestStatus
  note        String?
  changedById String?
  createdAt   DateTime      @default(now())

  request     WasteRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  changedBy   User?         @relation(fields: [changedById], references: [id])

  @@index([requestId])
  @@index([status])
  @@index([createdAt])
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  entity    String
  entityId  String?
  metadata  Json?
  createdAt DateTime @default(now())

  actor     User?    @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([entity])
  @@index([createdAt])
}

model EmailLog {
  id         String   @id @default(cuid())
  userId     String?
  to         String
  subject    String
  providerId String?
  status     String
  error      String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

## Folder Structure

```txt
ecotrack/
  apps/
    web/
      app/
        (public)/
          page.tsx
          login/
          register/
        (resident)/
          dashboard/
          requests/
          requests/new/
          requests/[id]/
          profile/
          calendar/
        (admin)/
          admin/
          admin/requests/
          admin/requests/[id]/
          admin/users/
          admin/schedules/
          admin/analytics/
        api/auth/[...nextauth]/
      components/
        ui/
        forms/
        layout/
        dashboard/
        calendar/
        charts/
      lib/
        auth.ts
        api-client.ts
        validations/
        utils.ts
      hooks/
      types/

    api/
      src/
        app.ts
        server.ts
        config/
        middleware/
        modules/
          auth/
          users/
          requests/
          schedules/
          notifications/
          analytics/
          uploads/
        services/
          cloudinary.service.ts
          email.service.ts
        utils/
        validators/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  packages/
    shared/
      src/
        types/
        constants/
        schemas/
```

## API Route Design

### Authentication

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Users

```txt
GET    /api/users/me
PATCH  /api/users/me
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
```

### Waste Requests

```txt
POST   /api/requests
GET    /api/requests/my
GET    /api/requests/:id
PATCH  /api/requests/:id
GET    /api/admin/requests
GET    /api/admin/requests/:id
PATCH  /api/admin/requests/:id/assign
PATCH  /api/admin/requests/:id/status
```

### Schedules

```txt
POST   /api/admin/schedules
GET    /api/schedules/my
GET    /api/admin/schedules
PATCH  /api/admin/schedules/:id
DELETE /api/admin/schedules/:id
```

### Uploads

```txt
POST /api/uploads/signature
```

### Notifications

```txt
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

### Analytics

```txt
GET /api/admin/analytics/overview
GET /api/admin/analytics/waste-types
GET /api/admin/analytics/monthly-trends
GET /api/admin/analytics/completion-rate
```

## Authentication Flow

1. A resident registers with name, email, and password.
2. The API validates the request body with Zod.
3. The password is hashed using bcrypt or argon2.
4. A user record is created with the default `RESIDENT` role.
5. Resend sends a welcome email.
6. Login uses Auth.js Credentials Provider.
7. Auth.js stores session data securely.
8. Middleware protects route groups.
9. Admin-only pages and endpoints require `ADMIN` role.
10. Server-side RBAC is authoritative.

## State Management Strategy

- Auth state: Auth.js session.
- Server state: TanStack Query or SWR.
- Form state: React Hook Form.
- Validation: Zod on both client and server.
- UI state: local React state for filters, modals, selected tabs, and calendar view.
- Shared contracts: central schemas and constants in `packages/shared`.

Avoid unnecessary global state. Most important state should come from the server.

## Dashboard Design Plan

### Resident Dashboard

- Total submitted requests
- Pending requests
- Completed requests
- Upcoming collection date
- Recent requests table
- Quick action to submit a new request

### Admin Dashboard

- Total requests
- Pending requests
- Assigned requests
- Scheduled requests
- Completed requests
- Completion rate
- Active users
- Recent requests table
- Request status distribution chart
- Monthly collection trend chart

## Calendar Integration Plan

Use FullCalendar for monthly calendar views.

Resident calendar:

- Shows only the resident's scheduled collections.
- Events include waste type, request status, and collection date.
- Clicking an event opens request details.

Admin calendar:

- Shows all scheduled collections.
- Supports filters by status, waste type, and assigned admin.
- Scheduling and rescheduling should happen from request detail screens.

## Email Notification Architecture

Use a dedicated email service wrapper around Resend.

Email triggers:

- Registration completed
- Request submitted
- Request assigned
- Collection scheduled
- Collection completed

Recommended flow:

```txt
Controller action
  -> database mutation
  -> create Notification row
  -> send Resend email
  -> create EmailLog row
```

Email templates:

- Welcome email
- Request submitted
- Request assigned
- Collection scheduled
- Collection completed

## Analytics Architecture

Analytics should be generated with indexed database queries.

Metrics:

- Total requests
- Pending requests
- Assigned requests
- Scheduled requests
- Completed requests
- Total users
- Active users
- Requests by waste type
- Monthly collection trends
- Collection completion rate

Charts:

- KPI cards for totals
- Bar chart for waste type distribution
- Line chart for monthly collection trends
- Donut chart for request status distribution

## Security Best Practices

- Hash all passwords before storage.
- Validate all request bodies server-side with Zod.
- Enforce RBAC on frontend and backend.
- Never trust client-provided role data.
- Store secrets in environment variables.
- Use signed Cloudinary upload flows.
- Restrict upload file size and file type.
- Add rate limiting to authentication endpoints.
- Use secure cookies in production.
- Avoid leaking internal error details.
- Add audit logs for admin actions.
- Add indexes for common filters.
- Sanitize user-provided text before rendering.

## Development Roadmap

### Phase 1: Foundation

- Set up Next.js app.
- Set up Express API.
- Configure TypeScript.
- Configure Tailwind CSS and Shadcn UI.
- Configure Prisma and PostgreSQL.
- Add shared validation schemas.

### Phase 2: Authentication

- Add registration.
- Add login and logout.
- Add password hashing.
- Add Auth.js session handling.
- Add protected routes.
- Add RBAC middleware.

### Phase 3: Resident Features

- Build resident dashboard.
- Build request submission form.
- Add Cloudinary upload.
- Build my requests page.
- Build request detail page.
- Add status history display.

### Phase 4: Admin Features

- Build admin dashboard.
- Build request management page.
- Add assignment workflow.
- Add status update workflow.
- Build user management.

### Phase 5: Scheduling

- Add collection schedule model.
- Build admin scheduling UI.
- Build resident calendar.
- Build admin calendar.

### Phase 6: Notifications

- Add in-app notifications.
- Integrate Resend.
- Create email templates.
- Log email attempts.

### Phase 7: Analytics

- Add analytics APIs.
- Build Recharts dashboard.
- Add date, status, and waste type filters.

### Phase 8: Production Hardening

- Add structured error handling.
- Add request logging.
- Add rate limiting.
- Add seed data.
- Add tests.
- Prepare deployment configuration.

## MVP Scope

- Auth with resident and admin roles
- Resident request submission
- Image upload
- Request tracking
- Admin request management
- Status workflow
- Basic scheduling
- Email notifications
- Basic analytics

## Future Features

- Password reset
- Email verification
- SMS notifications
- Collector or driver role
- Route optimization
- Maps and geolocation
- Multi-city support
- SLA tracking
- Reporting exports
- Push notifications
- Mobile app

## Deployment Plan

Recommended production setup:

- Frontend: Vercel
- Backend: Railway, Render, Fly.io, or a Vercel-compatible serverless API approach
- Database: Neon, Supabase, Railway PostgreSQL, or another managed PostgreSQL provider
- Assets: Cloudinary
- Email: Resend

Required environment variables:

```txt
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
API_BASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
```

Deployment steps:

1. Create a hosted PostgreSQL database.
2. Configure and run Prisma migrations.
3. Deploy the Express API.
4. Deploy the Next.js app to Vercel.
5. Add production environment variables.
6. Configure Auth.js production URLs.
7. Configure Cloudinary upload restrictions.
8. Configure a verified Resend domain.
9. Run smoke tests for auth, request submission, scheduling, and emails.

