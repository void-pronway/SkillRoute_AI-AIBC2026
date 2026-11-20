# SkillRoute AI 2.0 — From Learning to Employability

**Version:** 2.0.0  
**Target:** AIBC Workforce Ready Challenge 2026 — Daffodil International University  
**Product Category:** AI-Assisted Workforce Development, Skill Assessment, Evidence-Based Credentialing and Talent Recruitment Platform  

---

## Executive Summary
SkillRoute AI 2.0 is a complete, production-oriented full-stack web application designed to bridge the gap between academic education and industry hiring. Rather than relying on self-reported claims or unvalidated CVs, SkillRoute AI establishes an evidence-driven talent pipeline where students learn targeted skills, solve practical engineering missions in isolated assessment environments, earn tamper-resistant credentials, and present verifiable proof directly to employers.

---

## Key Pillars & Product Capabilities

### 1. Deterministic Career Profiling & Mathematical Invariants
- Preserves 100% mathematical fidelity of the validated blueprint matching formulas.
- **Benchmark A (Junior Data Analyst):** Python 3, SQL 2, Excel 3 -> **58.33% match**, **80.0 hours** effort, **10 weeks** timeline at 8h/week.
- **Benchmark B (Updated SQL to Level 3):** Python 3, SQL 3, Excel 3 -> **66.67% match**, **70.0 hours** effort, **9 weeks** timeline at 8h/week.
- Five standardized career pathways: Junior Data Analyst, Junior Backend Developer, Junior Frontend Developer, Junior Cybersecurity Analyst, Junior UI/UX Designer.

### 2. SkillRoute Mission Arena (Practical Assessment Environments)
- Replaces multiple-choice quizzes with real technical challenges:
  - **Data Analyst:** SQL query editor with multi-table relational joins, aggregations, and business metrics.
  - **Backend Developer:** REST API endpoint repair, input payload bounds validation, and SQL injection mitigation.
  - **Frontend Developer:** Responsive, WCAG 2.2 AA accessible component construction with keyboard-navigable ARIA sliders.
  - **Cybersecurity Analyst:** Simulated Security Operations Center (SOC) incident investigation analyzing authentication logs and malware commands.
  - **UI/UX Designer:** Usability audit using Nielsen Norman heuristics, contrast evaluation, and wireframe restructuring.
- Server-side rubric scoring (no arbitrary code execution in the main process).
- Assessment integrity telemetry: focus blur tracking, Mode A (Independent) vs Mode B (AI-Assisted with disclosure).

### 3. SkillProof™ Level 2 & Verified Credentials
- **5-Tier Evidence Hierarchy:** `SELF_REPORTED`, `KNOWLEDGE_ASSESSED`, `PRACTICALLY_DEMONSTRATED`, `PROJECT_REVIEWED`, `EMPLOYER_VERIFIED`.
- Platform-issued verified credentials with unique cryptographic IDs, public verification URLs (`/verify/[id]`), and dynamic QR codes.
- Cryptographically unpredictable public portfolio URLs (`/portfolio/[publicId]`) with granular demographic consent and instant one-click revocation.
- JSON schema export and print-ready PDF styling.

### 4. Employer Portal & Talent Discovery
- Organization registration with official verification seals (e.g. TechNext Ltd.).
- Competency-based job posting with structured skill target levels and importance weights.
- Explainable candidate discovery filtering by career track, demonstrated competencies, and practical assessment scores.
- End-to-end recruitment pipeline (`REVIEWING` -> `SHORTLISTED` -> `INTERVIEWING` -> `OFFERED`).

### 5. Platform Administration & Security Governance
- User registry and role-based access control (`STUDENT`, `EMPLOYER_OWNER`, `EMPLOYER_RECRUITER`, `ASSESSMENT_REVIEWER`, `PLATFORM_ADMIN`).
- Employer organization verification.
- Tamper-resistant security audit logging (`AuditLog`).

### 6. Design System & Bilingual Localization
- Premium, modern design system built with the official SkillRoute color palette:
  - Sage Green (`#CFDBD5`)
  - Soft Cream (`#E8EDDF`)
  - Golden Yellow (`#F5CB5C`)
  - Jet Black (`#242423`)
  - Onyx (`#333533`)
- Light and Dark modes with responsive mobile layouts (320px+).
- Complete bilingual support (English and Bengali) with 100% translation key parity, natural Bengali phrasing, and Bengali numerals (`০-৯`). First-time visitors default to Bangla.

---

## Technology Stack

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript (strict mode), Tailwind CSS, Lucide Icons, QRCode.
- **Backend:** Next.js Server Components and Route Handlers, Zod validation, structured logging.
- **Database & ORM:** Prisma ORM with relational schema, foreign keys, unique constraints, and indexes. Backed by SQLite for zero-dependency local dev/demo and PostgreSQL with Docker Compose for production.
- **Authentication:** Bcrypt password hashing, cryptographic session tokens, HttpOnly SameSite cookies.
- **AI Integration:** Server-side Gemini API provider abstraction with automatic deterministic fallback.

---

## Quickstart & Verification

```bash
# 1. Install dependencies
npm install

# 2. Sync database schema
npm run prisma:push

# 3. Seed demo accounts, missions, and jobs
npm run prisma:seed

# 4. Run automated regression test suite (verifies 35/35 assertions)
npm test

# 5. Build production bundle
npm run build

# 6. Start production server
npm start
# Live at http://localhost:3000
```

---

## 1-Click Demo Accounts

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Student** | `student@skillroute.ai` | `Password123!` | Benchmark A & B, Roadmaps, Mission Arena, SkillProof |
| **Employer** | `employer@technext.bd` | `Password123!` | TechNext Ltd. Profile, Job Posting, Candidate Search |
| **Admin** | `admin@skillroute.ai` | `Password123!` | User Management, Org Verification, Security Audit Logs |
