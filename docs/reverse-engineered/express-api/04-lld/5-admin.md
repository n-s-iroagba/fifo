# 5. System Admin & Notifications LLD

## Interfaces Exposed
- **GET /health**, **GET /health/crons**, **GET /api/admin/health**
- **GET /api/notifications**, **PUT /api/notifications/mark-all-read**, **PUT /api/notifications/:id/read**
- Various Admin routes spanning Applications, Jobs, Users, and Psychometrics.

## Interfaces Consumed
- Almost all service repositories.
- `nodemailer` for outgoing emails/push notifications.

## Data Structures
- Notification schema (`userId`, `message`, `read` boolean, `type`).

## Algorithms / Business Logic
- **Admin Overrides:** Bypasses normal business validations to force stage completions, send custom mail, or edit user wallets.
- **Notification Dispatch:** Saves DB notification record and optionally dispatches SMTP email.

## State Machine
- Notification: `Unread` -> `Read`.

## Error Handling
- Enforces HTTP 403 if `requireRole(['ADMIN'])` fails.

## Open Questions
- Are notifications real-time (WebSockets) or polling-based?
