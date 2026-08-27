# 7. Background Jobs (Cron) LLD

## Interfaces Exposed
- **POST /api/cron/application**
- **POST /api/cron/nomination**
- **POST /api/cron/contract**
- **POST /api/cron/sponsorship**
- **POST /api/cron/aveling**
- **POST /api/cron/psychometric**

## Interfaces Consumed
- `QStashMiddleware` (Signature verification).
- Internal domain services (e.g., ApplicationService, TicketService) to trigger batch updates.

## Data Structures
- QStash payload signature headers.

## Algorithms / Business Logic
- **Auto-Progression:** Scans for stale states (e.g., contracts unapproved for X days) and automatically advances them or sends reminder emails.
- **Admin Alerting:** Summarizes the count of processed items and emails the admin.

## State Machine
- N/A (acts as a driver for other state machines).

## Error Handling
- Returns HTTP 401 if Upstash signature validation fails.
- Logs processing errors to console but returns 500 to force QStash retry.

## Open Questions
- Is there idempotency built into these cron handlers to prevent double processing if QStash retries a failed webhook?
