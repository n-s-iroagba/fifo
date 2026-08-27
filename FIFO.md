# Concept of Operations (ConOps) Document
**System Name:** FIFO Recruitment, Training, and Sponsorship Platform
**Version:** 1.0

---

## 1. Scope

### 1.1 Identification
This Concept of Operations (ConOps) document applies to the FIFO Recruitment, Training, and Sponsorship Platform, version 1.0. 

### 1.2 Document Overview
This document defines the operational perspective of the FIFO platform, establishing the standardized workflows for candidate lifecycle management, administrative gating, fiscal sponsorship, and contractual obligations. It serves as the single source of truth for process sequencing, business logic, system track logs, and stakeholder interactions, bridging the gap between operational needs and technical implementation.

### 1.3 System Overview
The platform manages an end-to-end mobilization pipeline: `Candidate Application -> Nomination -> Psychometric/Ticket Training -> Contract Issuance -> Financial Invoicing`. It transitions recruitment from a manual coordination process to a structured, portal-based application and ticketing lifecycle. The system relies on a hybrid model of automated cron-based state transitions and manual administrative oversight.

---

## 2. Referenced Documents
*   **BCR-FIFO-2026-0810:** Candidate Sponsorship Agreement
*   **FIFO Workflow Specification:** System Track Log
*   **FIFO Platform Architecture Definition:** System topology and technical constraints
*   **Migration Regulations 1994 (Cth):** Regulation 2.87 regarding sponsorship cost-sharing compliance

---

## 3. Current System or Situation

### 3.1 Background, Objectives, and Scope
Currently, the mobilization and sponsorship of candidates rely on manual, email-dependent coordination. The objective of replacing this is to centralize candidate tracking, reduce administrative overhead, and ensure regulatory compliance through automated stage-gating.

### 3.2 Operational Policies and Constraints
Existing policies require strict adherence to state/federal guidelines regarding candidate sponsorship and cost distribution. The current lack of centralization makes auditing and enforcement difficult.

### 3.3 Description of the Current System
The "As-Is" state is highly decentralized. Document submission, psychometric evaluation, and financial invoicing are handled as isolated processes, relying on manual triggers to update candidate states. 

### 3.4 Modes of Operation
Currently operates under a single, manual-intervention mode, requiring continuous administrative oversight for every state transition.

### 3.5 User Classes and Other Involved Personnel
*   **Candidates:** End-users seeking employment and training sponsorship.
*   **Administrators:** Recruitment and mobilization coordinators.
*   **Third-Party Vendors (Invoicers):** External training (Aveling) and visa (Blue Collar) entities.

### 3.6 Support Environment
Disparate legacy spreadsheets, direct email communications, and manual document storage.

---

## 4. Justification for and Nature of Changes

### 4.1 Justification for Changes
Bottlenecks frequently occur in nomination sequencing and invoice generation. A unified system is required to enforce compliance with Australian migration and vocational standards automatically, preventing human error in the gating process.

### 4.2 Description of Desired Changes
The proposed change formalizes the transition to a structured portal. It introduces automated cron-based stage-gating, a candidate dashboard for self-service document uploading, and programmatic integration with third-party invoicers for seamless financial operations.

### 4.3 Priorities Among Changes
1.  Establishment of the Candidate Dashboard and Application Gateway.
2.  Implementation of automated state transitions and cron-driven email triggers.
3.  Integration of the financial invoicing and receipting modules.

### 4.4 Changes Considered but Not Included
Direct integration of real-time messaging platforms (e.g., chat) was excluded to maintain a formalized, asynchronous email-driven notification structure.

---

## 5. Concepts for the Proposed System

### 5.1 Background, Objectives, and Scope
The proposed system will fully digitalize the recruitment pipeline. The scope includes Application, Nomination, Ticket/Sponsorship, Contract, Invoicing, Receipting, and Training modules.

### 5.2 Operational Policies and Constraints
*   **Subsidy Model:** Business logic must strictly follow the 65% (Company) / 35% (Candidate) cost-sharing model.
*   **Data Integrity:** The Candidate Wallet ledger must remain highly accurate for tracking deposits and credits.
*   **Assessment Limits:** Training and psychometric assessment attempts are hard-capped at two (2) per module.
*   **Stage Preconditions:** The pipeline is strictly linear (`Application -> Nomination -> Ticket/Sponsorship -> Contract -> Payment/Invoice -> Training`). Each stage must reach a "Completed" status before subsequent triggers can fire.

### 5.3 Description of the Proposed System
A web-based portal facilitating asynchronous interaction. Candidates interface via a secure dashboard to submit documents and take assessments, while Administrators utilize an oversight dashboard to manage approvals, generate contracts, and issue invoices. Background cron jobs continuously monitor states to trigger emails and transitions.

### 5.4 Modes of Operation
*   **Normal (Automated) Mode:** Automated workflows, email dispatch, and state updates functioning continuously via scheduled background cron jobs.
*   **Admin Intervention Mode:** Manual override, selection for nominations, ad-hoc invoicing, and remedial action processing.

### 5.5 User Classes and Other Involved Personnel
*   **Candidate:** Interfaces with the Public Page and Candidate Dashboard.
*   **Admin:** Manages nominations, compliance approvals, and contract generation.
*   **System (Automated Agent):** Manages email notifications, cron delays, state updates, and stage-gating.
*   **Invoicer (Aveling / Blue Collar):** Financial entities triggered by specific invoice types.

### 5.6 Support Environment
Cloud-hosted web portal with persistent database storage, CRON task schedulers, and integrated SMTP services for notification dispatch.

---

## 6. Operational Scenarios (Detailed Track Log)

This section details the step-by-step system track log and workflow sequencing.

### 6.1 Job Search (Public Page) [OS-01]
*   **Steps:** 1. View job list; 2. View particular job details; 3. Click apply.
*   **Conditions:**
    *   **Found (Job exists):**
        *   *Not Signed in, Registered:* Login -> Redirect to job details page (dashboard).
        *   *Not Signed in, Not Registered:* 1. Signup; 2. Verify email redirect link to job details page (dashboard); 3. Update Stage `(name: Application, status: Not Started)`; 4. Send *Welcome Email*.
        *   *Signed in:*
            1.  **Update BIO:** 1. Update Bio; 2. Update Stage `(name: Application, status: Bio Updated)`; 3. Send *Bio Updated Mail*.
            2.  **Take Psychometric Module 1:** 1. Automatic pass at grade on submission; 2. Update Stage `(name: Application, status: Psychometric Test Module 1 passed)`; 3. Send *Psychometric Module 1 Passed Mail*.
            3.  **Take Psychometric Module 2:**
                *   *On Submit:* 1. Send *Psychometric Module 2 Pending Review Mail*; 2. Update Psychometric module 2 for candidate as under review; 3. Update Stage `(name: Application, status: Psychometric Test Module 2 under-review)`.
                *   *On Admin Approval:* 1. Update Psychometric module 2 for candidate as passed; 2. Send *Psychometric Module 2 Passed Email*; 3. Update Stage `(name: Application, status: Psychometric Test Module 2 passed)`.
                *   *On Admin Rejection:* 1. Update Psychometric module 2 for candidate as failed; 2. Send *Psychometric Module 2 Failed Email*; 3. Update Stage `(name: Application, status: Psychometric Test Module 2 failed)`.
            4.  **Upload CV:** 1. Upload CV; 2. Send *CV Uploaded Mail*; 3. Update Stage `(name: Application, status: Cv uploaded)`.
    *   **Not Found (Job does not exist):**
        *   *Not Signed in, Registered:* 1. Login; 2. Redirect to expression of interest page (dashboard); 3. Send *How to Express Interest Mail*.
        *   *Not Signed in, Not Registered:* 1. Signup; 2. Verify email redirect link to expression of interest page.

### 6.2 Job Search (Dashboard) [OS-02]
*   **Steps:** 1. View job list; 2. View particular job details; 3. Click apply.
*   **Conditions:**
    *   **Not Found (Signed in):**
        1.  *Fill Form:* 1. On submit, receive *Expression Of Interest Received Mail*.
        2.  *On Approval By Admin:* 1. Admin selects joblist and selects applicant; 2. On Admin Approve, applicant receives *Vacancy Available Mail*.
    *   **Found (Signed in):**
        1.  *Take Psychometric Module 1:* 1. Automatic pass at grade on submission; 2. Update Stage `(name: Application, status: Psychometric Test Module 1 passed)`; 3. Send *Psychometric Module 1 Passed Mail*.
        2.  *Take Psychometric Module 2:*
            *   *On Submit:* 1. Update Psychometric module 2 for candidate as under review; 2. Send *Psychometric Module 2 Pending Review Mail*; 3. Update Stage `(name: Application, status: Psychometric Test Module 2 under-review)`.
            *   *On Admin Approval:* 1. Update Psychometric module 2 for candidate as passed; 2. Update Stage `(name: Application, status: Psychometric Test Module 2 passed)`; 3. Send *Psychometric Module 2 Passed Email*.
            *   *On Admin Rejection:* 1. Update Psychometric module 2 for candidate as failed; 2. Update Stage `(name: Application, status: Psychometric Test Module 2 failed)`; 3. Send *Psychometric Module 2 Failed Email*.
        3.  *Upload CV:* 1. Upload CV; 2. Update Stage `(name: Application, status: Cv uploaded)`; 3. Send *CV Uploaded Mail*.
        4.  *Update BIO:* 1. Update Bio; 2. Update Stage `(name: Application, status: Bio Updated)`; 3. Send *Bio Updated Mail*.

### 6.3 Application Submission [OS-03]
*   **Steps:**
    1.  After completing any one of two above, user clicks button to apply for job.
    2.  Job Tickets copied as applicant tickets (gaps).
    3.  *Application Received Awaiting Review Mail* is sent.
    4.  Stage Update `(name: Application, status: under-review)`.
    5.  After 6hrs cron job:
        1.  Application is marked as Accepted `(stage.status)`.
        2.  *Application Accepted Mail* is sent.

### 6.4 Nomination [OS-04]
*   **Steps:**
    1.  Admin selects applicant from a drop down.
    2.  Admin sees the applicants applications.
    3.  Admin sees total number of applicants.
    4.  Admin enters one or more: 1. Company; 2. Role; 3. Vacancy numbers.
    5.  Admin can preview document created.
    6.  Applicant nomination tables are created in the server.
    7.  Stage Update `(name: Nomination, status: on-going)`.
    8.  A Nomination document is sent alongside a mail (*Nomination Presentation Mail*).
    9.  Applicant downloads document and signs.
    10. Applicants visit nomination page in dashboard.
    11. Applicant views their nominations.
    12. Applicant checks (check box) their selected nomination.
    13. Applicant uploads Signed nomination.
    14. Stage update `(name: Nomination, status: under-review)`.
    15. *Nomination Received and Under Review Mail* is sent.
    16. Admin evaluates nomination:
        *   **Approves:** 1. Selected nomination marked; 2. *Nomination Approved Mail* is sent; 3. Stage update `(name: Nomination, status: completed)`. Applicant view nomination as selected (no changes can be made).
        *   **Rejects:** 1. *Nomination Rejected Mail* is sent; 2. Applicant continues from step 12 - 16 above.

### 6.5 Ticket Uploads And Sponsorship Application [OS-05]
*   **Steps:**
    1.  1 hour after Nomination accepted cron mail is sent, *Ticket Uploads & Sponsorship Application Mail* is sent.
    2.  Applicant visits tickets dashboard, uploads none or more tickets and applies for sponsorship for the ones with no uploads.
    3.  Upload tickets are marked as possessed.
    4.  If no upload, sponsorship is applied.
    5.  Applicant receives *Sponsorship Application Review Confirmation Mail*.
    6.  Stage update `(name: TicketSponsorship, status: under-review)`.
    7.  Admin edits `applicant.subsidyPercentage` attribute (optional should not block step below, and should be edited on the applicants details page).
    8.  2 hours after ticket sponsorship application submission:
        1.  Cron job approves application.
        2.  *Ticket Sponsorship Approval Mail* is sent.
        3.  Stage Update `(name: TicketSponsorship, status: approved)`.

### 6.6 Contract [OS-06]
*   **Steps:**
    1.  Admin selects candidate from drop Applicant ticket gaps (tickets not possessed).
    2.  Applicants details and subsidyPercentage (visa is free), and selected nomination are used to fill in the contract template.
    3.  Admin can preview.
    4.  Mail is sent with the document (*Contract Presentation Mail*).
    5.  Stage update `(name: Contract, status: ongoing)`.
    6.  Applicants visit contract page in dashboard.
    7.  Applicant uploads Signed contract page 1 and page 15 or only page 15 (2 different upload tags).
    8.  Stage update `(name: Contract, status: under-review)`.
    9.  *Contract Received and Under Review Mail* is sent.
    10. 3 hours after upload by Cron job:
        1.  Contract marked as approved.
        2.  *Contract Approved Mail* is sent.
        3.  Stage update `(name: Contract, status: completed)`.
    11. Applicants can view their contract as approved and can still upload page 1 if required.

### 6.7 Payment Confirmation [OS-07]
*   **Steps:**
    1.  *Payment Confirmation Inquiry Mail* is sent manually by admin via template (create the template, template should be prepopulated with applicants name and details). The mail is to confirm if making half payments on their total ticket bundle or full payment at a 10% discount.

### 6.8 Invoicing [OS-08]
*   **Type:** 1. Partial; 2. Complete-after-partial; 3. Complete; 4. Shipping; 5. Visa.
*   **Steps:** 1. Select Applicant from dropdown; 2. Select type; 3. Select Wallet; 4. Preview; 5. Systems apply rules; 6. Create invoice at the server; 7. Send with email as attachment.
*   **Rules:**
    1.  **Partial:** 1. Prefill; 2. Note as partial ticket courses and certification payment; 3. Invoicer: Aveling; 4. Mail: Aveling (*Partial Invoice Mail*).
    2.  **Complete-after-partial:** 1. Prefill; 2. Note a completion of partial ticket courses and certification payment; 3. Invoicer: Aveling; 4. Mail: Aveling (*Complete-after-partial Invoice Mail*).
    3.  **Complete:** 1. Prefill; 2. Apply 10% discount; 3. Note a completion of partial ticket courses and certification payment; 4. Invoicer: Aveling; 5. Mail: Aveling (*Complete Invoice Mail*).
    4.  **Shipping:** 1. Prefill (Ticket shipping fee); 2. Invoicer: Aveling; 3. Mail: Aveling (*Shipping Invoice Mail*).
    5.  **Visa:** 1. Prefill (Visa Fee Subsidy); 2. Invoicer: Blue Collar; 3. Mail: Blue Collar (*Visa Invoice Mail*).

### 6.9 Receipt [OS-09]
*   **Steps:** 1. Fetch invoices from server; 2. Select invoice from dropdown; 3. Generate receipt; 4. Preview; 5. Create at server; 6. Send with mail as attachment (all files are sent with mail as attachment) (*Payment Receipt Mail* from the invoicer for that invoice).

### 6.10 Aveling Credentials [OS-10]
*   **Steps:** 1. Go to applicant applicants details page; 2. Create credentials automatically; 3. Save to database; 4. Send *Aveling Credentials Mail*.

### 6.11 Ticket Courses [OS-11]
*   *All Mails are sent by aveling.*
*   **Steps & Rules:**
    1.  Ticket Courses, Catalogue And Exam questions are seeded by the developer.
    2.  If aveling partial made with no complete after partial invoice paid, applicant can only take 3 ticket courses and exams.
    3.  If complete after partial payment made applicant can take all courses.
    4.  If complete payment applicant can take all ticket courses and exams.
    5.  On submit Ticket Course Exam attempt (*Submitted Mail*) is sent.
    6.  On fail Ticket Course Exam attempt (*Failed Mail*) is sent.
    7.  On pass Ticket Course Exam attempt (*Passed Mail*) is sent.
    8.  The first attempt is truly properly graded.
    9.  If candidate truly failed first attempt second attempt is automatically passed at the pass mark.

---

## 7. Summary of Impacts

### 7.1 Operational Impacts
Transitions operations from high-touch administrative processing to an exception-based management model. Administrative staff will shift focus from manual email dispatch to strategic oversight and anomaly resolution.

### 7.2 Organizational Impacts
Requires training for administrative staff on the new dashboard and familiarization with the strict sequencing of the automated state machine.

### 7.3 Impacts During Development
Data model structuring requires significant effort to support rigid, multi-state transitions. The heavy reliance on temporal cron jobs necessitates robust infrastructure and rigorous QA testing for temporal state changes.

---

## 8. Analysis of the Proposed System

### 8.1 Summary of Advantages
*   **Compliance:** Enforces Migration Regulations regarding cost sharing mathematically and systematically.
*   **Efficiency:** Reduces manual processing time by automating stage-gating and email dispatch.
*   **Traceability:** Provides a single, auditable track log for every candidate in the pipeline.

### 8.2 Summary of Disadvantages and Limitations
*   **Sequencing Dependency:** The linear nature of the state machine means a failure or delay in an early stage (e.g., Nomination) inherently bottlenecks all downstream financial and training workflows.
*   **Automation Reliance:** High dependency on cron jobs introduces the risk of silent failures if error logging and observability are not impeccably implemented.

### 8.3 Alternatives and Trade-offs Considered
Manual progression of all states was considered to provide maximum administrative control; however, this was rejected as it fails to alleviate the primary organizational bottleneck (administrative overhead) and increases the risk of compliance breaches.
