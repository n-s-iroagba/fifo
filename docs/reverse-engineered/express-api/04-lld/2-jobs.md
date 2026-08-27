# 2. Jobs & Recruitment Pipeline LLD

## Interfaces Exposed
- **GET /api/jobs**, **GET /api/jobs/:id**
- **GET /api/dashboard**
- **POST /api/applications**, **GET /api/applications**, **GET /api/applications/:id**
- **POST /api/applications/:id/advance**, **POST /api/applications/:id/visa-sponsorship**
- **GET /api/cv**, **POST /api/cv**, **PUT /api/cv**, **DELETE /api/cv**
- **GET /api/psychometric/status**, **GET /api/psychometric/module/:module/questions**, **POST /api/psychometric/module/:module/submit**
- **POST /api/interests**, **PUT /api/interests/me**, **GET /api/interests/me**

## Interfaces Consumed
- Database: Job, Application, Cv, Interest, Psychometric models.
- Auth Context: Requires `APPLICANT` role for most routes.
- Email utility for application confirmations.

## Data Structures
- Application state (stages: Submitted, Under Review, etc.).
- CV metadata (file paths, parsing results).

## Algorithms / Business Logic
- **Application Submission:** Validates prerequisites (CV, biodata), creates Application record, sets initial stage.
- **Stage Progression:** Moves applicant from stage N to N+1, often requiring admin approval unless automated via cron.

## State Machine
- Application states transition sequentially (e.g., Draft -> Submitted -> Screened -> Psychometric -> Nominated).

## Error Handling
- Standard HTTP 400s for missing prerequisites.
- HTTP 403 for attempting to advance without authorization.

## Open Questions
- What exact parsing logic is used in `utils/cvScreening.ts`? Is it just keyword matching or an external AI service?
