# SkillRoute AI 2.0 — REST API Documentation

All API routes are implemented using Next.js App Router route handlers with JSON payloads, session cookie authorization, and strict schema validation.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Description:** Authenticates user credentials and issues an HttpOnly session cookie.
- **Request Body:**
  ```json
  { "email": "student@skillroute.ai", "password": "Password123!" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { "id": "...", "email": "student@skillroute.ai", "name": "Tanzim Hasan", "role": "STUDENT" }
  }
  ```

### `POST /api/auth/register`
- **Description:** Creates a new user and sets up initial student profile or employer affiliation.
- **Request Body:**
  ```json
  {
    "name": "Nafis Fuad",
    "email": "nafis@diu.edu.bd",
    "password": "Password123!",
    "role": "STUDENT",
    "university": "Daffodil International University",
    "department": "CSE"
  }
  ```

### `POST /api/auth/logout`
- **Description:** Destroys active session in the database and clears the session cookie.

### `GET /api/auth/me`
- **Description:** Retrieves current authenticated session user and profile data.

---

## 2. Student Portal Endpoints

### `GET /api/student/profile`
- **Description:** Retrieves self-reported skill ratings, study availability, and all 5 ranked career matches.

### `POST /api/student/profile`
- **Description:** Updates self-reported skills, weekly study hours, or active career goal. Automatically marks modified skills for reassessment.

### `GET /api/student/diagnostic`
- **Description:** Returns diagnostic question bank and current assessment completion status.

### `POST /api/student/diagnostic`
- **Description:** Submits diagnostic answers, deterministically grades them, and saves evidence records.

### `GET /api/student/roadmap`
- **Description:** Retrieves the student's persistent 4-week starter roadmap with checkpoints and completed activity statuses.

### `POST /api/student/roadmap`
- **Description:** Toggles activity completion or recalculates roadmap when availability or skills change.

### `GET /api/student/study-session` & `POST /api/student/study-session`
- **Description:** Retrieves study progress metrics (total hours, streaks) and logs new study sessions.

---

## 3. Mission Arena Practical Assessment Endpoints

### `GET /api/missions`
- **Description:** Lists all available practical challenges across the 5 career pathways with user high scores.

### `GET /api/missions/[id]`
- **Description:** Fetches challenge details, scenario, rubric, and initial boilerplate code.

### `POST /api/missions/[id]/submit`
- **Description:** Server-side evaluation of practical code or analysis report. If score >= 75%, issues verified credential.
- **Request Body:**
  ```json
  {
    "submission": "SELECT ...",
    "mode": "INDEPENDENT",
    "aiNotes": "",
    "blurredCount": 0,
    "timeSpentSeconds": 850
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "evaluation": {
      "totalScore": 100,
      "passed": true,
      "passingScore": 75,
      "detailedResults": [ ... ]
    },
    "issuedCredential": { ... }
  }
  ```

---

## 4. Credentials & Public Portfolios

### `GET /api/credentials`
- **Description:** Returns all verified credentials earned by the current student.

### `GET /api/credentials/[credentialId]`
- **Description:** Public verification endpoint. Returns recipient name, competency title, score, issuance date, and active/revoked status.

### `GET /api/public-profiles` & `POST /api/public-profiles`
- **Description:** Publish, update privacy consent fields, or immediately revoke a public portfolio link.

### `GET /api/public-profiles/[publicId]`
- **Description:** Read-only public portfolio display. Returns strictly consented fields. Returns 404 if revoked.

---

## 5. Employer Portal Endpoints

### `GET /api/employer/jobs` & `POST /api/employer/jobs`
- **Description:** List active job vacancies and publish new job requirements with competency levels.

### `GET /api/employer/candidates`
- **Description:** Query candidates with explainable filtering by career track, demonstrated skills, and mission outcomes.

### `GET /api/employer/shortlist` & `POST /api/employer/shortlist`
- **Description:** Manage candidate shortlist and recruitment status progression (`REVIEWING` -> `SHORTLISTED` -> `INTERVIEWING` -> `OFFERED`).

---

## 6. Administration Endpoints

### `GET /api/admin/users`
- **Description:** Lists user accounts, roles, and credential counts.

### `GET /api/admin/orgs` & `POST /api/admin/orgs`
- **Description:** Review employer organizations and manage verification badges.

### `GET /api/admin/audit`
- **Description:** Inspect tamper-resistant security audit logs and platform KPIs.
