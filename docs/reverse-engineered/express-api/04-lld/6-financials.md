# 6. Financials & Agreements LLD

## Interfaces Exposed
- Embedded across `/api/admin/bank-accounts`, `/api/admin/invoices`, `/api/applications/:id/contracts`.

## Interfaces Consumed
- Database: Invoice, Contract, Receipt, BankAccount.

## Data Structures
- BankAccount config objects.
- Invoice and Contract DTOs (tracking amounts, signatures, status).

## Algorithms / Business Logic
- **Payment Verification:** Manual verification of receipts submitted against invoices. Unlocks specific ticket thresholds.
- **Contracts:** Generation of digital agreements linked to nominations. Candidates can accept or reject.

## State Machine
- Contract: `Draft` -> `Sent` -> `Accepted` / `Rejected`.
- Invoice: `Unpaid` -> `Partial` -> `Paid`.

## Error Handling
- Fails operations if wallet balance or deposit threshold is not met.

## Open Questions
- Why are there no dedicated controllers/services for these distinct domain entities?
