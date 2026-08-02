# PROMPT: Apply Changes to Existing Application

> **Usage:** Copy-paste this entire file into your AI chatbox. Attach the following files alongside it:
> - `CHANGE_SPECIFICATION.md` (filled in using `CHANGE_SPECIFICATION_TEMPLATE.md`)
> - `CHANGE_CODE_GENERATION_RULES.md`
> - `ADR.md`
> - `SPECIFICATION.md` (the current specification of the existing application)
> - The existing codebase (or relevant source files)

---

You are a senior full-stack developer performing a controlled modification to an existing application.

**Inputs provided:**
- `CHANGE_SPECIFICATION.md` — describes every change to be made, using the Change Specification Template format. Each change has a `changeId`, a `MODE` (CREATE / MODIFY / DELETE), and a `stepId` reference.
- `CHANGE_CODE_GENERATION_RULES.md` — the mandatory synchronization protocol between code and specification.
- `ADR.md` — architectural decisions and tech stack that the existing application follows.
- `SPECIFICATION.md` — the current specification. You will update this as part of the process.
- The existing codebase.

**Instructions:**

### Phase 1 — Read and Understand
1. Read `CHANGE_CODE_GENERATION_RULES.md` completely. Every rule is mandatory.
2. Read `ADR.md` to understand the tech stack and code standards.
3. Read the current `SPECIFICATION.md` to understand the existing application.
4. Read `CHANGE_SPECIFICATION.md` to understand every change that must be applied.

### Phase 2 — Process Each Change
For each entry in the Change Manifest (Section 1 of the Change Specification):

**If MODE = DELETE:**
1. Locate the stepId in the codebase.
2. Remove all associated code: backend route, controller, service, frontend page, hooks, and components (if exclusive to this step).
3. Delete the Operational Scenario for that stepId from `SPECIFICATION.md`.
4. Check for and remove any dangling references (e.g., other steps listing this as a precondition).

**If MODE = MODIFY:**
1. Read the updated Operational Scenario and API Actions for this changeId.
2. Update all affected code: backend routes, controllers, services, validation schemas, database models/migrations, frontend pages, hooks, view model mappings, error handling, and side effects.
3. In `SPECIFICATION.md`, update the corresponding step in-place with the new details.
4. Append a new row to the Change Log table for that step.

**If MODE = CREATE:**
1. Read the new Operational Scenario and API Actions for this changeId.
2. Generate all required code following the same structure as the existing application:
   - Backend: route registration, controller, service, Zod validation schema, database model/migration if needed.
   - Frontend: page, hooks, view model mapping, error handling, side effects.
3. Annotate the new page and controller with the new stepId.
4. Append the new Operational Scenario to `SPECIFICATION.md` with its stepId and initial Change Log entry.

### Phase 3 — Verification
After processing all changes, verify:

- [ ] Every `changeId` in the Change Manifest has been processed.
- [ ] For DELETE: code is fully removed, SPECIFICATION.md step is deleted, no dangling references remain.
- [ ] For MODIFY: code matches the updated specification, Change Log has a new entry.
- [ ] For CREATE: all new code exists (route, controller, service, page, hooks), SPECIFICATION.md has the new step.
- [ ] All stepId annotations in code comments are correct.
- [ ] No string literals were introduced outside of constants files.
- [ ] The application compiles and runs without errors.
- [ ] The updated `SPECIFICATION.md` is consistent and complete.

**Output:**
1. The modified codebase with all changes applied.
2. The updated `SPECIFICATION.md` reflecting the current state after changes.
3. A summary table showing each changeId, what was done, and confirmation it passes verification.
