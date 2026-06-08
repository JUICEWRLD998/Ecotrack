# EcoTrack

EcoTrack is a Waste Management Web Application for residents and waste collection administrators.

## Phase 1 Foundation

This repository is structured as an npm workspace monorepo:

- `apps/web`: Next.js 15 frontend.
- `apps/api`: Express API.
- `packages/shared`: shared TypeScript constants and Zod schemas.
- `prisma`: PostgreSQL schema and database tooling.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Generate Prisma Client:

   ```bash
   npm run db:generate
   ```

4. Start both apps:

   ```bash
   npm run dev
   ```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.
