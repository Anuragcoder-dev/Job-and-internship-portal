# SkillConnect — Smart Job & Internship Portal

A full-stack job and internship portal connecting **students**, **recruiters**, and **administrators**,
built with **React, Node.js, Express, and MySQL**. The platform's core differentiator is a
**reusable, deterministic skill-matching engine** that scores every job against a student's profile
(no machine learning — a transparent, explainable weighted-overlap algorithm).

Built as a Master's/MCA-level full-stack web development portfolio project.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Tailwind CSS, Axios, Recharts, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MySQL 8 (via `mysql2/promise`) |
| Auth | JWT + bcrypt, role-based authorization |
| File uploads | Multer (resumes: PDF/DOC/DOCX, logos: images) |
| Validation | express-validator |
| Tooling | Git, GitHub, VS Code, Postman, npm |

No Java, Spring Boot, JSP, Servlets, or MongoDB are used anywhere in this project.

---

## 2. Project Structure

```
SkillConnect/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # common, jobs, dashboard components
│   │   ├── pages/              # public, student, recruiter, admin pages
│   │   ├── layouts/            # DashboardLayout (sidebar shell)
│   │   ├── services/api.js     # axios instance + interceptors
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx / main.jsx
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # business logic per domain
│   ├── middleware/             # auth, roles, errors, uploads
│   ├── routes/                 # REST endpoints
│   ├── utils/                  # matching engine, validators, pagination, JWT
│   ├── uploads/                # resumes/ and logos/ (gitignored contents)
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql              # 16-table normalized schema
│   └── seed.sql                # sample data
│
└── README.md
```

---

## 3. Database Design (16 tables)

`users → student_profiles / recruiter_profiles → companies → jobs → job_skills`,
with `applications`, `bookmarks`, `resumes`, `education`, `experience`, `interviews`,
`notifications`, `skills`, `student_skills`, and an `admin_actions` audit log.

**Key relationships**
- `users` is the single identity table; `role` (student/recruiter/admin) drives access control.
- `student_profiles` and `recruiter_profiles` extend `users` 1:1.
- `recruiter_profiles → companies` (1 recruiter can own 1 company in this MVP).
- `companies → jobs → job_skills → skills` describes what a job needs.
- `student_profiles → student_skills → skills` describes what a student has.
- `applications` links a `student_profile` to a `job`, storing a computed `match_score` and a status enum
  (`applied → under_review → shortlisted → interview → selected/rejected`).
- `bookmarks`, `resumes`, `education`, `experience`, `interviews`, `notifications` all hang off their
  natural parent with `ON DELETE CASCADE` for referential integrity.
- `admin_actions` is an audit trail for moderation actions (disable user, verify recruiter, remove job).

**ER Diagram (description)**

```
users (1) ──< student_profiles (1) ──< student_skills >── (1) skills
users (1) ──< recruiter_profiles (1) ──< companies (1) ──< jobs ──< job_skills >── skills
student_profiles (1) ──< applications >── (1) jobs
student_profiles (1) ──< bookmarks >── (1) jobs
student_profiles (1) ──< resumes / education / experience
applications (1) ──< interviews
users (1) ──< notifications
users (1, admin) ──< admin_actions
```

Indexes are placed on all foreign keys, on `jobs.status/job_type/location/created_at`, a `FULLTEXT`
index on `jobs.title, description` for search, and unique constraints prevent duplicate applications
and duplicate bookmarks per student/job pair.

---

## 4. Smart Job Matching (No ML)

Implemented in `server/utils/matchingUtil.js`. The formula:

```
matchScore = (sum of weights of matched required skills / sum of weights of all required skills) × 100
```

Mandatory skills are weighted `1.0`, optional ("nice-to-have") skills `0.5`, so missing a
must-have skill hurts the score more than missing an optional one. This is a pure, deterministic
function — easy to explain in a viva and easy to unit test.

---

## 5. Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- npm

### Step 1 — Clone and install
```bash
git clone <your-repo-url> SkillConnect
cd SkillConnect/server && npm install
cd ../client && npm install
```

### Step 2 — Create the database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3 — Configure environment variables
```bash
cd server
cp .env.example .env
# edit .env: set DB_PASSWORD and a long random JWT_SECRET
```
```bash
cd ../client
cp .env.example .env
```

### Step 4 — Run
```bash
# terminal 1
cd server && npm run dev      # http://localhost:5000

# terminal 2
cd client && npm run dev      # http://localhost:5173
```

### Sample login credentials (from seed.sql)
> Note: the seeded password hashes are placeholders. Register fresh accounts through the UI,
> or replace the `password_hash` values in `seed.sql` with a real bcrypt hash of a known password
> before seeding, e.g. generate one with:
> `node -e "console.log(require('bcrypt').hashSync('Password@123', 10))"`

---

## 6. REST API Reference

Base URL: `/api`. All protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Authenticated |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |
| GET | `/auth/me` | Authenticated |

### Jobs
| Method | Endpoint | Access |
|---|---|---|
| GET | `/jobs?search=&skill=&company=&location=&job_type=&experience_level=&salary_min=&salary_max=&sort=&page=&limit=` | Public |
| GET | `/jobs/:id` | Public |
| GET | `/jobs/recommended/me` | Student |
| POST | `/jobs` | Recruiter |
| PUT | `/jobs/:id` | Recruiter (owner) / Admin |
| DELETE | `/jobs/:id` | Recruiter (owner) / Admin |
| PATCH | `/jobs/:id/status` | Recruiter (owner) / Admin |

### Applications
| Method | Endpoint | Access |
|---|---|---|
| POST | `/applications` | Student |
| GET | `/applications/my?status=` | Student |
| GET | `/applications/:id` | Owner student / owner recruiter / admin |
| PUT | `/applications/:id/status` | Recruiter (owner) / Admin |

### Bookmarks
| Method | Endpoint | Access |
|---|---|---|
| POST | `/bookmarks` | Student |
| GET | `/bookmarks` | Student |
| DELETE | `/bookmarks/:jobId` | Student |

### Profile
| Method | Endpoint | Access |
|---|---|---|
| GET | `/profile` | Authenticated |
| PUT | `/profile` | Authenticated |
| POST | `/profile/skills` | Student |
| DELETE | `/profile/skills/:skillId` | Student |
| POST | `/profile/education` | Student |
| POST | `/profile/experience` | Student |
| POST | `/profile/resume` (multipart, field `resume`) | Student |
| GET | `/profile/resume/:id/download` | Owner / authorized recruiter / admin |

### Recruiter
| Method | Endpoint | Access |
|---|---|---|
| POST | `/recruiter/company` | Recruiter |
| POST | `/recruiter/company/logo` (multipart, field `logo`) | Recruiter |
| GET | `/recruiter/jobs` | Recruiter |
| GET | `/recruiter/applicants?job_id=&status=` | Recruiter |
| GET | `/recruiter/applicants/:studentProfileId` | Recruiter |
| POST | `/recruiter/interviews` | Recruiter |
| GET | `/recruiter/stats` | Recruiter |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/admin/users?search=&role=&is_active=` | Admin |
| PUT | `/admin/users/:id/status` | Admin |
| GET | `/admin/recruiters` | Admin |
| PUT | `/admin/recruiters/:id/verify` | Admin |
| GET | `/admin/companies` | Admin |
| GET | `/admin/jobs` | Admin |
| DELETE | `/admin/jobs/:id` | Admin |
| GET | `/admin/applications` | Admin |
| GET | `/admin/statistics` | Admin |

### Skills & Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/skills?search=` | Public |
| POST | `/skills/resolve` | Authenticated |
| GET | `/notifications` | Authenticated |
| PUT | `/notifications/:id/read` | Authenticated |
| PUT | `/notifications/read-all` | Authenticated |

Every endpoint returns `{ success, message?, data?, pagination? }` and errors return
`{ success: false, message }` with an appropriate HTTP status code.

---

## 7. Postman Collection Structure

Import as a collection with these folders (matching the API reference above):
`Auth / Jobs / Applications / Bookmarks / Profile / Recruiter / Admin / Skills / Notifications`.
Set a collection variable `baseUrl = http://localhost:5000/api` and `token` (populated automatically
after login via a small test script: `pm.collectionVariables.set("token", pm.response.json().data.token)`).

---

## 8. Testing Checklist

- [ ] Register as student, recruiter — duplicate email is rejected
- [ ] Login with wrong password is rejected; disabled account is blocked
- [ ] Student can add skills, education, experience, and upload a resume (reject non-PDF/DOC files and >5MB)
- [ ] Recruiter can create a company profile before posting a job (blocked otherwise)
- [ ] Job search: filter by type/experience/salary/location, sort by latest/salary, paginate results
- [ ] Applying twice to the same job is rejected (unique constraint)
- [ ] Match score is calculated and stored at time of application
- [ ] Recruiter can update application status; student receives a notification
- [ ] Recruiter can schedule an interview; application status flips to "interview"
- [ ] Admin can disable/enable a user, verify a recruiter, remove a job
- [ ] Unauthorized role access to protected routes returns 403
- [ ] Expired/invalid JWT returns 401 and frontend redirects to login

---

## 9. Deployment Instructions

**Backend** (e.g. Render/Railway/EC2):
1. Provision a MySQL instance, run `schema.sql` then `seed.sql`.
2. Set environment variables from `.env.example` in the hosting dashboard.
3. `npm install && npm start` (or let the platform run this via `package.json`).

**Frontend** (e.g. Vercel/Netlify):
1. Set `VITE_API_URL` to your deployed backend's `/api` URL.
2. Build command `npm run build`, output directory `dist`.

**CORS**: update `CLIENT_URL` in the backend `.env` to your deployed frontend origin.

---

## 10. Project Workflow

1. Student/recruiter registers → JWT issued → role-based profile row auto-created.
2. Student completes profile (skills, education, experience) and uploads a resume.
3. Recruiter creates a company profile, then posts jobs with required skills (mandatory/optional).
4. Student searches/filters jobs, sees a live match-score ring on every card, applies.
5. Recruiter reviews applicants ranked by match score, downloads resumes, updates status,
   schedules interviews — student is notified at each step.
6. Admin monitors platform health: verifies recruiters, moderates jobs, disables abusive accounts.

---

## 11. Features List

Student: register/login/profile/skills/education/experience/resume upload, job search & filters &
sorting, skill-based recommendations, apply, bookmark, track application status, notifications.

Recruiter: company profile + logo, post/edit/delete/activate/deactivate jobs, view & rank applicants,
download resumes, shortlist/reject, schedule interviews, dashboard analytics.

Admin: user/recruiter/company/job/application management, recruiter verification, platform statistics,
audit log of admin actions.

---

## 12. Future Scope

- Real ML-based recommendation model (collaborative filtering) layered on top of the current
  transparent skill-matching baseline.
- Email/SMS notifications (SendGrid/Twilio) instead of in-app only.
- Dedicated `/api/skills` autocomplete UI component with debounced search (endpoint already exists).
- Refresh tokens + token blacklist for true server-side logout.
- Multi-recruiter companies and team-based job management.
- Resume parsing to auto-fill skills/experience from an uploaded PDF.
- Rate limiting and audit logging on all admin-sensitive endpoints.

---

## 13. Common Viva Questions & Answers

**Q: Why MySQL instead of MongoDB for a job portal?**
A: The domain is highly relational — users, profiles, companies, jobs, skills, and applications
have well-defined foreign-key relationships and need transactional integrity (e.g. an application
must reference a valid job and student). A normalized relational schema with foreign keys and
unique constraints enforces this at the database level, which a document store doesn't do natively.

**Q: How does the matching algorithm work, and why not use ML?**
A: It's a weighted overlap: `earned weight of matched required skills ÷ total weight of required
skills × 100`, where mandatory skills count double an optional skill's weight. It's deterministic,
explainable, and doesn't require training data — appropriate for a bootstrapped platform with
limited historical hiring data. See `server/utils/matchingUtil.js`.

**Q: How is authentication and authorization handled?**
A: Passwords are hashed with bcrypt before storage. On login, a JWT is issued containing the
user's id, role, and email, signed with a server-side secret. `authMiddleware.protect` verifies
the token on every protected request; `roleMiddleware.authorize(...roles)` then checks the
decoded role against an allow-list per route.

**Q: How do you prevent SQL injection?**
A: All queries use `mysql2`'s parameterized queries (`?` placeholders) — user input is never
concatenated into SQL strings.

**Q: How do you handle file uploads securely?**
A: Multer validates both file extension and MIME-adjacent extension checks and enforces a size
limit before writing to disk. Filenames are regenerated with a timestamp + random hex string so
the original filename (and any path traversal attempt) never reaches the filesystem.

**Q: What happens if a recruiter tries to update someone else's job?**
A: The controller loads the job's `posted_by` and compares it to `req.user.id`; a mismatch (unless
the requester is an admin) throws a 403 `AppError` before any write happens.

**Q: How is pagination implemented?**
A: `getPagination()` sanitizes `page`/`limit` query params (bounded by a max), computes `OFFSET`,
and every listing endpoint returns a `pagination` object (`page, limit, totalItems, totalPages`)
alongside the row data, computed from a parallel `COUNT(*)` query using the same `WHERE` clause.

**Q: Why JWT instead of sessions?**
A: JWT is stateless, which suits a decoupled React SPA + REST API architecture without needing
server-side session storage, and scales horizontally without sticky sessions.

**Q: How would you scale this application?**
A: Add Redis caching for hot job listings, move file uploads to S3-compatible object storage,
introduce a read replica for MySQL, and paginate/limit all list endpoints (already done) to avoid
large payloads.

---

## 14. CV-Ready Project Description

> **SkillConnect — Smart Job & Internship Portal** (React, Node.js, Express, MySQL)
> Designed and built a full-stack job portal serving three user roles (students, recruiters,
> admins) with a 16-table normalized MySQL schema, JWT-based role authorization, and a custom
> deterministic skill-matching engine that ranks jobs by weighted skill overlap. Implemented
> server-side search/filter/sort/pagination, secure resume upload with type/size validation,
> and role-specific dashboards with live analytics (Recharts). Followed a clean MVC backend
> architecture (routes/controllers/middleware/utils) and a component-driven React frontend
> with a reusable design system built on Tailwind CSS.

---

## License
Built for academic portfolio purposes.
