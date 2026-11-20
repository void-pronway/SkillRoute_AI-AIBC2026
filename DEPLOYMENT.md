# SkillRoute AI 2.0 — Deployment & Operations Guide

## 1. Local Development Quickstart

### Prerequisites
- Node.js v18+ (tested on Node v20/v24)
- npm v10+

### Setup Commands
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema (creates local SQLite dev.db)
npm run prisma:push

# 3. Seed demo accounts, career tracks, practical missions, and jobs
npm run prisma:seed

# 4. Run automated test suite (verifies mathematical invariants)
npm test

# 5. Start the development server
npm run dev
# The application will be available at http://localhost:3000
```

---

## 2. Production Docker Deployment

Deploying with Docker Compose provides a persistent PostgreSQL database alongside the containerized Next.js application:

```bash
# Build and run containers
docker-compose up -d --build

# Push database schema to PostgreSQL
docker-compose exec app npx prisma db push

# Seed production baseline data
docker-compose exec app node scripts/seed.js
```

---

## 3. Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma connection string (SQLite or PostgreSQL) | `file:./dev.db` |
| `SESSION_SECRET` | Secret key for session management | Custom string |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |
| `GEMINI_API_KEY` | Optional API key for AI explanations (fallback works without key) | `""` |

---

## 4. Pre-Seeded Demo Credentials

| Role | Email | Password | Primary Features |
|---|---|---|---|
| **Student** | `student@skillroute.ai` | `Password123!` | Benchmark A, Profiling, Roadmaps, Missions, SkillProof |
| **Employer Owner** | `employer@technext.bd` | `Password123!` | TechNext Ltd. Profile, Job Posting, Recruiter Team |
| **Recruiter** | `recruiter@technext.bd` | `Password123!` | Candidate Search, Competency Filter, Shortlist Pipeline |
| **Admin** | `admin@skillroute.ai` | `Password123!` | User Registry, Org Verification, Audit Logs, Dispute Review |
