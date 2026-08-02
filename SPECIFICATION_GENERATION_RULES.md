# SPECIFICATION_GENERATION_RULES

**Purpose:** Transform FEATURE_LIST.md into a complete SPECIFICATION.md using SPECIFICATION_TEMPLATE.md as the output format.

---

## Input

- `FEATURE_LIST.md` — the authoritative list of features with Feature IDs, names, descriptions, actors, business justification, and emotions (current/target).

## Output

- `SPECIFICATION.md` — a fully populated document following `SPECIFICATION_TEMPLATE.md` exactly.

---

## Rules

### Rule 1 — Process Every Feature

For each feature row in `FEATURE_LIST.md`, generate one or more Operational Scenario steps in `SPECIFICATION.md`.

### Rule 2 — Assign Step IDs

Every Operational Scenario must have a unique `stepId` in the format `STEP-XXX` (e.g., `STEP-001`). Number sequentially starting from `STEP-001`. This ID is used by `CODE_GENERATION_FLOW.md` for traceability annotations.

### Rule 3 — Fill Every Template Field

For each Operational Scenario, populate **all** fields from `SPECIFICATION_TEMPLATE.md`. No field may be left blank — use `null` or `N/A` explicitly when a field does not apply.

### Rule 4 — Ensure Admin Precondition Coverage

After writing the user-facing specification step:

1. Check if the step has preconditions that require data created by an Admin (e.g., categories, settings, lookup data).
2. If **yes** and no existing Admin step already provides that data, create an Admin Operational Scenario step that supplies the precondition.
3. The Admin step must include at least one of: CREATE, READ, READ-ONE, UPDATE, or DELETE — whichever is applicable to making the precondition available.

### Rule 5 — Define Screen View Models Explicitly

The Screen View Model must list every field the UI needs to render and interact with the screen, including:
- Field name
- Type (string, number, boolean, array, object)
- Source (API response field, user input, derived/computed)

### Rule 6 — Define API Action Contracts Completely

For every API action (READ, CREATE, DELETE, PATCH/PUT):

1. **URL routes** must follow RESTful conventions: `/api/{module}/{resource}` for collections, `/api/{module}/{resource}/:id` for single items.
2. **Response body schemas** must be written as JSON examples with realistic placeholder data.
3. **Error codes** must use standard HTTP status codes (400, 401, 403, 404, 409, 500) and each error must have a unique error ID in the format `error-XXX`.
4. **Server Business Logic** must describe the steps the backend performs, not just "save to database".

### Rule 7 — UI Design Theme (Once)

Populate the UI Design Theme section (Section 1 of the template) exactly once at the top of `SPECIFICATION.md`. It applies globally to all screens.

### Rule 8 — Carry Forward Emotions from Feature List

- Each feature row in `FEATURE_LIST.md` includes **Current Emotions** and **Target Emotions** columns.
- Copy these values directly into the Operational Scenario's Emotions field (Section 2.8 of the template).
- **Current Emotions**: What the user feels arriving at this screen — use the value from the feature list.
- **Target Emotions**: What the user should feel after success — use the value from the feature list.
- These guide UI tone, copy, and micro-interactions. If a feature's emotions are blank, set to `N/A`.

### Rule 9 — Carry Forward Business Justification

- Each feature row in `FEATURE_LIST.md` includes a **Business Justification** column.
- Include this as a `Business Justification` field in the Operational Scenario (after `Preconditions`, before `Screen View Model`).
- This helps the AI understand *why* the feature exists, informing UI priority, copy tone, and implementation decisions.
- If a feature's justification is blank, set to `N/A`.