# AGENTS.md

## Project Overview

A platform serving FIFO (fly-in-fly-out) workers, made up of two linked front-ends on **one shared backend**:

1. **Recruitment Portal** — where applicants apply for FIFO roles. **Already built.**
2. **LMS / Training Portal** — the affiliated training agency's site: course delivery, exams, and certificate/ticket issuance. **Currently being integrated.**

The two are operationally distinct (recruitment agency vs. training agency) but share one backend and database so applicant/learner data flows between them without duplication or manual re-entry.

## Core Workflow

1. Applicant submits an ATS-compliant CV on the Recruitment Portal.
2. CV is parsed into structured data; support staff review it against role certification requirements.
3. Admin manually flags which certifications/tickets the applicant is missing or has expired (role requirements vary too much to fully automate this check).
4. Applicant is referred/redirected into the LMS with their gap list already attached to their profile — no re-entering data.
5. Applicant browses only the courses mapped to their gaps, each labeled **Theory**, **Practical**, or **Mixed**.
6. Applicant selects and pays for the course(s) they need (admin can apply a partial/full fee subsidy; applicant is notified when subsidized).
7. Applicant completes the theory content (if any) and/or books a practical session (if any). For Mixed courses, theory must be completed before the practical session can be booked.
8. Applicant takes the theory exam (auto-scored) and/or is assessed in person for the practical component.
9. On passing all required components, a certificate/ticket is issued, the applicant's certification status updates from Missing to Valid, and the result is pushed to both the applicant and the recruiter.
10. Recruiter's dashboard reflects the updated certification status immediately, without manual follow-up between the two agencies.

## Data Model (Core Entities)

- **Applicants/Learners** — identity, parsed CV data, certification status per cert type (Missing / Expired / Valid), linked application(s) and enrollment(s).
- **Certification Requirements** — maps a job role to the certs/tickets it requires. Admin-configurable, not hardcoded.
- **Courses** — name, format (Theory / Practical / Mixed), which certification it satisfies, price, capacity (for practical sessions), publish status.
- **Course Content** — theory materials attached to a course.
- **Exam Question Bank** — theory questions, correct answers, weighting, pass threshold, per course.
- **Practical Assessment Criteria** — pass/fail checklist instructors use for practical sessions, per course.
- **Enrollments** — learner ↔ course, payment status, subsidy amount (if any).
- **Exam Attempts** — learner, course, score, pass/fail, timestamp, attempt number (for retake policy).
- **Practical Sessions** — scheduled slots, booked learners, instructor, attendance/pass-fail outcome.
- **Certificates/Tickets** — issued record once all required components for a cert are passed.

## Feature Reference

The authoritative feature list (modules: Course & Exam Content Management, Certification Gap Tracking, Course Catalog & Enrollment, Payments & Subsidies, Learning Delivery, Practical Training Scheduling, Examinations, Results & Certification Issuance, Notifications) is maintained in `FEATURE_LIST.md`. Treat it as the source of truth for scope — new work on the LMS integration should map back to a feature ID there, and new features discovered during integration should be added to it rather than left implicit in code.

## Current Focus

Recruitment Portal is built. Active work is integrating the LMS/Training Portal against the shared backend: course/exam content management (admin seeding), the gap-to-course referral handoff, payment + subsidy flow, exam auto-scoring, and the certificate-issuance sync back to the recruiter's dashboard.

## Conventions & Notes for Agents

- Certification gaps are **admin-assigned per learner**, not auto-derived — don't build logic that infers gaps purely from CV parsing without an admin review step.
- Course format (Theory / Practical / Mixed) determines which sub-flows apply — don't assume every course has both a theory exam and a practical session.
- Mixed courses enforce a **sequence gate**: practical booking is blocked until theory is marked complete.
- Subsidies are per-learner, per-course, admin-applied, and must trigger a visible notification to the learner — a silent subsidy defeats its purpose.
- Recruiter-facing certification status must update automatically when a certificate is issued — no manual sync step between the two portals.
