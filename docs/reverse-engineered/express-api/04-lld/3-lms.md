# 3. LMS & Training (Aveling) LLD

## Interfaces Exposed
- **GET /api/courses**, **GET /api/courses/:id**, **GET /api/courses/certifications/lookup**
- **POST /api/courses**, **GET /api/courses/admin/all**, **PATCH /api/courses/:id/publish**, **POST /api/courses/bulk-import**
- **GET /api/courses/:id/modules**, **POST /api/courses/:id/modules**, **PUT /api/courses/:id/modules/:moduleId**, **DELETE /api/courses/:id/modules/:moduleId**
- **GET /api/exams/courses/:courseId/question-bank**, **POST /api/exams/courses/:courseId/questions**, **PUT /api/exams/questions/:questionId**, **DELETE /api/exams/questions/:questionId**
- **PUT /api/exams/courses/:courseId/settings**
- **GET /api/exams/attempts/:attemptId**, **POST /api/exams/attempts/start**, **POST /api/exams/attempts/:attemptId/answers**, **POST /api/exams/attempts/:attemptId/submit**, **GET /api/exams/attempts/:attemptId/result**

## Interfaces Consumed
- Database: Course, Module, ExamConfig, ExamQuestion, ExamAttempt models.

## Data Structures
- Course and Module hierarchies.
- Exam Question Banks (MCQs, text answers).
- Exam Attempt sessions (tracking score, time).

## Algorithms / Business Logic
- **Exam Attempt:** Creates a time-bounded session. On submit, evaluates answers against the Question Bank and calculates score.

## State Machine
- Exam Attempt: `Not Started` -> `In Progress` -> `Submitted` -> `Passed/Failed`.

## Error Handling
- Prevents submission of expired attempts.

## Open Questions
- How are practical assessments handled vs theoretical MCQs?
