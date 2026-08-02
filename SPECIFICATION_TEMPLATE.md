# SPECIFICATION_TEMPLATE

<!-- 
  This is the output format for SPECIFICATION.md.
  Every Operational Scenario must follow this structure exactly.
  Fields marked with a type (e.g., string, Json) must use that type.
-->

## 1. UI DESIGN THEME

> Populate once at the top of the specification. Applies to all screens.

1. Style: [e.g., "Modern Minimalist", "Corporate Professional"]
2. Primary Color: [hex code, e.g., #1E40AF]
3. Secondary Color: [hex code]
4. Accent: [hex code]

---

## 2. OPERATIONAL SCENARIO

> Repeat this entire section for each screen/step.

1. **stepId**: STEP-XXX
2. **Actor**: [User / Admin / Guest]
3. **isImplemented**: boolean
4. **Screen**: [Screen name and short description]
5. **Trigger**: [What causes the user to arrive at this screen]
6. **Preconditions**: [What must be true before this screen can work]
7. **Business Justification**: [Why this feature matters — from FEATURE_LIST.md]
8. **Screen View Model**:
   ```json
   {
     "fieldName": "type (source: api_field | user_input | derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: [What the user feels arriving here — from FEATURE_LIST.md]
   2. Target Emotions: [What the user should feel after success — from FEATURE_LIST.md]
10. **Screen Input Actions**: [User interactions: button clicks, form submissions, navigation]
11. **Screen Output Display**: [What the UI renders: tables, cards, forms, messages]

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Server Business Logic: [Describe what the server does step-by-step]
5. Response body schema: Json
6. On empty retrieval response: [What the UI shows when no data is returned]
7. Screen data manipulation on success: [How the response maps to the View Model]
8. Side Effects: [e.g., cache update, analytics event]
9. Next Action: [e.g., stay on page, navigate to X]
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error: [View Model changes on this error]
       4. Side Effects: [e.g., show toast, log event]
       5. Next Action: [e.g., stay on page, redirect to login]

### 3.2. CREATE

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Request body: Json
5. Server Business Logic: [Step-by-step]
6. Response body schema: Json
7. Screen data manipulation on success: [View Model updates]
8. Side Effects: [e.g., invalidate cache, show toast]
9. Next Action: [e.g., redirect to list page]
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action

### 3.3. DELETE

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Server Business Logic: [Step-by-step]
5. Response body schema: Json
6. Screen data manipulation on success: [View Model updates]
7. Side Effects
8. Next Action
9. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action

### 3.4. PATCH/PUT

1. Url route: string
2. Params: string | null
3. Query: string | null
4. Request body: Json
5. Server Business Logic: [Step-by-step]
6. Response body schema: Json
7. Screen data manipulation on success: [View Model updates]
8. Side Effects
9. Next Action
10. Errors:
    1. error-XXX:
       1. Code: number
       2. Message: string
       3. Screen data manipulation on error
       4. Side Effects
       5. Next Action