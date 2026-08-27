# Observations and Technical Debt

## 1. Unsecured Admin Registration Route
**Where:** `src/controllers/AuthController.ts` -> `registerAdmin`
**What:** The route `POST /api/auth/register-admin` is exposed publicly without any authentication or authorization guards.
**Why it looks off:** Anyone who finds this endpoint can register as an `ADMIN` and bypass all RBAC controls on the platform.

## 2. Tight Coupling between Auth and Application Pipelines
**Where:** `src/services/AuthService.ts` -> `register` and `updateProfile`
**What:** The `AuthService` explicitly dispatches emails regarding "Stage Update" and directly calls `applicationService.updateLatestApplicationStageStatus(userId, 'Bio Updated')`.
**Why it looks off:** Authentication and User Profile management shouldn't typically be responsible for advancing job application stages. This violates bounded context principles and creates a hidden dependency between identity and recruitment logic.

## 3. Financial Models Lack Dedicated Services
**Where:** `src/models/Contract.ts`, `src/models/Invoice.ts`, `src/models/Receipt.ts` (observed from `01-inventory.md`)
**What:** These models exist but there is no `FinanceController` or `FinanceService`. Their manipulation is scattered across `AdminController`, `ApplicationController`, and `TicketController`.
**Why it looks off:** Financial transactions are typically a core domain requiring strict isolation. Spreading invoice and contract logic across other domain controllers increases the risk of inconsistent state and makes auditing difficult.

## 4. QStash Webhooks for Cron Jobs
**Where:** `src/app.ts`, `src/controllers/CronController.ts`
**What:** Instead of internal background workers (e.g. `node-cron` or `BullMQ`), scheduled tasks are triggered via external HTTP POST webhooks from Upstash QStash.
**Why it looks off:** While valid for serverless environments, this requires exposing internal system state transitions (like application auto-acceptance or contract auto-approval) to the public internet, reliant entirely on QStash signature verification for security.
