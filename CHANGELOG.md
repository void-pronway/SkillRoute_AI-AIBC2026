# Changelog — SkillRoute AI

All notable changes to the SkillRoute AI platform will be documented in this file.

## [2.0.0] - Complete Production-Oriented Rebuild (AIBC 2026)

### Added
- **Modern Full-Stack Technical Rebuild:**
  - Migrated from legacy client-heavy script to Next.js 14 App Router, React 18, and TypeScript strict mode.
  - Relational PostgreSQL/SQLite database models with Prisma ORM, foreign keys, transactions, and unique constraints.
  - Real server-side authentication using Bcrypt and HttpOnly session cookies.
  - Server-side Role-Based Access Control (RBAC) supporting 5 distinct roles: `STUDENT`, `EMPLOYER_OWNER`, `EMPLOYER_RECRUITER`, `ASSESSMENT_REVIEWER`, `PLATFORM_ADMIN`.

- **SkillRoute Mission Arena:**
  - Interactive practical assessment environments for all 5 career pathways:
    - Data Analyst: SQL Query executor & analytical grader against realistic multi-table relational data.
    - Backend Developer: REST API endpoint debugging, input validation, and SQLi mitigation.
    - Frontend Developer: WCAG 2.2 AA accessible component construction with ARIA sliders.
    - Cybersecurity Analyst: Simulated SOC incident response analyzing SSH authentication logs.
    - UI/UX Designer: Heuristic evaluation and wireframe restructuring.
  - Safe server-side rubric scoring and attempt telemetry tracking.

- **SkillProof™ Level 2 & Verified Credentials:**
  - 5-Tier skill evidence framework (`SELF_REPORTED`, `KNOWLEDGE_ASSESSED`, `PRACTICALLY_DEMONSTRATED`, `PROJECT_REVIEWED`, `EMPLOYER_VERIFIED`).
  - Cryptographically signed verified credentials with public verification route (`/verify/[credentialId]`) and dynamically generated QR codes.
  - Public portfolio sharing (`/portfolio/[publicId]`) with granular demographic consent toggles and one-click instant revocation.
  - JSON schema export and print-ready PDF styling.

- **Employer Portal & Talent Discovery:**
  - Organization profiles with official verification seals.
  - Structured competency-based job posting.
  - Multi-criteria candidate discovery with explainable match metrics and evidence review.
  - Recruitment pipeline management with shortlisting and status tracking (`REVIEWING`, `SHORTLISTED`, `INTERVIEWING`, `OFFERED`).

- **Platform Administration & Security Governance:**
  - User and organization verification management.
  - Real platform metrics and KPIs.
  - Tamper-resistant security audit logging (`AuditLog`).

- **Design System & Localization:**
  - Bespoke, professional interface built with the official SkillRoute color palette (Soft Cream, Sage Green, Golden Yellow, Jet Black, Onyx).
  - Responsive mobile design (320px+).
  - Bilingual English and Bengali (Bangla) with 100% translation key parity and Bengali numeral conversion.

### Preserved
- 100% mathematical fidelity of the deterministic career match coverage formula:
  - Benchmark A (Junior Data Analyst: 58.33%, 80.0h, 10 weeks, 32.0h first 4 weeks, 48.0h remaining).
  - Benchmark B (SQL Level 3: 66.67%, 70.0h, 9 weeks, 38.0h remaining).
- 4-state diagnostic MCQ evidence classification.
- Verified authoritative public learning resources attached to starter roadmaps.
