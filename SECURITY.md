# SkillRoute AI 2.0 — Security & Privacy Architecture

## 1. Authentication & Session Security
- **Password Storage:** All passwords are salted and hashed using Bcrypt (10 rounds). Plaintext passwords are never stored or logged.
- **Session Tokens:** Cryptographically random 256-bit hexadecimal tokens (`crypto.randomBytes(32)`).
- **Cookie Security:** Cookies are configured with `HttpOnly`, `SameSite=Lax`, and `Secure` in production environments, preventing client-side JavaScript access and XSS theft.
- **Role-Based Authorization:** Server-side authorization enforced on every sensitive API handler (`isAuthorizedRole`). Client-side navigation guards are for UX only; backend endpoints reject unauthorized requests with HTTP 401/403.

---

## 2. Assessment Execution & Anti-Cheating Integrity
- **No Unsandboxed Code Execution:** The main application server never executes arbitrary client-submitted code.
- **Structured Evaluator:** Practical tasks use domain-specific server-side parsing, deterministic query evaluation against sample relational tables, and rubric checking.
- **Telemetry Signals:** Browser visibility and focus blur events are recorded as risk telemetry signals rather than grounds for harsh automated disqualification.
- **Assessment Modes:**
  - **Mode A (Independent):** Student certifies completion without external AI assistance.
  - **Mode B (AI-Assisted):** Student discloses tool usage and explains implementation understanding.

---

## 3. Student Data Privacy & Granular Consent
- **Public Portfolio Sharing:** Completely opt-in.
- **Cryptographic Slugs:** Public IDs use cryptographically unpredictable random tokens (`/portfolio/portfolio-[random]`).
- **Granular Consent:** Students choose explicitly which fields to expose:
  - Full Name
  - University & Department
  - Career Goal
  - Verified Competencies only
- **Instant Revocation:** Revoking a public profile immediately marks `isPublic = false` and `revokedAt = NOW()`, causing all subsequent requests to return HTTP 404.
- **Search Engine Indexing Prevention:** Public portfolio routes set `X-Robots-Tag: noindex, nofollow`.

---

## 4. HTTP Headers & OWASP Mitigations
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- SQL Injection mitigation through Prisma ORM parameterized queries.

---

## 5. Security Audit Logging
Sensitive operations automatically write structured entries to the `AuditLog` table:
- `USER_LOGIN`
- `USER_REGISTER`
- `MISSION_SUBMITTED`
- `CREDENTIAL_ISSUED`
- `PUBLIC_PROFILE_PUBLISHED`
- `PUBLIC_PROFILE_REVOKED`
- `JOB_POSTED`
- `ORGANIZATION_VERIFIED`
