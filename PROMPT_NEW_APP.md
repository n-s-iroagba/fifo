# PROMPT: New Application

> **Usage:** Copy-paste this entire file into your AI chatbox. Attach the following files alongside it:
> - `FEATURE_LIST.md` (filled in with your features)
> - `SPECIFICATION_GENERATION_RULES.md`
> - `SPECIFICATION_TEMPLATE.md`
> - `ADR.md`
> - `CODE_GENERATION_FLOW.md`

---

## STEP 1 OF 2 — Generate Specification

You are a senior software architect. Your task is to generate a complete `SPECIFICATION.md` document.

**Inputs provided:**
- `FEATURE_LIST.md` — the authoritative list of features to implement.
- `SPECIFICATION_GENERATION_RULES.md` — the rules you must follow while generating the specification.
- `SPECIFICATION_TEMPLATE.md` — the exact output format every Operational Scenario must follow.

**Instructions:**
1. Read `SPECIFICATION_GENERATION_RULES.md` completely. Every rule is mandatory.
2. Read `FEATURE_LIST.md` to understand all features.
3. Read `SPECIFICATION_TEMPLATE.md` to understand the output format.
4. For each feature in `FEATURE_LIST.md`, generate one or more Operational Scenario steps following the template exactly.
5. Assign sequential stepIds starting from `STEP-001`.
6. For every field in the template — fill it in completely. Use `null` or `N/A` when a field does not apply. Never leave a field blank.
7. For each user-facing step, check if an Admin step is needed to supply its preconditions (Rule 4). Create those Admin steps.
8. Write all URL routes in RESTful format: `/api/{module}/{resource}` for collections, `/api/{module}/{resource}/:id` for items.
9. Write all Response body schemas as JSON examples with realistic placeholder data.
10. Assign error codes using standard HTTP status codes (400, 401, 403, 404, 409, 500) with unique error IDs in format `error-XXX`.

**Output:** A single `SPECIFICATION.md` file that follows the template perfectly and covers every feature. Do not omit any feature from the Feature List.

---

## STEP 2 OF 2 — Generate Code

> **After you have the `SPECIFICATION.md` from Step 1**, start a new chat and attach:
> - The generated `SPECIFICATION.md`
> - `ADR.md`
> - `CODE_GENERATION_FLOW.md`

You are a senior full-stack developer. Your task is to generate a complete, working application.

**Inputs provided:**
- `SPECIFICATION.md` — the complete specification with every screen, view model, API action, and error handling defined.
- `ADR.md` — architectural decisions, tech stack, and code standards.
- `CODE_GENERATION_FLOW.md` — the mandatory step-by-step workflow you must follow.

**Instructions:**
1. Read `CODE_GENERATION_FLOW.md` from start to finish. This is your executable plan.
2. Follow every phase in order: Setup → Planning → Database → Backend → Frontend → Verification.
3. Read `ADR.md` to confirm the tech stack (Express + TypeScript backend, Next.js + TypeScript frontend, Sequelize ORM, MySQL, TanStack Query, Tailwind CSS, Zod validation).
4. Read `SPECIFICATION.md` for all UI details, screen view models, API contracts, and error handling.
5. Implement every screen, every API action, every error handler, every side effect. No omissions.
6. Annotate every page component and controller with its stepId for traceability.
7. Keep all string literals (routes, keys, error codes, messages) in constants files.
8. Complete the Phase 6 verification checklist before delivering.

**Output:** A complete, runnable application with server and client code. Every feature from the specification must be implemented. Run the Phase 6 checklist and confirm all items pass.
