# SkillRoute AI 2.0 — Architecture Specification

## 1. System Vision & Objective
SkillRoute AI 2.0 is a complete, production-oriented platform connecting university education directly to verified employment readiness.
**Core Principle:** A student must not merely claim a skill; they must learn it, practice it, demonstrate it through objective practical assessments, receive verified credentials, and present evidence to hiring organizations.

---

## 2. Multi-Role Portals & Workflows
The platform serves three interconnected user areas:

```
                      ┌─────────────────────────────────┐
                      │    SkillRoute AI Unified Core    │
                      │   Relational Evidence Ledger    │
                      └────────────────┬────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  Student Portal  │          │ Employer Portal  │          │   Admin Portal   │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│• Skill Profiling │          │• Job Creation    │          │• User Management │
│• MCQ Diagnostic  │          │• Talent Discovery│          │• Org Verification│
│• Career Matching │          │• Candidate Search│          │• Challenge Audit │
│• 4-Week Roadmap  │          │• Practical Proof │          │• Credential Audit│
│• Study Tracker   │          │• Pipeline Mgmt   │          │• Security Logs   │
│• Mission Arena   │          │• Shortlisting    │          │• Analytics KPIs  │
│• SkillProof      │          │• Invitations     │          │• Dispute Review  │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

---

## 3. Technology Stack & Component Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router), React 18
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with official SkillRoute brand palette:
  - Sage Green (`#CFDBD5`): Neutral cards, subtle borders, tags
  - Soft Cream (`#E8EDDF`): Primary light canvas
  - Golden Yellow (`#F5CB5C`): Brand accent, active states, buttons
  - Jet Black (`#242423`): Dark theme background, primary typography
  - Onyx (`#333533`): Dark cards, secondary text
- **Icons:** Lucide React
- **QR Code:** Node `qrcode` library for dynamic credential verification QR codes

### Backend
- **Architecture:** Modular monolith with Next.js App Router API endpoints
- **Database:** Prisma ORM with relational schema, foreign keys, unique constraints, and indexes. Backed by SQLite for zero-dependency local dev/demo and PostgreSQL + Docker Compose for production.
- **Authentication:** Server-side sessions with cryptographic tokens, Argon2/Bcrypt password hashing, HttpOnly SameSite cookies.
- **Authorization:** Role-Based Access Control (RBAC) enforced on server routes.

### AI Integration
- Server-side Gemini API provider abstraction.
- High-quality deterministic fallback that runs without internet or API key.
- Strict constraint: AI cannot alter deterministic match scores, cannot issue credentials, and cannot make opaque recruitment decisions.

---

## 4. Deterministic Mathematical Invariants
The core matching engine maintains strict mathematical reproducibility:

### Weighted Skill Coverage
$$\text{Coverage}(s, c) = \min\left(1, \frac{P(s)}{T(s, c)}\right)$$
$$\text{CareerMatch}(c) = 100 \times \frac{\sum w(s, c) \cdot \text{Coverage}(s, c)}{\sum w(s, c)}$$

### Gap-Adjusted Learning Effort
$$\text{Gap}(s, c) = \max\left(0, \frac{T(s, c) - P(s)}{T(s, c)}\right)$$
$$\text{Effort}(s, c) = H(s, c) \times \text{Gap}(s, c)$$
$$\text{CareerEffort}(c) = \sum \text{Effort}(s, c)$$
$$\text{EstimatedWeeks}(c) = \left\lceil \frac{\text{CareerEffort}(c)}{\text{WeeklyStudyHours}} \right\rceil$$

### Verified Reference Benchmarks
1. **Benchmark A (Junior Data Analyst):**
   - Profile: Python 3, SQL 2, Excel 3 (Stats 0, Power BI 0)
   - Match Score: 58.33%
   - Total Effort: 80.0 hours
   - Duration (at 8h/wk): 10 weeks
   - First 4 weeks: 32.0 hours
   - Remaining beyond week 4: 48.0 hours

2. **Benchmark B (Updated SQL to Level 3):**
   - Profile: Python 3, SQL 3, Excel 3 (Stats 0, Power BI 0)
   - Match Score: 66.67%
   - Total Effort: 70.0 hours
   - Duration (at 8h/wk): 9 weeks
   - First 4 weeks: 32.0 hours
   - Remaining beyond week 4: 38.0 hours
