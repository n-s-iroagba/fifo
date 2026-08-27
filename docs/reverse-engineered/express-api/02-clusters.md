# 02 - Candidate Components (Clusters)

## 1. Auth & User Management
**Responsibility:** Manages user identity, registration, session creation, RBAC roles, and LMS account linkage.
**Data Models:** `User`, `LmsCredential`, `BankAccount`
**Current Implementation:**
- `src/controllers/AuthController.ts`
- `src/services/AuthService.ts`
- `src/controllers/LmsAuthController.ts`
- `src/services/LmsAuthService.ts`
- `src/repositories/UserRepository.ts`
- `src/repositories/BankAccountRepository.ts`
- `src/middleware/auth.ts`
- `src/middleware/rbac.ts`
- `src/utils/token.ts`

## 2. Jobs & Recruitment Pipeline
**Responsibility:** Handles the end-to-end recruitment process including job listings, candidate applications, CV screening, psychometric testing, and applicant pipeline tracking.
**Data Models:** `JobListing`, `JobCategory`, `JobStage`, `Application`, `Interest`, `PsychometricAttempt`
**Current Implementation:**
- `src/controllers/JobController.ts`
- `src/services/JobService.ts`
- `src/repositories/JobRepository.ts`, `src/repositories/JobCategoryRepository.ts`, `src/repositories/JobStageRepository.ts`
- `src/controllers/ApplicationController.ts`
- `src/services/ApplicationService.ts`
- `src/repositories/ApplicationRepository.ts`
- `src/controllers/CvController.ts`
- `src/services/CvService.ts`
- `src/utils/cvScreening.ts`
- `src/controllers/InterestController.ts`
- `src/services/InterestService.ts`
- `src/controllers/PsychometricController.ts`
- `src/middleware/psychometricGuard.ts`

## 3. LMS & Training (Aveling)
**Responsibility:** Manages educational course catalogs, content modules, exam configuration, enrollments, and candidate exam attempts.
**Data Models:** `Course`, `CourseModule`, `ExamConfig`, `ExamQuestion`, `Enrollment`, `ExamAttempt`
**Current Implementation:**
- `src/controllers/CourseController.ts`
- `src/services/CourseService.ts`
- `src/controllers/ExamController.ts`
- `src/services/ExamService.ts`
- `src/controllers/ExamAttemptController.ts`
- `src/services/ExamAttemptService.ts`

## 4. Ticketing, Certifications & Sponsorship
**Responsibility:** Tracks industry certifications (tickets), manages the catalog of available tickets, and handles the lifecycle of ticket sponsorships and certificate issuance.
**Data Models:** `Ticket`, `TicketCatalog`, `Certificate`, `CertificationType`
**Current Implementation:**
- `src/controllers/TicketController.ts`
- `src/services/TicketService.ts`
- `src/controllers/TicketCatalogController.ts`
- `src/controllers/CertificateController.ts`
- `src/services/CertificateService.ts`

## 5. System Admin & Notifications
**Responsibility:** Provides backoffice administrative controls, dashboard metrics, and handles the delivery of system notifications and emails.
**Data Models:** `Notification`
**Current Implementation:**
- `src/controllers/AdminController.ts`
- `src/services/AdminService.ts`
- `src/controllers/NotificationController.ts`
- `src/services/NotificationService.ts`
- `src/repositories/NotificationRepository.ts`
- `src/utils/email.ts`

## 6. Financials & Agreements
**Responsibility:** Tracks financial transactions, invoices, receipts, and contractual agreements (such as employment contracts and nominations).
**Data Models:** `Contract`, `Invoice`, `Receipt`, `Nomination`
**Current Implementation:**
- These models exist but lack dedicated controllers/services; their logic appears embedded across cron jobs (e.g. `contractCron.ts`, `nominationCron.ts`), application progression, or admin functionalities.

## 7. Background Jobs (Cron)
**Responsibility:** Executes periodic state updates, reminder emails, and status transitions for various entities across the platform.
**Data Models:** (Touches various models globally)
**Current Implementation:**
- `src/controllers/CronController.ts`
- `src/cron/applicationCron.ts`
- `src/cron/avelingCron.ts`
- `src/cron/contractCron.ts`
- `src/cron/nominationCron.ts`
- `src/cron/psychometricCron.ts`
- `src/cron/sponsorshipCron.ts`
- `src/cron/cronRegistry.ts`

---
## Structural Drift Observations
- **Data vs Logic Isolation:** Financial and agreement models (`Contract`, `Invoice`, `Receipt`, `Nomination`) do not have dedicated controllers or service modules, implying their lifecycle logic is distributed elsewhere (likely within application progression or cron jobs).
- **Controller/Service mismatch:** `PsychometricController` and `TicketCatalogController` exist without corresponding dedicated service implementations, indicating their logic is either inline in the controllers or relies on other services.
- **Background Jobs as an Entry Point:** `CronController` is essentially a separate entry point simulating event-driven processing (via QStash), operating cross-contextually across all domain boundaries rather than using specialized use-case services.
