# 4. Ticketing & Sponsorship LLD

## Interfaces Exposed
- **GET /api/tickets**, **GET /api/tickets/:id**, **POST /api/tickets**, **PUT /api/tickets/:id**
- **POST /api/tickets/:id/apply-sponsorship**, **POST /api/tickets/:id/request-retake**
- **POST /api/tickets/:id/refund-choice**, **POST /api/tickets/:id/pay-aveling**
- **POST /api/tickets/:id/exam-outcome**, **POST /api/tickets/:id/set-review-awaiting**
- **POST /api/tickets/apply-batch-sponsorship**
- **POST /api/tickets/:id/submit-receipt**
- **GET /api/certificates/learner/me**, **POST /api/certificates/issue**
- **GET /api/ticket-catalogs**, **POST /api/admin/ticket-catalogs**, **PUT /api/admin/ticket-catalogs/:id**, **DELETE /api/admin/ticket-catalogs/:id**

## Interfaces Consumed
- Database: Ticket, TicketCatalog, Certificate.
- Integration with LMS (Aveling) for exam outcomes.
- Financial records for payment validation.

## Data Structures
- Ticket Sponsorship application and status mapping.
- Certificate records mapping user to completed qualifications.

## Algorithms / Business Logic
- **Sponsorship Application:** Validates eligibility, creates ticket sponsorship record.
- **Refund Logic:** If an exam is passed, candidates can opt for a refund choice based on initial sponsorship terms.

## State Machine
- Ticket State: `Pending Sponsorship` -> `Approved` -> `Paid` -> `Training` -> `Exam Taken` -> `Completed` -> `Refunded`.

## Error Handling
- Validates payment state before allowing exam access or refunds.

## Open Questions
- Does batch sponsorship apply different discount rules compared to individual ticket sponsorship?
