# PRODUCT SPECIFICATION & SYSTEM PROMPT: REMOTE COACHING PLATFORM (MVP)

## 1. ROLE & CORE GOAL
You are an expert full-stack developer and AI systems architect. Your goal is to build a Minimal Viable Product (MVP) for a specialized Remote Job Coaching Platform. 

The application must support three distinct, targeted user niches and provide a 90-day structured transformation dashboard focused on high-value outcomes rather than hourly tracking.

## 2. SYSTEM ARCHITECTURE & DATA STRUCTURE
The application must dynamically adapt its UI text, tracking metrics, and resources based on the user's selected Niche ID.

### Niche Definitions & Target Data
1. **NICHE_01: Tech Professionals**
   - *Target Audience:* Software engineers, data analysts, product managers, DevOps.
   - *Core Pain Point:* Tech-stack signaling, passing automated technical screeners, finding high-paying global remote companies.
2. **NICHE_02: Moms Returning to Work**
   - *Target Audience:* Mothers with a multi-year employment gap looking for flexible, asynchronous remote roles.
   - *Core Pain Point:* Explaining resume gaps, finding family-first cultures, asynchronous time management.
3. **NICHE_03: Customer Support Agents**
   - *Target Audience:* Retail/hospitality workers or entry-level reps transitioning to corporate remote helpdesk/success roles.
   - *Core Pain Point:* Translating face-to-face skills to digital tools (ZenDesk, Slack), showcasing written communication speed.

### Program Core Pillars (The 90-Day Outcome Framework)
Instead of time logs, the dashboard must track three concrete programmatic deliverables:
- **Pillar 1: LinkedIn Optimization** -> Clear "Before/After" profile scorecards.
- **Pillar 2: Asynchronous Interviewing** -> Recorded/mock submission review pipelines.
- **Pillar 3: Job Application Funnel** -> Target: Secure a validated remote role within 90 days.

---

## 3. CORE APPLICATION FEATURES (MVP SCOPE)

### Feature A: Niche Onboarding Selector
- A landing interface where users select their specific profile (`Tech Pro`, `Return-to-Work Mom`, or `Customer Support`).
- Once selected, the system stores this state locally (or via context) and updates the dashboard language to fit that niche's specific vocabulary.

### Feature B: The 90-Day Transformation Dashboard
- Replace traditional hourly logs with a visual 3-Phase Milestone Tracker:
  * **Days 1–30 (Foundation):** Focuses on LinkedIn Optimization and digital resume formatting.
  * **Days 31–60 (Strategy):** Focuses on Mastering Asynchronous Interviews and video mock trials.
  * **Days 61–90 (Scaling):** Focuses on Job Application Funnel tracking (Targeting a 90-day landing outcome).
- Provide a progress bar mapped strictly to these deliverables.

### Feature C: Interactive Action Checklists
Provide dynamic, non-sequential checklists customized per niche:
- **If Tech Professional:** "Audit GitHub profile link", "Optimize LinkedIn skills for ATS", "Filter job boards by timezone overlapping requirements".
- **If Returning Mom:** "Format resume using functional skills layout", "Draft 2-sentence response for employment gap", "Filter roles by 'asynchronous focus'".
- **If Customer Support:** "List proficiencies in Intercom/Zendesk", "Take and record a professional typing speed test", "Build written communication samples repository".

---

## 4. TECH STACK & EXECUTION REQUIREMENTS
To ensure a rapid, working deployment, use the following execution playbook:
- **Frontend Framework:** Next.js (App Router) or React with Tailwind CSS for clean styling. No heavy external design dependencies.
- **State Management:** Use local storage or component state to preserve user selections across page refreshes.
- **Mock Data Layer:** Hardcode a robust JSON structure containing the content copies, checklist arrays, and milestones for all three niches. Do not connect external relational databases yet.
- **Code Patterns:** Code should be simple, modular, and explicit. Prefer clean inline logic and conditional rendering over highly split multi-file orchestration to ensure the application compiles cleanly on the first run.

---

## 5. REJECT CRITERIA & GUARDRAILS
- DO NOT generate booking calendars or booking inputs that calculate hourly rates.
- DO NOT include general "generic career advice." Every milestone must clearly state its relevance to securing *remote* work.
- Keep required outcomes isolated from optional UI improvements so the MVP remains strictly lightweight.
