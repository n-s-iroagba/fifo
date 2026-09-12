# FIFO Platform — Project Knowledge Base
**Conversation ID:** `69dcc096-2d20-4108-b511-dc15d960aa94`
**Saved:** 2026-09-12  
**Workspace:** `/home/udorakpuenyi/fifo`

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Full Name** | FIFO Recruitment, Training & Sponsorship Platform |
| **Brand** | BlueCollar Recruitment + Aveling LMS |
| **Version** | Server v1.0.1 · Client v0.1.1 |
| **Deployment** | Fly.io (server) · Vercel/Next.js (client) |
| **Domain** | `bluecollarrecruitment.co` (client) · `aveling.online` (LMS) |
| **DB** | MySQL via Sequelize ORM |
| **Auth** | JWT (HttpOnly cookies) + bcrypt |

---

## 2. Purpose / Business Domain

The platform manages the **end-to-end mobilization pipeline** for FIFO (Fly-In Fly-Out) workers, primarily foreign candidates seeking employment and sponsorship to work in Australia. It replaces a manual, email-driven recruitment process with a structured, portal-based state machine.

**Pipeline sequence (strictly linear — each stage must complete before the next):**

```
Application → Nomination → Ticket/Sponsorship → Contract → Payment/Invoice → Training (Aveling LMS)
```

**Key business rules:**
- **65% (company) / 35% (candidate)** cost-sharing model (configurable via `subsidyPercentage` on User, default 70%)
- Payment in **USDT on TRC-20 Tron network**
- Psychometric assessment limited to **2 attempts per module** (Module 2 is admin-reviewed; Module 1 auto-passes at grade)
- Ticket course exams: **2 attempts max** — 2nd attempt auto-passes at pass mark if first was genuine fail
- 3 invoice types payable to **Aveling**, 1 for **Blue Collar** (visa)

---

## 3. Monorepo Structure

```
/home/udorakpuenyi/fifo/
├── client/          # Next.js 16 frontend (React 19, TailwindCSS 4)
├── server/          # Express 5 + TypeScript backend API
├── aveling/         # Aveling-specific sub-project
├── FIFO.md          # Full ConOps / Concept of Operations document
├── BCR-FIFO-*.md    # Candidate sponsorship agreement templates
├── email_list.md    # Candidate email registry
├── file_tree_map.md # Full project file tree map
└── prompt-*.md      # AI prompt files for server/client
```

---

## 4. Backend — Server (`/server`)

### Tech Stack
- **Runtime:** Node.js + TypeScript (`ts-node` dev / compiled JS prod)
- **Framework:** Express 5
- **ORM:** Sequelize 6 + MySQL2
- **Email:** Nodemailer (3 SMTP transports — see §7)
- **File uploads:** Multer + Cloudinary
- **Background jobs:** Upstash QStash (webhook-based cron)
- **Security:** Helmet, express-rate-limit, CORS whitelist
- **Push notifications:** VAPID / web-push
- **Validation:** Zod
- **Document generation:** Mammoth (`.docx` → HTML)
- **PDF:** jsPDF (client-side)

### Key Directories

| Path | Purpose |
|---|---|
| `src/controllers/` | 16 controller files — request handlers |
| `src/services/` | Business logic layer (13 service files) |
| `src/models/` | 25 Sequelize models |
| `src/routes/apiRoutes.ts` | Single routing file for all API routes |
| `src/cron/` | 7 cron job files (QStash-triggered) |
| `src/data/` | Seeded training data — job listings, LMS modules, exam questions |
| `src/utils/email.ts` | Centralized email utility (all email functions) |
| `src/middleware/` | Auth guard, error handler |
| `src/config/` | DB connection config |
| `src/assets/` | Static assets (logos, templates) |

### Controllers

| Controller | Domain |
|---|---|
| `AuthController` | Register, login, verify email, reset password |
| `AdminController` | Admin dashboard, applicant management |
| `ApplicationController` | Job applications, psychometric, CV |
| `TicketController` | Ticket uploads, sponsorship |
| `JobController` | Job listings, categories |
| `PsychometricController` | Psychometric module 1 & 2 |
| `InterestController` | Expression of Interest |
| `CourseController` | LMS ticket courses |
| `ExamAttemptController` | Exam submission & grading |
| `CronController` | QStash webhook endpoints |
| `LmsAuthController` | Aveling LMS auth integration |
| `CvController` | CV upload |
| `NotificationController` | Push notification management |
| `CertificateController` | Training certificates |
| `ExamController` | Exam config & questions |
| `TicketCatalogController` | Ticket catalog (admin seeding) |

### Services (Business Logic)

| Service | Notes |
|---|---|
| `TicketService.ts` | Largest file (84KB) — full ticket + sponsorship logic |
| `ApplicationService.ts` | 30KB — full application pipeline |
| `AuthService.ts` | Auth + JWT token management |
| `AdminService.ts` | Admin operations |
| `ExamAttemptService.ts` | Grading logic, 2-attempt rule |
| `LmsAuthService.ts` | Aveling LMS credential management |

### Cron Jobs (QStash Webhooks)

All crons are triggered via POST to `/api/cron/*` authenticated with QStash signatures.

| Cron | Trigger | Action |
|---|---|---|
| `applicationCron` | 6 hrs after submission | Auto-accept application, send accepted email |
| `nominationCron` | After nomination approved | Trigger ticket/sponsorship email (1 hr delay) |
| `sponsorshipCron` | 2 hrs after sponsorship submission | Auto-approve sponsorship |
| `contractCron` | 3 hrs after contract upload | Auto-approve contract |
| `avelingCron` | Various Aveling LMS triggers | Aveling course notifications |
| `psychometricCron` | Psychometric review | Psychometric state updates |

---

## 5. Database Models (Sequelize / MySQL)

### Core Models

| Model | Key Fields |
|---|---|
| `User` | id, fullName, email, role (admin/applicant), subsidyPercentage (default 70), walletBalance, candidateNumber, avelingUsername/Password, depositPaid, fullBalancePaid, psychometricModule1/2Passed |
| `Application` | userId, jobId, status (stages tracked via JobStage) |
| `JobStage` | applicationId, name (Application/Nomination/TicketSponsorship/Contract), status |
| `Nomination` | applicationId, company, role, vacancies, status, signedDocUrl |
| `Contract` | applicationId, userId, status, signedPage1Url, signedPage15Url |
| `Ticket` | userId, applicationId, catalogId, isPossessed, hasSponsorshipApplied, isApproved |
| `TicketCatalog` | name, description — the master list of ticket types |
| `Invoice` | applicantId, type (partial/complete-after-partial/complete/shipping/visa), amount, walletAddress |
| `Receipt` | invoiceId, amountPaid, generatedAt |
| `JobListing` | title, description, categoryId — linked to TicketCatalog (M:M) |
| `JobCategory` | name |
| `Interest` | userId — Expression of Interest |
| `LmsCredential` | userId, avelingUsername, avelingPassword |
| `Course` | certificationTypeId, title, description |
| `CourseModule` | courseId, title, content |
| `ExamConfig` | courseId, passMark, timeLimit |
| `ExamQuestion` | courseId, question, options (JSON), correctAnswer |
| `ExamAttempt` | userId, courseId, score, passed, attemptNumber |
| `PsychometricAttempt` | userId, module (1/2), score, status |
| `Certificate` | userId, certificationTypeId, issuedAt |
| `Notification` | userId, title, body, isRead |
| `BankAccount` | userId, bankName, accountNumber, accountName |
| `Enrollment` | userId, courseId, enrolledAt |

### Key Relationships

- `User` → hasMany: Application, Ticket, Contract, Invoice, Notification, LmsCredential (1), Enrollment, ExamAttempt
- `Application` → hasMany: JobStage, Nomination, Contract, Ticket
- `JobListing` ↔ `TicketCatalog` (M:M via `job_ticket_requirements`)
- `Invoice` → hasOne: Receipt

---

## 6. Frontend — Client (`/client`)

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TailwindCSS 4
- **Components:** Radix UI primitives (Dialog, Select, Toast, Progress, etc.)
- **Data fetching:** TanStack Query (React Query v5)
- **Tables:** TanStack Table v8
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios
- **Document generation:** `docx` + `file-saver`, jsPDF + jspdf-autotable
- **Rich text:** Quill editor
- **PWA:** `@ducanh2912/next-pwa`
- **E2E Testing:** Cypress

### Client Routes (App Directory)

```
app/
├── page.tsx              # Public landing / marketing page
├── layout.tsx            # Root layout
├── about/
├── compliance/
├── dashboard/            # Candidate dashboard
├── document/
├── expression-of-interest/
├── forgot-password/
├── jobs/                 # Public job listings
├── login/
├── register/
├── reset-password/
├── verify-email/
├── privacy/
├── terms/
├── support/
└── admin/                # Admin dashboard
    ├── page.tsx          # Admin overview
    ├── layout.tsx
    ├── applicants/       # Candidate management
    ├── applications/
    ├── bank-accounts/
    ├── categories/
    ├── contracts/
    ├── health/           # System health dashboard
    ├── interests/        # EOI management
    ├── invoices/         # Invoice generation
    ├── jobs/
    ├── mail/             # Admin email dispatch
    ├── nominations/
    ├── psychometric/     # Psychometric review
    ├── receipts/
    ├── security/
    ├── settings/
    ├── sponsorships/
    └── tickets/
```

---

## 7. Email System (`server/src/utils/email.ts`)

Three SMTP transports:
- **`authTransporter`** — `SMTP_AUTH_USER/PASS` → donotreply@ (auth emails)
- **`infoTransporter`** — `SMTP_INFO_USER/PASS` → info@ (all candidate comms)
- **`avelingTransporter`** — Aveling LMS credentials (currently routes via infoTransporter)

All emails use branded HTML template via `getStandardEmailTemplate()`:
- BlueCollar theme: `#0b3486` dark blue header
- Aveling theme: `#FFC700` yellow header with Aveling logo

**Admin BCC notification:** Every dispatched email triggers a silent log email to `nnamdisolomon1@gmail.com`.

### Email Functions (exported)

| Function | Trigger |
|---|---|
| `sendVerificationEmail` | Registration |
| `sendWelcomeApplicationFoundEmail` | Sign-in with active app |
| `sendEOIReceivedEmail` | Expression of Interest submitted |
| `sendCVUploadEmail` | CV uploaded |
| `sendBioReceivedEmail` | Bio/profile updated |
| `sendPsychoMod1PassedEmail` | Psychometric Module 1 pass |
| `sendPsychoMod2SubmittedEmail` | Psychometric Module 2 submitted |
| `sendPsychoMod2PassedEmail` | Psychometric Module 2 approved |
| `sendApplicationSubmittedEmail` | Application under review |
| `sendApplicationAcceptedEmail` | Application accepted (6hr cron) |
| `sendHowToExpressInterestEmail` | No matching job found |
| `sendNominationApprovedEmail` | Nomination approved by admin |
| `sendTicketSponsorshipApplicationMail` | 1hr after nomination → action required |
| `sendSponsorshipReviewConfirmationMail` | Sponsorship application received |
| `sendTicketSponsorshipApprovalMail` | Sponsorship approved (2hr cron) |
| `sendContractApprovedEmail` | Contract approved (3hr cron) |
| `sendAvelingCredentialsEmail` | Aveling LMS credentials generated |
| `sendTicketCourseSubmittedEmail` | Exam submitted |
| `sendTicketCourseFailedEmail` | Exam failed |
| `sendTicketCoursePassedEmail` | Exam passed |
| `sendInvoiceEmail` | Invoice generation (5 types) |
| `sendReceiptEmail` | Receipt generation |

---

## 8. Training Ticket System

**15 ticket types** (courses) with corresponding modules and exam questions seeded into the DB:

| Course | Module File | Questions File |
|---|---|---|
| Articulated Haul Truck | articulatedHaulTruckModules.ts | articulatedHaulTruckQuestions.ts |
| Commercial Cookery | commercialCookeryModules.ts | commercialCookeryQuestions.ts |
| Confined Space | confinedSpaceModules.ts | confinedSpaceQuestions.ts |
| Driver's Licence | driversLicenceModules.ts | driversLicenceQuestions.ts |
| EEHA | eehaModules.ts | eehaQuestions.ts |
| First Aid | firstAidModules.ts | firstAidQuestions.ts |
| Food Safety | foodSafetyModules.ts | foodSafetyQuestions.ts |
| Forklift | forkliftModules.ts | forkliftQuestions.ts |
| Gas Test | gasTestModules.ts | gasTestQuestions.ts |
| Police Clearance | policeClearanceModules.ts | policeClearanceQuestions.ts |
| Rigid Haul Truck | rigidHaulTruckModules.ts | rigidHaulTruckQuestions.ts |
| RSA | rsaModules.ts | rsaQuestions.ts |
| STD11 | std11Modules.ts | std11Questions.ts |
| White Card | whiteCardModules.ts | whiteCardQuestions.ts |
| Working at Heights | workingAtHeightsModules.ts | workingAtHeightsQuestions.ts |

**Invoice-gated access:**
- Aveling partial invoice → access to first 3 ticket courses only
- Complete-after-partial or complete invoice → all 15 courses

---

## 9. Operational Pipeline — State Machine Summary

### Stage Names & Statuses

| Stage Name | Statuses |
|---|---|
| Application | Not Started, Bio Updated, Psychometric Test Module 1 passed, Psychometric Test Module 2 under-review, Psychometric Test Module 2 passed/failed, Cv uploaded, under-review, Accepted |
| Nomination | on-going, under-review, completed, rejected |
| TicketSponsorship | under-review, approved |
| Contract | ongoing, under-review, completed |

### Cron Timing Summary

| Event | Delay |
|---|---|
| Application submitted → accepted | 6 hours |
| Nomination approved → ticket/sponsorship email | 1 hour |
| Sponsorship submitted → approved | 2 hours |
| Contract uploaded → approved | 3 hours |

---

## 10. Key Environment Variables

```env
# Database
DB_HOST, DB_PORT=3306, DB_USER, DB_PASSWORD, DB_NAME

# App
PORT=5000, NODE_ENV, JWT_SECRET, CLIENT_URL, AVELING_URL, CORS_ORIGINS

# SMTP Auth Channel
SMTP_HOST, SMTP_PORT=465, SMTP_SECURE=true
SMTP_AUTH_USER, SMTP_AUTH_PASS, SMTP_AUTH_FROM

# SMTP Info Channel
SMTP_INFO_USER, SMTP_INFO_PASS, SMTP_INFO_FROM

# Push (VAPID)
VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

# Cloudinary
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# QStash (cron auth)
QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
```

---

## 11. Notable Architecture Decisions

1. **QStash over node-cron:** Cron jobs use Upstash QStash webhooks rather than in-process schedulers — this makes delayed state transitions resilient across server restarts and deployments.
2. **Three SMTP transporters:** Auth (donotreply), Info (BlueCollar general), and Aveling (LMS) are kept completely decoupled for branding and deliverability.
3. **Admin BCC logging:** Every outgoing email silently notifies `nnamdisolomon1@gmail.com` with recipient, subject, and timestamp.
4. **USDT TRC-20 payments:** All financial transactions are in USDT on the Tron TRC-20 network — no fiat payment gateway.
5. **Subsidy model:** `subsidyPercentage` on User model defaults to 70, overridable per candidate by admin before invoicing.
6. **Strict linear pipeline:** Stage preconditions are enforced server-side — downstream stages cannot be triggered until upstream stages are `completed`.
7. **2-attempt exam rule:** First attempt is genuinely graded; if failed, the second attempt is auto-passed at the pass mark as a safety net.

---

## 12. Quick File Reference

| Task | File |
|---|---|
| Send any email | [`server/src/utils/email.ts`](file:///home/udorakpuenyi/fifo/server/src/utils/email.ts) |
| All API routes | [`server/src/routes/apiRoutes.ts`](file:///home/udorakpuenyi/fifo/server/src/routes/apiRoutes.ts) |
| App middleware / CORS setup | [`server/src/app.ts`](file:///home/udorakpuenyi/fifo/server/src/app.ts) |
| DB models & associations | [`server/src/models/index.ts`](file:///home/udorakpuenyi/fifo/server/src/models/index.ts) |
| User model | [`server/src/models/User.ts`](file:///home/udorakpuenyi/fifo/server/src/models/User.ts) |
| Ticket service (core business logic) | [`server/src/services/TicketService.ts`](file:///home/udorakpuenyi/fifo/server/src/services/TicketService.ts) |
| Application service | [`server/src/services/ApplicationService.ts`](file:///home/udorakpuenyi/fifo/server/src/services/ApplicationService.ts) |
| Cron endpoints | [`server/src/controllers/CronController.ts`](file:///home/udorakpuenyi/fifo/server/src/controllers/CronController.ts) |
| Admin controller | [`server/src/controllers/AdminController.ts`](file:///home/udorakpuenyi/fifo/server/src/controllers/AdminController.ts) |
| DB seed (initial data) | [`server/src/seedDatabase.ts`](file:///home/udorakpuenyi/fifo/server/src/seedDatabase.ts) |
| Full ConOps spec | [`FIFO.md`](file:///home/udorakpuenyi/fifo/FIFO.md) |
| Admin email page | [`client/app/admin/mail/page.tsx`](file:///home/udorakpuenyi/fifo/client/app/admin/mail/page.tsx) |
| Admin dashboard overview | [`client/app/admin/page.tsx`](file:///home/udorakpuenyi/fifo/client/app/admin/page.tsx) |
| Public landing page | [`client/app/page.tsx`](file:///home/udorakpuenyi/fifo/client/app/page.tsx) |
