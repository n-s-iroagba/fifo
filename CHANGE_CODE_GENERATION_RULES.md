# CHANGE_CODE_GENERATION_RULES

# Specification & Code Synchronization Protocol

This document establishes the mandatory workflow for applying changes described in a `CHANGE_SPECIFICATION.md` (which follows the `CHANGE_SPECIFICATION_TEMPLATE.md` format) to both the codebase and the `SPECIFICATION.md`.

All modifications must follow the rules below to maintain traceability between code and specification.

---

# 1. Operational Logic

| MODE | Code Impact | Specification Impact (SPECIFICATION.md) |
|------|-------------|------------------------------------------|
| **DELETE** | Remove the code blocks (routes, controllers, services, frontend pages/hooks) associated with the stepId. | Delete the corresponding Operational Scenario step entirely from SPECIFICATION.md. |
| **MODIFY** | Edit existing logic/implementation to match the updated Operational Scenario and API Actions from the Change Specification. | Update the corresponding step in SPECIFICATION.md in-place. Append a row to that step's Change Log table. |
| **CREATE** | Generate new routes, controllers, services, frontend pages, and hooks. | Append a new Operational Scenario step to SPECIFICATION.md with a new stepId. |

---

# 2. Specification Structure (SPECIFICATION.md)

Each Operational Scenario step in SPECIFICATION.md must maintain the following metadata block:

```markdown
## [stepId]: [Feature/Component Name]

* Status: <Approved / Pending / Deprecated>
* Last Updated: <YYYY-MM-DD>

### Implementation Details
[Technical description of the logic, dependencies, and expected behavior.]

### Change Log
| Revision ID | Date       | Description of Modification         |
|-------------|------------|--------------------------------------|
| REV-001     | YYYY-MM-DD | Initial implementation.              |
| REV-002     | YYYY-MM-DD | [Description of what changed and why] |
```

---

# 3. Workflow Per MODE

## 3.1 DELETE Procedure

1. Locate the `stepId` from the Change Manifest.
2. Remove all associated code:
   - Backend: route registration, controller, service functions, model changes (if exclusive to this step).
   - Frontend: page, hooks, components (if exclusive to this step).
3. Delete the entire Operational Scenario section for that stepId from `SPECIFICATION.md`.
4. Remove any references to the deleted stepId in other steps' preconditions.

## 3.2 MODIFY Procedure

1. Read the updated Operational Scenario and API Actions from the Change Specification for this `changeId`.
2. Apply code edits:
   - Backend: update routes, controllers, services, validation schemas, and database models/migrations as needed.
   - Frontend: update pages, hooks, view models, error handling, and side effects.
3. In `SPECIFICATION.md`, locate the step by `stepId` and replace the Implementation Details with the new state.
4. Append a new row to the Change Log table documenting what changed and why.

## 3.3 CREATE Procedure

1. Read the new Operational Scenario and API Actions from the Change Specification for this `changeId`.
2. Generate all required code:
   - Backend: new route registration, controller, service, validation schema, and database model/migration if needed.
   - Frontend: new page, hooks, view model mapping, error handling, and side effects.
3. Append a new Operational Scenario section to the end of `SPECIFICATION.md` with the assigned stepId.
4. Populate the Implementation Details and the first row of the Change Log table.

---

# 4. Verification Checklist

After applying all changes:

- [ ] Every `changeId` in the Change Manifest has been processed.
- [ ] For DELETE: code is removed, SPECIFICATION.md step is deleted, no dangling references remain.
- [ ] For MODIFY: code matches the updated specification, Change Log has a new entry.
- [ ] For CREATE: all new code exists (route, controller, service, page, hooks), SPECIFICATION.md has the new step.
- [ ] All stepId annotations in code (controller comments, page comments) are correct.
- [ ] The application compiles and runs without errors.
- [ ] No string literals were introduced outside of constants files.