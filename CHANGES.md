# IMPLEMENTATION RULES

When implementing all the 'IMPLEMENTATION PROMPTS' below, adhere to the following rules on every execution.

1. Do not use useless, AI-like words in user-facing text. Use a simple corporate communication style with zero filler or buzz words.
2. Every implementation must build and maintain:
   1. Trust
   2. Clarity with zero jargon
   3. Aesthetics:
      - Use simple but clean aesthetics; do not use colours or icons where there is no need.
      - Any document or email sent from RTO must borrow its theme from [certhero.com.au](https://certhero.com.au).
      - Keep colouring simple; do not scatter colours across the UI.

---

# IMPLEMENTATION PROMPTS

Grouped by feature below. Where an instruction appears in multiple places in the original document, it is merged here. All identified conflicts (C1, C2, C3) have been resolved.

---

## FEATURE GROUP 1 — Data Models & Relationships

### 1.1 Applicant Model
- Add the following attributes:
  - `interviewDate`
  - `interviewTime`
  - `interviewLink`

### 1.2 JobListing Model
- Add `operationalManualUrl` (Cloudinary URL).
- On create or update, the operational manual file must be uploaded to Cloudinary and the URL saved.
- At least one employer must be selected per job listing.
- Admin must supply a `vacancyUrl` for every checked employer on create.
- Admin may edit `vacancyUrl` for checked employers on update.

### 1.3 JoblistingEmployer Junction Model
- Create a `JoblistingEmployer` junction table with:
  - `employerId`
  - `jobListingId`
  - `vacancyUrl` (nullable, default null)
- Relationships:
  - `JobListing` many-to-many `Employer` (via `JoblistingEmployer`)
  - `Application` belongs to one `JobListing`; `JobListing` has many `Application`
  - `Applicant` has one `Application`; `Application` has one `Applicant`

### 1.4 Employer Model
- Create `Employer` model with:
  - `name`
  - `websiteUrl`
  - `companyDescription`
  - `email`
  - `isCurrentlyEmploying` (boolean; only one employer may have this flag set at a time — see Feature Group 6)
- Seed with Maca Limited and Mineral Resources.

### 1.5 TicketCatalogue Model
- `TicketCatalogue` has many `Ticket`; each `Ticket` belongs to one `TicketCatalogue`.
- `JobListing` many-to-many `TicketCatalogue`.
- On application create/start, all `TicketCatalogue` entries for the application's `JobListing` are copied as the applicant's `Ticket` records.
- Admin can CRUD an applicant's tickets from existing `TicketCatalogue` entries.
- `Applicant` has many `Ticket`; each `Ticket` belongs to one `Applicant`.

### 1.6 Course (TicketCourse) Model
- Remove `contentText` attribute.
- Add `contentUrl` (Cloudinary URL).
- Add `syllabus` attribute (structured text/JSON; format defined by the syllabus template — see Feature Group 17).

### 1.7 Invoice Model
- An applicant has exactly one `Invoice` (1:1).
- Remove `invoiceType` attribute.
- Invoice status: `unpaid` | `half_paid` | `paid`.
- A `Receipt` is generated and emailed when an invoice is marked `paid`.

> **[RESOLVED C1 — Partial Payment: Option B]**
> Partial pay is retained. Edit item 10 ("Remove partial pay") is discarded.
> Invoice statuses remain: `unpaid` | `half_paid` | `paid`. All half-payment flows in F009 and F010 are in effect.

### 1.8 Agent Bank Account Model
- The existing `BankAccount` model serves as the agent bank account.
- Only one agent bank account may exist at a time.
- CRUD via admin UI.
- Used for agent wire transfers on invoices below 700 AUD.

### 1.9 Crypto Wallet Model
- Create a `Wallet` model with:
  - `address` (USDT, Tron network)
- Only one wallet entry in the database at a time.
- CRUD via admin UI.

### 1.10 ApplicantQualification Model
- Create `ApplicantQualification` model (standard qualification fields derived from CV parse).

### 1.11 Experience Model
- Create `Experience` model based on ATS CV standards.

---

## FEATURE GROUP 2 — ATS & CV Processing (F001)

**Feature ID:** F001 — ATS CV Parsing

### Actions

**CVA01 — Applicant uploads CV**
- **CVS01:** System checks if the uploaded CV is in ATS format.
- **CVS02:** System checks for grammar.
  - Implementation note: Non-English names and company/employer names in the experience section must not be checked.
- **CVS03:** If CVS01 or CVS02 fails, user is prompted accordingly:
  - CVS01 fail — prompt to download the CV template.
  - CVS02 fail — prompt to correct grammar.
- **CVS04:** System saves parsed data to `ApplicantQualification` and `Experience` tables.
- **CVS05:** Applicant is notified on success or error.
- CV must conform to ATS format.
- On passing Psychometric Module 1 (based on `HIRING_PROCESS_INFORMATION.pdf`), the applicant is congratulated for being eligible for at least partial ticket training sponsorship.

---

## FEATURE GROUP 3 — Qualification Uploads (F002)

**Feature ID:** F002 — Qualifications Upload

### Actions

**QAA01 — Qualification certificate upload**
- **QAAS01:** If CVS05 succeeds and the applicant has qualifications, the system fetches them.
- **QAAS02:** UI renders a file field per qualification with the qualification name as the label.
- **QAAS03:** Applicant uploads one or more certificates.
  - Implementation note: Only one upload is mandatory if the applicant has two or more qualifications. If one or none, upload is optional.
- **QAAS04:** Qualifications are saved to `ApplicantQualification`. UI reacts to success or failure.

---

## FEATURE GROUP 4 — Bio Update (F003)

**Feature ID:** F003 — Bio Update

### Actions

**BUA01 — Bio update**
- **BUAS01:** Applicant fills in bio details.
- **BUA02:** System validates all fields are filled and meet a minimum character count.
- **BUA03:** Applicant is notified on success or error.

---

## FEATURE GROUP 5 — Employer Selection (F004)

**Feature ID:** F004 — Employer Selection

### Overview
Rename all instances of "Nomination" to **"Employer Selection"** across client, server, forms, models, emails, and UI.

### Actions

**ESA01 — Employer Selection (Initial)**
- **ESAS01:** Stage updated to: *Employer Selection — Ongoing*.
  - 24 hours after application acceptance, the system cron sends the Employer Selection Invite email (M06).
  - Implementation notes for the invite email:
    1. Fetch employers from the backend.
    2. Vacancy position is the applicant's job listing title.
    3. Assign a random integer between 2 and 7 as the number of slots per company, displayed in a table.
    4. Total vacancies displayed = (sum of slots) + 2, shown as the total applicant pool.
  - If `JoblistingEmployer.vacancyUrl` is not null, include the vacancy URL in the email.
  - Include `employer.companyDescription` and `employer.websiteUrl` in the email.
  - Include the official Australian visa sponsor list link:
    `https://www.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf`
    Notify the applicant that the most recent list was released in 2025 (not 2026).
- **ESAS02:** Applicant receives the invite email, reviews employer options, and checks the box for their chosen employer.
- **ESAS03:** Applicant downloads the Employer Selection Form, signs it, and uploads it via their dashboard.
- **ESAS04:** If the applicant's selected employer does not match the employer flagged `isCurrentlyEmploying`, a change-of-employer-selection email is sent.

**ESA02 — Employer Selection Change**
- **ESAS05:** If selection still does not match `isCurrentlyEmploying`, the system sends a change-of-employer-selection email.

**ESA03 — Employer Selection Acceptance**
- Stage updated to: *Employer Selection — Completed*.
- **ESAS06:** Five hours after ESAS03 submission, a cron job runs.
  - If selection now matches `isCurrentlyEmploying`, an acceptance email is sent from info (blue collar).

---

## FEATURE GROUP 6 — Employer Management (F006)

**Feature ID:** F006 — Employer Management

### Actions
- Full CRUD for employers via admin dashboard.
- Only one employer may be marked `isCurrentlyEmploying` at any given time.
- Admin UI must enforce this constraint (toggling one off when another is toggled on).

---

## FEATURE GROUP 7 — Interview Scheduling (F005)

**Feature ID:** F005 — Interview Scheduling

### Actions

**INA01 — Interview invitation**
- **INAS01:** Admin:
  1. Selects applicant from dropdown.
  2. Fills in interview details (date, time, timezone).
  3. Adds Zoom link. This is mandatory — admin cannot send without it.
  4. Request sent to server.
  5. `applicant.interviewDate`, `applicant.interviewLink`, `applicant.interviewTime` updated in DB.
  6. Email dispatched **from employer email** with:
     - Interview link, date and time.
     - Operational manual file attached (downloaded from Cloudinary via `JobListing.operationalManualUrl`).

**INA02 — Second employer contact (1 hour after INA01)**
- `employerSecondContact` email sent from employer email.
- Educates applicant on the interview-to-onboarding steps.
- Attaches `maca-employee-onboarding-guide.pdf` (generated server-side) with:
  1. Applicant name appended.
  2. Applicant interview date appended.
- Email also includes:
  - Notification of post-employment visa processing and onboarding process.
  - Warning to confirm medical fitness before proceeding.
  - High-level employment contract terms (salary, hours, etc.).
  - Confirmed interview date and Zoom link.
  - Promised steps: TRN -> nomination -> visa -> TRA skills assessment -> arrival -> start date. (Promises, not confirmed events.)

---

## FEATURE GROUP 8 — Ticket Sponsorship (F007)

**Feature ID:** F007 — Ticket Sponsorship

> **[RESOLVED C2 — Sponsorship trigger]**
> Trigger confirmed: TSAS01 fires 3 hours after INAS01 (the interview notification email, F005/INA01).
> The original "F002" reference in the source document was a mislabel and is disregarded.

### Actions

**TSA01 — Invite for Sponsorship**
- **TSAS01:** 3 hours after the interview notification email (F005/INA01), a cron job sends the applicant an invitation to upload existing tickets and/or apply for sponsorship.
- **TSAS02:** Applicant visits their dashboard and uploads any tickets they already possess.
- **TSAS03:** If no tickets or gaps remain, the UI encourages the applicant to apply for sponsorship.
- **TSAS04:** 6 hours after the sponsorship application is submitted, a cron job approves it, updates the DB, and sends a confirmation email.

> **Gating rule:** The ticket sponsorship application form must not be accessible before the TSAS01 stage is due. The application detail page must enforce this gate.

---

## FEATURE GROUP 9 — CertHero Enrollment (F008)

**Feature ID:** F008 — CertHero Enrollment

### Actions

**CEA01 — Enrollment notification**
- **CEAS01:** 6 hours after employer selection acceptance (ESA03/ESAS06), a cron job:
  1. Creates CertHero credentials for the applicant.
  2. Prefills the enrollment letter with applicant details and ticket courses.
  3. Sends an email from RTO email containing:
     - CertHero credentials.
     - Enrollment letter.
     - Request to log in and review the syllabus.
     - Note that AI tutor access is granted on completion of enrollment.
     - Deadline warning: failing to commence and complete all courses and examinations before the deadline results in forfeiture of the opportunity.
  - Enrollment email must also state:
    - Officially enrolled; enrollment details to follow from partner RTO.
    - Being medically fit and passing ticket examinations are the only guarantees to being hired.
    - Why tickets are required (note: most overseas applicants do not have all tickets required to work in Australia, even if experienced).

**CEAS02 — On first RTO login post-enrollment**
- The selected employer (with `isCurrentlyEmploying = true`) sends an email from employer email:
  1. Requests the applicant to submit an international means of receiving refunds within 3 weeks.
  2. Outlines the refund policy for any financial responsibility borne by the applicant during training.
  3. Asks the applicant to watch for the blue collar ticket sponsorship contract email.

**CEAS03 — Sponsorship contract delivery (on first RTO login)**
- On the applicant's first RTO login, the server:
  1. Drafts the ticket sponsorship contract (template prefilled with applicant bio and ticket gaps).
  2. Updates the stage.
  3. Sends the contract from blue collar email with:
     - Instruction to watch for a bank details request from their employer.
     - Instruction to sign and upload the contract via dashboard to obtain a sponsorship ID.
     - Note: contract ID will be sent within 3 hours of upload.
  4. 2 hours after upload, a cron job sends the sponsorship ID.
- On dashboard, the applicant can view the course syllabus but not the content until payment.
- Attempting to access course content triggers: "Are you a sponsored candidate?"
  - If yes -> system requests sponsorship ID.
  - After valid sponsorship ID entry -> applicant is navigated to the invoice request page.

**CEAS04 — Invoice request**
- The applicant enters their contract ID, which navigates to the invoice request page showing:
  - `applicant.percentageSubsidy` and the total amount in AUD.
  - Payment purpose message: tone must reflect that, under the contract with the selected employer and partner labour-hire company, the residual refundable cost ensures the applicant completes the courses and examinations without dropping out.
  - The 100% refund policy on ticket acquisition by the employer.
- Refund policy is displayed above the "Request Invoice" button.

---

## FEATURE GROUP 10 — Payments (F009)

**Feature ID:** F009 — Payments

> **[RESOLVED C1 — Partial Payment: Option B]**
> Partial pay is retained. All half-payment flows below are authoritative.

### Actions

**PA01 — Invoicing**
- **PSAS01:** Once the applicant hits "Request Invoice" (CEAS04):
  1. An `Invoice` record is created.
  2. A CertHero-branded invoice is generated using the invoice template and total ticket costs.
  3. The invoice email is sent from RTO email with:
     - Payment instructions for all four methods (see table below).
     - Minimum amount per route.
     - Discount policy.
     - Half-payment note for card and crypto routes (partial pay retained — C1 resolved).
     - Refund policy prominently at the top.
     - FAQ link (covering traceability, refund, speed, and legitimacy of each method).
     - Payment link/details and refund means per route.
  - Applicant is instructed to reply to the invoice email with the date and local time (including timezone) they intend to make payment, so that support can be available for a smooth process.
  - If a payment FAQ exists in the database (`Faq` where `type = 'payment'`), include the link in the invoice email.

| Method | Key Details |
|---|---|
| Wire transfer | For amounts above AUD threshold |
| Agent wire transfer | For amounts below 700 AUD (only if agent bank account exists in DB) |
| Card | Pros: instant, easy. Cons: not available in all countries. Includes refund method. |
| Crypto (Bitget, USDT) | Pros: instant, traceable via Bitget. Play Store and App Store links included. Crypto FAQ link. |

- **PSAS02:** Card payment button and crypto payment button displayed in the email.

**PA02 — Card Payment**
- **PCAS02:** On reaching the card payment page (dummy card details form):
  1. On clicking Pay, user is alerted that card payments are not available in their country for this merchant.
  2. An email is sent from CertHero finance team asking the applicant to use an alternative method, noting crypto via Bitget is fast and easy, and referring them to Ian for further enquiry.

**PA03 — Crypto Payment**
- **PA03S01:** User sees a clickable and scannable QR code from the admin wallet address in the DB. Only one wallet exists at a time.
- **PA03S02:** User sees scanning/clicking instructions based on device (PC or mobile).
- **PA03S03:** On click/scan, opens Bitget wallet if installed; otherwise opens Play Store or App Store based on OS.
- **PA03S04:** Applicant views payment instructions.
- **Crypto option email:** A separate email to calm applicants who fear crypto. Clearly explain why the method is safe and why Bitget specifically is safe and easy.

**PA04 — Agent Bank Account CRUD**
- Bank account for SWIFT international wire transfer.
- The existing bank account model serves this purpose.
- Only one entry at a time in the database.
- Admin CRUD UI and server implementation required.

**PA05 — Receipts**
- **PA04S01:** Admin navigates to pending payments; system fetches applicants with unpaid or half-paid invoices.
- **PA04S02:** Admin selects applicant, enters amount paid, sends request to server.
- **PA04S03:** System marks the invoice as paid.
- **PA04S04:** System generates a receipt document.
- **PA04S05:** System sends the receipt via email.
- Invoice and receipt generation must be moved to the server.

---

## FEATURE GROUP 11 — Course Access & Examinations (F010)

**Feature ID:** F010 — Course Access

### Actions

**CA01 — Syllabus, Course, and Examination Content**
- **CAS01:** Developer provides the PDF manual for each ticket.

**CA02 — Course Consumption**
- **CAS02:** If the applicant has paid their invoice, they can view the course as a non-downloadable, branded manual document on screen.
- The AI bot is displayed and the user can interact with it based on the document in view or other ticket manuals.

**CA03 — Examinations**
- **CA03S01:**
  - If invoice is **fully paid**: applicant may take the exam at any time; exams are graded immediately.
  - If invoice is **half paid**: applicant may take only 3 examinations; a fourth attempt prompts payment method selection (bank transfer or crypto). Each payment page must link to the other.
- **CA03S02:** If the applicant passes, a congratulatory message is shown; 3 hours later, a ticket is generated from the branded template and sent via email.
- **CA04S03:** If a candidate fails on a **second attempt**, the system automatically passes them at the 60% pass mark and executes CA03S02.
  If a candidate fails the **first attempt**, they are encouraged to retry, shown the questions they got wrong, and an email is sent.
- **CA04S04:** System sends the receipt document via email.

**CA04 — Handoff**
- **CA04S01:** After the applicant completes the last ticket exam, passes, and receives their ticket, 6 hours later, blue collar sends a Handoff notice:
  - Informs the applicant that their employer will be in contact.
  - They will be off-boarded from the platform shortly after employer contact.

---

## FEATURE GROUP 12 — Crypto Wallet CRUD (F011)

**Feature ID:** F011 — Crypto Wallet CRUD

- Create admin UI for Wallet management.
- Server implementation for Wallet CRUD.
- Only one USDT (Tron network) wallet address stored in the database at any time.

---

## FEATURE GROUP 13 — Psychometric Testing

### Module 1
- On passing Module 1 (based on `HIRING_PROCESS_INFORMATION.pdf`), the applicant is congratulated for being eligible for at least partial ticket training sponsorship.

### Module 2 — Geo-routing & Pre-module Gates

> **[RESOLVED C3 — Module 2 Section 2 question scope]**
> An earlier version of the document included refund policy questions in Section 2.
> **Resolved by user:** Section 2 questions must NOT include refund policy questions.
> Implementation: questions are based solely on `HIRING_PROCESS_INFORMATION.pdf`, covering SECTION 1 and SECTION 2 without refund policy content.

**M2.1 — Geo-routing modal**
- When any visitor navigates to the RTO site, a modal pops up to detect whether they are in Australia.
  - If in Australia -> route to `https://certhero.com.au`.
  - If not in Australia -> remain on RTO URL; display: "Course access on this portal is only for sponsored overseas candidates. Use the main portal."

**M2.2 — Pre-module confirmation gate**
- Before the applicant can start Module 2, a modal asks if the applicant has read `HIRING_PROCESS_INFORMATION.pdf` (attached to the welcome email).
  - If no -> applicant is made to download the file immediately.
  - If yes -> module begins.

**M2.3 — Question rewrite**
- Rewrite all Psychometric Module 2 questions based on `HIRING_PROCESS_INFORMATION.pdf`:
  - SECTION 1: Questions from Section 1.
  - SECTION 2: Questions from Section 2. Refund policy questions must NOT be included.

---

## FEATURE GROUP 14 — Application Lifecycle & Acceptance

### Manual Acceptance Flow
- Change application acceptance from automated (cron) to **manual** via the admin dashboard.
- Admin must draft and send the acceptance email to the applicant as part of the acceptance action.
- The acceptance email must be specific to:
  1. The applicant's experience.
  2. The job role applied for.
  3. The applicant's qualifications.
  4. Inform of the upcoming employer selection stage (dedicated email to follow within 24 hours).

### Application Flow Sequence
1. Onboarding — sign-up, verify email (fully implemented).
2. Application — commenced with welcome email.
3. Employer Selection.
4. Interview Scheduling.
5. Ticket Sponsorship: invited -> applied -> approved -> contract.
6. Ticket Acquisition.
7. Handoff.

- Each approval email must state the effect of the approval in terms of the hiring procedure and the next step.
- Each stage commencement email must clearly state:
  - The aim of the stage.
  - The reason behind the aim ("How does this help me get hired?").
  - The procedure.
  - Consequences of lateness or non-compliance.
  - Communication channel and expected response time.

---

## FEATURE GROUP 15 — Documents

All documents must be generated server-side unless noted.

| # | Document | Notes |
|---|---|---|
| 1 | HIRING_PROCESS_INFORMATION.pdf | Attached to welcome email |
| 2 | Employer Selection Form | Renamed from "Nomination Form"; move creation to server |
| 3 | CertHero Enrollment Letter | Generated server-side; styled per certhero.com.au |
| 4 | Sponsorship Contract | Moved to server; see edits below |
| 5 | Invoice | Moved to server; CertHero branded |
| 6 | Receipt | Generated on invoice marked paid |
| 7 | Tickets | Generated from branded template after exam pass |

**Employer Selection Form:**
- Rename "NOMINATION OFFICIAL SPONSOR LIST" to "Official Sponsor Employers List" everywhere.
- Only the employer with `isCurrentlyEmploying = true` is included in the form.

**Enrollment Letter:**
- Fetch applicant's tickets where `possessed = false`.
- Outline tickets with a mode of instruction table (Online vs Practical).
- Include: online procedure, practical procedure, communication channel, deadline section.
- Examination completion deadline: 16 days from the date the enrollment email was dispatched.

**Sponsorship Contract edits:**
1. Move contract creation to the server.
2. Body must state: this is not an employment contract; it is to ensure you get a job if you meet the requirements.
3. Amount in AUD.
4. Refunder and refund policy.
5. Remove accommodation and other visa-related content.
6. List what the employer covers in the employment contract:
   - Skills assessment
   - Medical
   - Visa costs and sponsorship
   - Flight
   - Accommodation off-site (3 months) and on-site (for the duration of the employment contract)

---

## FEATURE GROUP 16 — Emails (Full List)

All emails below must be implemented. Emails that commence a stage must follow the structure in Feature Group 14.

| # | Email | Sender |
|---|---|---|
| 1 | Welcome email | Blue collar (info) |
| 2 | Psychometric Module 1 mail | — |
| 3 | Psychometric Module 2 mail | — |
| 4 | Application submitted mail | — |
| 5 | Application accepted mail | Admin (manual draft required) |
| 6 | Employer Selection mail (M06) | Blue collar (info) |
| 7 | Employer Selection filled mail | — |
| 8 | Employer Selection accepted mail | Blue collar (info) |
| 9 | Notification of interview date and time mail | Employer email |
| 10 | Call for ticket sponsorship mail | Blue collar |
| 11 | Ticket sponsorship accepted mail | — |
| 12 | Ticket courses enrollment mail | RTO email |
| 13 | Contract delivery mail | Blue collar |
| 14 | Contract agreement acknowledgement mail | — |
| 15 | Invoice mail | RTO email |
| 16 | Receipt mail | — |
| 17 | Ticket pass mail | — |
| 18 | Ticket fail mail | — |
| 19 | Ticket delivery mail | — |
| 20 | Ticket drop-off mail | — |
| 21 | Handoff mail | Blue collar |

**Email sender environment variables (save as env vars):**
- `INFO_EMAIL` — Blue collar (info)
- `RTO_INFO_EMAIL` — RTO info
- `EMPLOYER_EMAIL` — Employer
- Admin and server can send from any of the three addresses above.

---

## FEATURE GROUP 17 — Seeding

### Data to Seed

1. **Employers:** Seed Maca Limited and Mineral Resources to match the Employer model.
2. **Job Listings:**
   - Edit `FIFO.csv` seed data to match the JobListing model.
   - `benefit` column must be formatted as a numbered list so the client can render it as a bullet list.
   - Add operational manual per job listing (uploaded to Cloudinary, linked via `operationalManualUrl`).
   - Fetch from the web: any document detailing operational procedures for the job on a mining site.
3. **Ticket Requirements:**
   - Fetch all required tickets for each job listing in Perth, Western Australia.
   - Create a `ticketRequirements.json` file for each job listing.
   - Object notation per ticket must match the TicketCatalogue model.
   - Include status columns: course seeded, exam questions seeded, catalogue seeded.
   - Include tickets and driver's licences only — no police clearance.
4. **Training Manuals (per ticket):**
   - Search and download a training manual from the web.
   - Ensure all manuals include a table of contents (syllabus).
   - AI extracts the syllabus and text, then recreates the manual with CertHero branding.
   - Rebranded manual uploaded to Cloudinary; public URL saved to `Course.contentUrl`.
5. **Courses (per TicketCatalogue entry):**
   - Seed using `contentUrl` (Cloudinary) and `syllabus` (template format). No `contentText`.
6. **Examination Questions:**
   - For each ticket training material, draft 35 examination questions.
   - Save in JSON files, each linked to the relevant ticket.
7. **Seed Jobs:**
   - Operational manual saved in Cloudinary.
8. **Seed TicketCatalogue:**
   - For each TicketCatalogue, seed course and exam questions.
   - Update `ticketRequirements.json` to reflect seeding progress.

### Syllabus Template
- Create a text or JSON template for the syllabus to ensure uniform front-end formatting.
- Save each syllabus in this template format, linked to its ticket.

---

## FEATURE GROUP 18 — RTO Platform & Security

### Security & Routing
- All action-demanding public page components must route to `/login` when the user is not authenticated.
- No secured page must exist as a public page.
- Secured routes (require authentication):
  - `/payments`
  - `/notifications`
  - `/my-certifications`
  - `/courses/[id]`
  - `/courses/[id]/exam`
  - `/psychometric`
- Navbar and landing page CTAs must route unauthenticated users to `/login`.
- The `/login` page must handle a `redirect` search parameter to return the user to the intended page after login.

### Credential Management
- Unify RTO credentials creation and management.

### Miscellaneous
- Rename all instances of "Aveling" to "RTO" across client and server.

---

## FEATURE GROUP 19 — Vacancy URL Management

- Create a page to fetch and update vacancy URLs for each `JoblistingEmployer` row.

---

## FEATURE GROUP 20 — Registration

- On the registration form, add a consent checkbox: "I consent to making a testimonial video if hired."
