# FEATURE_LIST

<!-- 
  INSTRUCTIONS:
  - List every user-facing feature your application must support.
  - Each feature must have a unique ID, a short name, a description, and the actor(s) who use it.
  - Group features by domain/module for clarity.
  - This file is the single source of truth for SPECIFICATION_GENERATION_RULES.md.
-->

## Module: Job Application & ATS CV Management
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-032 | ATS CV Upload & Validation | User uploads a CV. System does not reject non-ATS formats but displays a toast notification recommending ATS format for better parsing. | Candidate | Job Application | Candidates must know why their parsing might fail if they don't use ATS formats. | Unaware | Informed |
| F-033 | ATS CV Template Download | Provides a button to download a standard ATS CV template and a link to Google search for "What is ATS CV format?". | Candidate | Job Application | Helps non-technical workers conform to recruitment standards, improving placement chances. | Confused | Supported |
| F-034 | Declare Possessed Tickets | When applying, candidates can enter multiple existing tickets they already possess. | Candidate | Job Application | Accurately captures candidate's baseline compliance to avoid redundant training. | Tedious | Prepared |
| F-035 | Application Status Tracking | Applications track status: Active, Withdrawn, Failed, Succeeded, Hired. | Candidate / Admin | Application Tracking | Core lifecycle of recruitment processing. | Anxious | Reassured |
| F-036 | Job Visa Sponsorship Tag | Job listings indicate via a boolean attribute whether they provide visa sponsorship. | Candidate / Admin | Job Listings | Crucial for international candidates filtering roles. | Unsure | Clear |

## Module: Ticket Sponsorship Application (Client App)
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-037 | Apply for Ticket Sponsorship | Candidate applies for ticket sponsorship for gaps identified during the job application. Requires entering bank details for future refunds. | Candidate | Ticket Application | Enables candidates without upfront capital to secure necessary compliance tickets. | Hesitant | Supported |
| F-038 | Ticket Data Tracking | Tickets linked to an application track status, type, cost, proof, deadlines, sponsorship states (applied, approved, failed, issued), and refund amounts. | System / Admin | Ticket Details | Master record of a candidate's compliance journey and financial sponsorship. | N/A | N/A |
| F-039 | Admin Ticket Management | Admin CRUD operations to manipulate ticket data, including bulk seeding tickets to candidates. | Admin | Admin Dashboard | Allows bulk operations and corrections on candidate tickets. | Overwhelmed | Efficient |
| F-040 | Admin "Include Mail" Notifications | Admin can trigger manual email notifications ("Include Mail" button) to the candidate upon any ticket data change. | Admin | Ticket Details | Maintains transparency with candidates regarding their ticket status. | N/A | N/A |
| F-041 | Sponsorship Approval Email | Upon admin approval, candidate receives an email containing a link to the Aveling LMS app to pay for the ticket, along with their Candidate Number. | System | Notifications | Bridges the gap between the recruitment portal and the Aveling training platform. | Waiting | Activated |

## Module: Aveling LMS Candidate Portal & Payments
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-042 | Sponsored Course Lookup | Candidate visits Aveling homepage, clicks "Take sponsored course", enters their Candidate Number, and views assigned ticket courses. | Candidate | Sponsored Portal | Single entry point for candidates to claim their approved training. | Lost | Directed |
| F-043 | Bank Transfer Checkout | Candidate proceeds to checkout, which displays bank account transfer details. | Candidate | Checkout | Provides a manual payment option for candidates unable to use credit cards. | Uncertain | Clear |
| F-044 | Payment Instructions Email | System emails payment instructions when the candidate navigates to the checkout page. | System | Notifications | Ensures candidates don't lose payment details if they close the browser. | N/A | N/A |
| F-045 | Payment Receipt Upload | Candidate clicks "I have made payment" and uploads their bank transfer receipt. | Candidate | Checkout | Proof of payment for manual reconciliation. | Pending | Relieved |
| F-046 | Admin Receipt Verification | Admin verifies the uploaded payment receipt and approves the course for the user, unlocking the module. | Admin | Aveling Admin | Security gate to prevent unauthorized course access before funds clear. | Cautious | Confirmed |

## Module: Course & Exam Content Management
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-024 | Create Course | Admin creates a new course record: name, description, format (Theory/Practical/Mixed), base price, and capacity. | Admin | Course Management | Foundation for the catalog. | N/A | N/A |
| F-047 | Course Materials CRUD | Admin must link specific course materials to each ticket course (Every ticket must have a course and course materials). | Admin | Course Management | Delivers the actual educational content to the learner. | N/A | N/A |
| F-048 | Exam Questions CRUD | Admin creates exam questions specifying different types: MCQ, Essay, Input Answer. | Admin | Exam Management | Robust testing methodology ensuring deep comprehension. | N/A | N/A |
| F-028 | Bulk Import Courses & Exams | Admin imports multiple courses, their content, and question banks at once. | Admin | Course Management | Faster onboarding of accreditations. | N/A | N/A |

## Module: Learning Delivery & Examinations
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-049 | Course Theory Completion Gate | Course is only marked complete after the user passes the course exams. | System | Course Player | Prevents skipping exams. | N/A | N/A |
| F-050 | Submit Exam (Review-Awaiting) | After user submits the exam, the course module status updates from "completed" to "review-awaiting". | System | Exam Portal | Accommodates manual grading for Essay/Input questions before final pass/fail. | Anxious | Waiting |
| F-051 | Exam Retake Logic | If failed (first_attempt_failed), candidate must pay the course fee again for a second attempt. | Candidate | Exam Portal | Financial consequence for failure ensures learners take study seriously. | Frustrated | Determined |
| F-052 | Ticket Issuance | Ticket is only marked as "ticket_issued" after the course is fully completed and exams passed. | System | Exam Portal | Prevents fraudulent certification. | Anticipating | Accomplished |

## Module: Wallet & Refund Management
| Feature ID | Feature Name | Description | Actor(s) | Screen | Business Justification | Current Emotions | Target Emotions |
|------------|-------------|-------------|----------|--------|------------------------|------------------|-----------------|
| F-053 | Successful First Attempt Refund | If candidate passes on the first attempt, the ticket purchase price is refunded. | System | Wallet | Rewards candidates for passing efficiently. | N/A | N/A |
| F-054 | Successful Second Attempt Refund | If candidate passes on the second attempt (after paying twice), the refund amount is purchase price * 2. | System | Wallet | Recoups all costs for the candidate upon ultimate success. | N/A | N/A |
| F-055 | Apply Refund to New Ticket | Candidate can click "Use the refund for another ticket" to sponsor a new course. The new course shows as "paid for" on Aveling. | Candidate | Wallet / Checkout | Encourages continuous upskilling and certification chaining. | Satisfied | Motivated |
| F-056 | Withdraw Refund to Bank | Candidate can click "No thanks, refund to my bank account". The refund amount is added to their internal wallet for future use or withdrawal. | Candidate | Wallet | Provides financial flexibility to the candidate. | Secure | Relieved |

## Module: LMS Access Management
| Feature ID | Name | Description | Business Justification |
|---|---|---|---|
| F-030 | Aveling Credential Generation | Admin generates separate login credentials for an applicant to access the Aveling LMS. | Ensures isolation between recruitment portal access and LMS access. |
| F-031 | Aveling Portal Login | Learner logs into the Aveling LMS using the specific credentials generated by the admin. | Enforces the separate Aveling login requirement. |
