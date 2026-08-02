# CHANGE_SPECIFICATION_TEMPLATE

<!--
  This template is used to describe changes to an existing SPECIFICATION.md.
  Each change targets a specific stepId (for MODIFY/DELETE) or creates a new step (for CREATE).
  Section 2 and Section 3 are repeated for EACH change entry that requires them.
-->

---

# 1. CHANGE MANIFEST

> List every change. Each entry links to the Operational Scenario and API Actions below via its changeId.

| changeId | MODE | stepId | Summary of Change |
|----------|------|--------|--------------------|
| CHANGE-001 | CREATE / MODIFY / DELETE | STEP-XXX (null if CREATE) | [Brief description of what is changing and why] |
| CHANGE-002 | CREATE / MODIFY / DELETE | STEP-XXX (null if CREATE) | [Brief description] |

> **MODE definitions:**
> - **CREATE** — New feature/screen being added. `stepId` is null; a new stepId will be assigned.
> - **MODIFY** — Existing step is being changed. `stepId` references the target step in SPECIFICATION.md.
> - **DELETE** — Existing step is being removed. Only `stepId` is needed; Sections 2 and 3 are omitted.

---

# 2. OPERATIONAL SCENARIO (per changeId)

> Repeat this section for each CHANGE entry with MODE = CREATE or MODIFY.
> For DELETE, skip this section entirely.

1. **changeId**: CHANGE-XXX
2. **stepId**: STEP-XXX (existing for MODIFY, newly assigned for CREATE)
3. **Actor**: [User / Admin / Guest]
4. **isImplemented**: boolean
5. **Screen**: [Screen name and description]
6. **Trigger**: [What causes the user to arrive]
7. **Preconditions**: [What must be true]
8. **Screen View Model**:
   ```json
   {
     "fieldName": "type (source)"
   }
   ```
9. **Emotions**:
   1. Current Emotions
   2. Target Emotions
10. **Screen Input Actions**
11. **Screen Output Display**

---

# 3. SCREEN API ACTIONS (per changeId)

> Repeat this section for each CHANGE entry with MODE = CREATE or MODIFY.
> Include only the API actions that are affected by the change.

**changeId**: CHANGE-XXX

## 3.1. READ

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Server Business Logic
5. Response body schema: Json
6. On empty retrieval response
7. Screen data manipulation on success
8. Side Effects
9. Next Action
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action

## 3.2. CREATE

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Request body: Json
5. Server Business Logic
6. Response body schema: Json
7. Screen data manipulation on success
8. Side Effects
9. Next Action
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action

## 3.3. DELETE

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Server Business Logic
5. Response body schema: Json
6. Screen data manipulation on success
7. Side Effects
8. Next Action
9. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action

## 3.4. PATCH/PUT

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Request body: Json
5. Server Business Logic
6. Response body schema: Json
7. Screen data manipulation on success
8. Side Effects
9. Next Action
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action