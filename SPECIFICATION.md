# SPECIFICATION

## 1. UI DESIGN THEME

1. Style: Modern Industrial Minimalist (Tailored for FIFO Workforce & Training LMS)
2. Primary Color: #1E3A8A
3. Secondary Color: #0284C7
4. Accent Color: #F59E0B

---

## 2. OPERATIONAL SCENARIO: Create Course (STEP-001)

1. **stepId**: STEP-001
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Course Management - Create Course Form
5. **Trigger**: Admin clicks "Create New Course" button in Course Management dashboard.
6. **Preconditions**: Admin is authenticated with `ADMIN` role.
7. **Business Justification**: Courses must exist in the system before any learner can be pointed to them for a gap; this is the foundation the whole catalog depends on.
8. **Screen View Model**:
   ```json
   {
     "title": "string (source: user_input)",
     "code": "string (source: user_input)",
     "description": "string (source: user_input)",
     "format": "string (source: user_input)",
     "certificationTypeId": "string (source: user_input)",
     "price": "number (source: user_input)",
     "capacity": "number (source: user_input)",
     "isPublished": "boolean (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Input text fields: Title, Code, Description, Price, Capacity.
    - Select dropdowns: Format (Theory, Practical, Mixed), Certification Type.
    - Click "Save Draft Course" button.
11. **Screen Output Display**:
    - Form card with input validations.
    - Success/Error alert banner.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/courses/certifications/lookup
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin request and check `ADMIN` role permission.
   2. Query CertificationType table for active cert classifications.
   3. Return list of active certification types formatted for drop-down options.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "id": "cert-101", "name": "Working at Heights Ticket", "code": "WAH-01" },
       { "id": "cert-102", "name": "Confined Space Entry", "code": "CSE-02" }
     ]
   }
   ```
6. On empty retrieval response: Show dropdown with empty state placeholder "No certification types found".
7. Screen data manipulation on success: Populate dropdown options for `certificationTypeId`.
8. Side Effects: Cache active certification list in request context.
9. Next Action: Stay on form screen.
10. Errors:
    1. error-001:
       1. Code: 401
       2. Message: Unauthorized access. Admin session required.
       3. Screen data manipulation on error: Clear form fields.
       4. Side Effects: Redirect to login.
       5. Next Action: Redirect to `/admin/login`.

### 3.2. CREATE

1. Url route: /api/courses
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "title": "Working at Heights Safety Course",
     "code": "WAH-101",
     "description": "Comprehensive FIFO site compliance for high level work.",
     "format": "Mixed",
     "certificationTypeId": "cert-101",
     "price": 350.00,
     "capacity": 15
   }
   ```
5. Server Business Logic:
   1. Validate payload fields: format must be Theory, Practical, or Mixed; price >= 0.
   2. Verify uniqueness of course code.
   3. Create new Course record with `isPublished = false`.
   4. Audit log creation event with Admin ID.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "crs-9901",
       "title": "Working at Heights Safety Course",
       "code": "WAH-101",
       "format": "Mixed",
       "price": 350.00,
       "capacity": 15,
       "isPublished": false,
       "createdAt": "2026-08-01T08:00:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Display toast notification "Course draft created successfully".
8. Side Effects: Invalidate cached course list.
9. Next Action: Redirect to `/admin/courses/crs-9901/content`.
10. Errors:
    1. error-002:
       1. Code: 409
       2. Message: Course code already exists.
       3. Screen data manipulation on error: Highlight code field error border.
       4. Side Effects: Log validation warning.
       5. Next Action: Remain on screen for input correction.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A - Delete operation not applicable on this screen.
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A - Edit operation handled in dedicated update scenario.
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Upload Theory Content (STEP-002)

1. **stepId**: STEP-002
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Course Management > Content Builder
5. **Trigger**: Admin selects a course and clicks "Manage Theory Content".
6. **Preconditions**: Course exists in DB (`STEP-001`).
7. **Business Justification**: Populates F-011 (Access Theory Course Content); without seeded content the course is a listing with nothing behind it.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "modules": "array (source: api_field)",
     "moduleTitle": "string (source: user_input)",
     "contentType": "string (source: user_input)",
     "contentUrl": "string (source: user_input)",
     "sequenceOrder": "number (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Click "Add New Module" button.
    - Fill Module Title, select type (Video, Document, Text), enter file URL or upload media.
    - Drag and drop to re-order modules.
11. **Screen Output Display**:
    - Re-orderable module list.
    - Upload progress bar and media preview player.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/courses/:id/modules
2. Params: id: string
3. Query: null
4. Server Business Logic:
   1. Validate course ID existence.
   2. Fetch ordered list of content modules attached to course ID.
   3. Return payload sorted by `sequenceOrder`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "id": "mod-1", "title": "Safety Overview", "contentType": "VIDEO", "contentUrl": "https://cdn.fifo.com/v1.mp4", "sequenceOrder": 1 }
     ]
   }
   ```
6. On empty retrieval response: Render empty state message "No theory modules added yet".
7. Screen data manipulation on success: Populate `modules` list in View Model.
8. Side Effects: null
9. Next Action: Stay on Content Builder page.
10. Errors:
    1. error-003:
       1. Code: 404
       2. Message: Course not found.
       3. Screen data manipulation on error: Display error message.
       4. Side Effects: Log missing course request.
       5. Next Action: Redirect to `/admin/courses`.

### 3.2. CREATE

1. Url route: /api/courses/:id/modules
2. Params: id: string
3. Query: null
4. Request body:
   ```json
   {
     "title": "Module 1: Site Rules",
     "contentType": "DOCUMENT",
     "contentUrl": "https://cdn.fifo.com/docs/mod1.pdf",
     "sequenceOrder": 1
   }
   ```
5. Server Business Logic:
   1. Verify Admin authentication.
   2. Insert module linked to course `id`.
   3. Update course `hasTheoryContent` flag.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "mod-2",
       "courseId": "crs-9901",
       "title": "Module 1: Site Rules",
       "contentType": "DOCUMENT",
       "contentUrl": "https://cdn.fifo.com/docs/mod1.pdf",
       "sequenceOrder": 1
     }
   }
   ```
7. Screen data manipulation on success: Append module to `modules` array.
8. Side Effects: Notify catalog builder service.
9. Next Action: Remain on screen to allow adding more modules.
10. Errors:
    1. error-004:
       1. Code: 400
       2. Message: Invalid document URL or title missing.
       3. Screen data manipulation on error: Show validation alert.
       4. Side Effects: null
       5. Next Action: Retain user inputs for modification.

### 3.3. DELETE

1. Url route: /api/courses/:id/modules/:moduleId
2. Params: id: string, moduleId: string
3. Query: null
4. Server Business Logic:
   1. Verify Admin authentication.
   2. Remove module record matching `moduleId`.
   3. Re-index sequence orders of remaining modules.
5. Response body schema:
   ```json
   { "success": true, "message": "Module deleted successfully" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove deleted item from `modules` View Model list.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-005:
       1. Code: 404
       2. Message: Module ID not found.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: Refresh modules list.
       5. Next Action: Stay on screen.

### 3.4. PATCH/PUT

1. Url route: /api/courses/:id/modules/:moduleId
2. Params: id: string, moduleId: string
3. Query: null
4. Request body:
   ```json
   {
     "title": "Updated Module 1 Title",
     "sequenceOrder": 2
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Update specified fields on module `moduleId`.
   3. Re-sort sequence orders.
6. Response body schema:
   ```json
   { "success": true, "data": { "id": "mod-2", "title": "Updated Module 1 Title", "sequenceOrder": 2 } }
   ```
7. Screen data manipulation on success: Update matching entry in View Model.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-006:
       1. Code: 400
       2. Message: Invalid module parameters.
       3. Screen data manipulation on error: Revert field values.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: Build Exam Question Bank (STEP-003)

1. **stepId**: STEP-003
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Exam Management - Question Bank Editor
5. **Trigger**: Admin clicks "Manage Question Bank" for a Theory or Mixed course.
6. **Preconditions**: Course exists with Theory or Mixed format (`STEP-001`).
7. **Business Justification**: Enables F-016/F-017 (auto-scored theory exam); question banks are what the auto-grading logic runs against.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "passThreshold": "number (source: user_input)",
     "timeLimitMinutes": "number (source: user_input)",
     "questions": "array (source: api_field)",
     "questionText": "string (source: user_input)",
     "options": "array (source: user_input)",
     "correctOptionIndex": "number (source: user_input)",
     "weight": "number (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Set exam settings: Pass threshold %, Time limit minutes.
    - Add question: Question prompt text, 4 options radio selections, mark correct option, weight score.
    - Click "Save Question Bank".
11. **Screen Output Display**:
    - Summary panel: Total questions, Max score, Pass score.
    - Question cards list with edit/delete controls.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/exams/courses/:courseId/question-bank
2. Params: courseId: string
3. Query: null
4. Server Business Logic:
   1. Verify Admin authentication.
   2. Retrieve exam configuration settings and question items for `courseId`.
   3. Hide internal answer keys if non-admin (Admin view includes correct option index).
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "courseId": "crs-9901",
       "passThreshold": 80,
       "timeLimitMinutes": 30,
       "questions": [
         {
           "id": "q-1",
           "questionText": "What is the maximum allowed anchor point height clearance?",
           "options": ["1.5m", "2.0m", "2.5m", "3.0m"],
           "correctOptionIndex": 1,
           "weight": 10
         }
       ]
     }
   }
   ```
6. On empty retrieval response: Render empty state "No questions in question bank yet."
7. Screen data manipulation on success: Populate View Model questions list and pass threshold inputs.
8. Side Effects: null
9. Next Action: Stay on Question Bank page.
10. Errors:
    1. error-007:
       1. Code: 404
       2. Message: Exam configuration missing for course.
       3. Screen data manipulation on error: Reset inputs to default values (Pass threshold 80%, Time limit 30m).
       4. Side Effects: null
       5. Next Action: Prompt Admin to initialize exam settings.

### 3.2. CREATE

1. Url route: /api/exams/courses/:courseId/questions
2. Params: courseId: string
3. Query: null
4. Request body:
   ```json
   {
     "questionText": "What safety harness check must be conducted before descent?",
     "options": ["Visual inspection of stitching", "Color check", "Weight test", "No check required"],
     "correctOptionIndex": 0,
     "weight": 10
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Validate question prompt non-empty and options count >= 2.
   3. Insert Question record linked to course exam bank.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "q-2",
       "questionText": "What safety harness check must be conducted before descent?",
       "options": ["Visual inspection of stitching", "Color check", "Weight test", "No check required"],
       "correctOptionIndex": 0,
       "weight": 10
     }
   }
   ```
7. Screen data manipulation on success: Append question item to View Model `questions`.
8. Side Effects: null
9. Next Action: Stay on screen for adding subsequent questions.
10. Errors:
    1. error-008:
       1. Code: 400
       2. Message: Correct option index out of bounds.
       3. Screen data manipulation on error: Highlight option selection.
       4. Side Effects: null
       5. Next Action: Stay on modal.

### 3.3. DELETE

1. Url route: /api/exams/questions/:questionId
2. Params: questionId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Delete question record matching `questionId`.
5. Response body schema:
   ```json
   { "success": true, "message": "Question removed from bank" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove question from View Model `questions`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-009:
       1. Code: 404
       2. Message: Question ID not found.
       3. Screen data manipulation on error: Show error toast.
       4. Side Effects: null
       5. Next Action: Refresh question list.

### 3.4. PATCH/PUT

1. Url route: /api/exams/courses/:courseId/settings
2. Params: courseId: string
3. Query: null
4. Request body:
   ```json
   {
     "passThreshold": 85,
     "timeLimitMinutes": 45
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Update pass threshold percentage and time limit settings for course exam.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "courseId": "crs-9901",
       "passThreshold": 85,
       "timeLimitMinutes": 45
     }
   }
   ```
7. Screen data manipulation on success: Update settings inputs in View Model.
8. Side Effects: null
9. Next Action: Show toast "Exam settings updated".
10. Errors:
    1. error-010:
       1. Code: 400
       2. Message: Threshold must be between 50 and 100 percent.
       3. Screen data manipulation on error: Highlight pass threshold input.
       4. Side Effects: null
       5. Next Action: Keep previous setting value.

---

## 2. OPERATIONAL SCENARIO: Configure Practical Assessment Criteria (STEP-004)

1. **stepId**: STEP-004
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Exam Management > Practical Criteria Editor
5. **Trigger**: Admin selects a Practical or Mixed course and clicks "Manage Practical Criteria".
6. **Preconditions**: Course exists with Practical or Mixed format (`STEP-001`).
7. **Business Justification**: Standardizes practical grading across instructors and sites, keeping certification consistent and defensible.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "criteriaList": "array (source: api_field)",
     "criterionTitle": "string (source: user_input)",
     "description": "string (source: user_input)",
     "isMandatory": "boolean (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Input Criteria Title, Description.
    - Checkbox "Mandatory Pass Item".
    - Click "Add Criteria Item".
11. **Screen Output Display**:
    - Criteria checklist table with mandatory badges.
    - Delete/Edit action buttons per item.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/practical-assessments/courses/:courseId/criteria
2. Params: courseId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Fetch list of evaluation criteria for practical session scoring.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "id": "crit-1", "title": "Pre-rigging inspection", "description": "Demonstrates proper harness tension and hook safety.", "isMandatory": true }
     ]
   }
   ```
6. On empty retrieval response: Render empty criteria message.
7. Screen data manipulation on success: Populate View Model `criteriaList`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-011:
       1. Code: 404
       2. Message: Course criteria not found.
       3. Screen data manipulation on error: Show empty state.
       4. Side Effects: null
       5. Next Action: Stay on page.

### 3.2. CREATE

1. Url route: /api/practical-assessments/courses/:courseId/criteria
2. Params: courseId: string
3. Query: null
4. Request body:
   ```json
   {
     "title": "Emergency Lowering Technique",
     "description": "Executes controlled manual descent within 60 seconds.",
     "isMandatory": true
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Insert new criterion for `courseId`.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "crit-2",
       "courseId": "crs-9901",
       "title": "Emergency Lowering Technique",
       "description": "Executes controlled manual descent within 60 seconds.",
       "isMandatory": true
     }
   }
   ```
7. Screen data manipulation on success: Append created criterion to View Model `criteriaList`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-012:
       1. Code: 400
       2. Message: Title is required.
       3. Screen data manipulation on error: Highlight title field.
       4. Side Effects: null
       5. Next Action: Retain user input.

### 3.3. DELETE

1. Url route: /api/practical-assessments/criteria/:criterionId
2. Params: criterionId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Delete evaluation criterion record.
5. Response body schema:
   ```json
   { "success": true, "message": "Criterion deleted" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove item from View Model `criteriaList`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-013:
       1. Code: 404
       2. Message: Criterion not found.
       3. Screen data manipulation on error: Show toast alert.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.4. PATCH/PUT

1. Url route: /api/practical-assessments/criteria/:criterionId
2. Params: criterionId: string
3. Query: null
4. Request body:
   ```json
   {
     "title": "Updated Criterion Title",
     "isMandatory": false
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Update specified criterion properties.
6. Response body schema:
   ```json
   { "success": true, "data": { "id": "crit-1", "title": "Updated Criterion Title", "isMandatory": false } }
   ```
7. Screen data manipulation on success: Update View Model list item.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-014:
       1. Code: 400
       2. Message: Invalid update payload.
       3. Screen data manipulation on error: Revert field values.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: Bulk Import Courses & Exams (STEP-005)

1. **stepId**: STEP-005
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Course Management > Import Wizard
5. **Trigger**: Admin selects "Bulk Import Curriculum" from Course Management.
6. **Preconditions**: Admin has a CSV/JSON file formatted per import specification.
7. **Business Justification**: Manually creating every course/exam one at a time is impractical when onboarding an entire certification body's curriculum; bulk seeding is needed for launch and for adding new accreditations later.
8. **Screen View Model**:
   ```json
   {
     "file": "object (source: user_input)",
     "importStatus": "string (source: api_field)",
     "importedCount": "number (source: api_field)",
     "errors": "array (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - File upload selector: Choose `.csv` or `.json` file.
    - Click "Validate & Process Import" button.
11. **Screen Output Display**:
    - Import progress indicator.
    - Summary results card (Imported count, Skipped count, Failure log table).

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A - Bulk import is driven by client file submit.
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.2. CREATE

1. Url route: /api/courses/bulk-import
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "fileData": "base64_encoded_csv_string",
     "formatType": "CSV"
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Parse uploaded file data into structured course, module, and question objects.
   3. Execute database transaction: insert courses, modules, and exam banks.
   4. If validation errors occur on row N, log row error and continue or rollback based on strategy.
   5. Return detailed summary of batch import.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "importStatus": "COMPLETED",
       "importedCount": 12,
       "failedCount": 1,
       "errors": [
         { "row": 5, "message": "Missing required field 'format' for course 'Basic Fire Safety'" }
       ]
     }
   }
   ```
7. Screen data manipulation on success: Populate View Model `importStatus`, `importedCount`, and `errors`.
8. Side Effects: Invalidate catalog caches.
9. Next Action: Render completion summary screen.
10. Errors:
    1. error-015:
       1. Code: 400
       2. Message: Invalid file format. Must be valid CSV or JSON.
       3. Screen data manipulation on error: Set `importStatus = "FAILED"`.
       4. Side Effects: null
       5. Next Action: Display file selector.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Publish/Unpublish Course (STEP-006)

1. **stepId**: STEP-006
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Course Management - Catalog Table
5. **Trigger**: Admin toggles the "Publish" switch on a course row.
6. **Preconditions**: Course exists and has mandatory content/questions assigned.
7. **Business Justification**: Prevents incomplete or unapproved courses (missing content, unreviewed exam questions) from being purchasable.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "isPublished": "boolean (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Click toggle switch for `isPublished` state on a course row.
11. **Screen Output Display**:
    - Status badge update ("Draft" / "Published").
    - Toast confirmation message.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/courses/admin/all
2. Params: null
3. Query: page: number, status: string
4. Server Business Logic:
   1. Authenticate Admin.
   2. Fetch all courses (both draft and published) with modules and exam count metadata.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "id": "crs-9901", "title": "Working at Heights", "format": "Mixed", "isPublished": false, "hasContent": true, "hasExam": true }
     ]
   }
   ```
6. On empty retrieval response: Show empty table state.
7. Screen data manipulation on success: Render courses in catalog table.
8. Side Effects: null
9. Next Action: Stay on catalog table screen.
10. Errors:
    1. error-016:
       1. Code: 401
       2. Message: Unauthorized Admin access.
       3. Screen data manipulation on error: Clear table.
       4. Side Effects: null
       5. Next Action: Redirect to login.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: /api/courses/:id/publish
2. Params: id: string
3. Query: null
4. Request body:
   ```json
   {
     "isPublished": true
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Inspect course readiness: verify course has content (if Theory/Mixed) and question bank or criteria.
   3. Update `isPublished` field in DB.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "crs-9901",
       "isPublished": true,
       "updatedAt": "2026-08-01T08:10:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Toggle status badge to "Published" in View Model.
8. Side Effects: Invalidate public catalog search cache.
9. Next Action: Stay on screen.
10. Errors:
    1. error-017:
       1. Code: 422
       2. Message: Cannot publish course: Theory content or exam question bank missing.
       3. Screen data manipulation on error: Keep toggle switch in OFF position.
       4. Side Effects: Display warning modal with missing requirements checklist.
       5. Next Action: Remain on page.

---

## 2. OPERATIONAL SCENARIO: Assign Certification Gaps (STEP-007)

1. **stepId**: STEP-007
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Learner Profile > Certifications Management
5. **Trigger**: Admin reviews CV parsing audit and opens applicant's certification gap tab.
6. **Preconditions**: Applicant account exists; Admin has reviewed CV data.
7. **Business Justification**: Ensures gap data is accurate per learner rather than relying on error-prone auto-detection, protecting placement quality.
8. **Screen View Model**:
   ```json
   {
     "learnerId": "string (source: api_field)",
     "learnerName": "string (source: api_field)",
     "certificationGaps": "array (source: api_field)",
     "selectedCertId": "string (source: user_input)",
     "gapStatus": "string (source: user_input)",
     "notes": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Cautious
   2. Target Emotions: Confident
10. **Screen Input Actions**:
    - Select certification ticket from dropdown.
    - Mark status: `Missing` or `Expired`.
    - Enter review notes.
    - Click "Assign Gap to Learner".
11. **Screen Output Display**:
    - Current certification matrix table (Cert Title, Status, Assigned Date, Action buttons).
    - Confirmation notification.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/learners/:id/gaps
2. Params: id: string
3. Query: null
4. Server Business Logic:
   1. Verify Admin authentication.
   2. Query LearnerCertification table for specified learner ID.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "learnerId": "lrn-5001",
       "learnerName": "John Doe",
       "gaps": [
         { "gapId": "gap-10", "certificationTypeId": "cert-101", "name": "Working at Heights", "status": "Missing", "assignedAt": "2026-08-01T07:30:00Z" }
       ]
     }
   }
   ```
6. On empty retrieval response: Show "No certification gaps flagged for this applicant".
7. Screen data manipulation on success: Populate View Model `certificationGaps`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-018:
       1. Code: 404
       2. Message: Learner ID not found.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Redirect to learner list.

### 3.2. CREATE

1. Url route: /api/learners/:id/gaps
2. Params: id: string
3. Query: null
4. Request body:
   ```json
   {
     "certificationTypeId": "cert-102",
     "status": "Missing",
     "notes": "CV does not present active Confined Space ticket."
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Ensure certification gap is not already active for learner.
   3. Create LearnerCertification entry with status `Missing` or `Expired`.
   4. Create background notification event for learner (F-023).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "gapId": "gap-11",
       "learnerId": "lrn-5001",
       "certificationTypeId": "cert-102",
       "name": "Confined Space Entry",
       "status": "Missing",
       "assignedAt": "2026-08-01T08:15:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Add newly assigned gap to View Model list.
8. Side Effects: Trigger Notification dispatch to learner inbox.
9. Next Action: Stay on screen.
10. Errors:
    1. error-019:
       1. Code: 409
       2. Message: Certification gap already flagged for this learner.
       3. Screen data manipulation on error: Show alert banner.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.3. DELETE

1. Url route: /api/learners/:id/gaps/:gapId
2. Params: id: string, gapId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Remove assigned gap record for learner.
5. Response body schema:
   ```json
   { "success": true, "message": "Certification gap revoked" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove entry from View Model `certificationGaps`.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-020:
       1. Code: 404
       2. Message: Gap ID not found.
       3. Screen data manipulation on error: Refresh list.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.4. PATCH/PUT

1. Url route: /api/learners/:id/gaps/:gapId
2. Params: id: string, gapId: string
3. Query: null
4. Request body:
   ```json
   {
     "status": "Expired"
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Update certification status for specified gap.
6. Response body schema:
   ```json
   { "success": true, "data": { "gapId": "gap-11", "status": "Expired" } }
   ```
7. Screen data manipulation on success: Update status column in View Model.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-021:
       1. Code: 400
       2. Message: Invalid gap status value.
       3. Screen data manipulation on error: Revert field display.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: View My Certification Gaps (STEP-008)

1. **stepId**: STEP-008
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: My Certifications Overview
5. **Trigger**: Learner logs into LMS / Training Portal or accesses referral link.
6. **Preconditions**: Learner account exists with gaps assigned by Admin (`STEP-007`).
7. **Business Justification**: Reduces support load by letting learners self-serve on what they still need before they can be placed.
8. **Screen View Model**:
   ```json
   {
     "learnerId": "string (source: api_field)",
     "targetRole": "string (source: api_field)",
     "certificationGaps": "array (source: api_field)",
     "totalGapsCount": "number (source: derived)",
     "validCount": "number (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Uncertain
   2. Target Emotions: Clear
10. **Screen Input Actions**:
    - Click "Browse Courses for Gaps" button on any gap item card.
11. **Screen Output Display**:
    - Target FIFO role summary banner.
    - Certification matrix cards displaying status tags (`Missing`, `Expired`, `Valid`).

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/learners/me/gaps
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner session token.
   2. Fetch target role requirements and learner's current cert status.
   3. Return structured gap list.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "learnerId": "lrn-5001",
       "targetRole": "Rigging Specialist",
       "certifications": [
         { "certId": "cert-101", "name": "Working at Heights Ticket", "status": "Missing", "isActionRequired": true },
         { "certId": "cert-102", "name": "First Aid Certificate", "status": "Valid", "isActionRequired": false }
       ]
     }
   }
   ```
6. On empty retrieval response: Display "All required certifications are valid and compliant!" banner.
7. Screen data manipulation on success: Populate View Model `targetRole` and `certificationGaps`.
8. Side Effects: null
9. Next Action: Learner can click browse courses button.
10. Errors:
    1. error-022:
       1. Code: 401
       2. Message: Session expired. Please log in.
       3. Screen data manipulation on error: Clear learner data.
       4. Side Effects: null
       5. Next Action: Redirect to `/login`.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A - Read-only view for learner.
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Certification Expiry Alerts (STEP-009)

1. **stepId**: STEP-009
2. **Actor**: Learner / Admin
3. **isImplemented**: false
4. **Screen**: My Certifications - Expiry Warning Banner & Badges
5. **Trigger**: Learner views My Certifications page, or Admin views Learner Profile, when cert expiry is within 30/60/90 days.
6. **Preconditions**: Learner has certifications with `validUntil` date recorded.
7. **Business Justification**: Prevents placed workers from being pulled off-site for lapsed tickets, protecting client relationships.
8. **Screen View Model**:
   ```json
   {
     "expiringCertifications": "array (source: api_field)",
     "daysUntilExpiry": "number (source: derived)",
     "alertSeverity": "string (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Unaware
   2. Target Emotions: Prepared
10. **Screen Input Actions**:
    - Click "Renew Course" action link on expiry warning alert.
11. **Screen Output Display**:
    - Amber/Red alert banner at top of certifications screen.
    - Countdown tag e.g. "Expires in 14 days".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/learners/me/expiring-certifications
2. Params: null
3. Query: thresholdDays: number
4. Server Business Logic:
   1. Authenticate user session.
   2. Find all active certificates for learner where `validUntil` <= CURRENT_DATE + thresholdDays.
   3. Calculate exact `daysUntilExpiry`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "certificateId": "cert-rec-88", "name": "Confined Space Entry", "validUntil": "2026-08-15T00:00:00Z", "daysRemaining": 14 }
     ]
   }
   ```
6. On empty retrieval response: Render green compliance check badge "No expiring certifications".
7. Screen data manipulation on success: Populate View Model `expiringCertifications`.
8. Side Effects: null
9. Next Action: Render renewal CTA.
10. Errors:
    1. error-023:
       1. Code: 500
       2. Message: Failed to calculate expiry statuses.
       3. Screen data manipulation on error: Show general error state.
       4. Side Effects: Log server error.
       5. Next Action: Stay on screen.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Browse Courses for My Gaps (STEP-010)

1. **stepId**: STEP-010
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Course Catalog - Recommended Courses
5. **Trigger**: Learner clicks "Browse Courses for Gaps" from My Certifications.
6. **Preconditions**: Learner has active certification gaps.
7. **Business Justification**: Cuts decision friction and drives conversion by only surfacing relevant, purchasable courses.
8. **Screen View Model**:
   ```json
   {
     "mappedCourses": "array (source: api_field)",
     "gapFilter": "string (source: user_input)",
     "searchQuery": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Overwhelmed
   2. Target Emotions: Focused
10. **Screen Input Actions**:
    - Filter courses by gap ticket.
    - Type search query.
    - Click "View Course Details".
11. **Screen Output Display**:
    - Course cards grid pre-filtered by assigned gaps.
    - Gap badge label e.g., "Satisfies your Missing Gap: Working at Heights".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/courses/catalog/my-gaps
2. Params: null
3. Query: gapId: string
4. Server Business Logic:
   1. Authenticate learner token.
   2. Query learner's active certification gaps.
   3. Fetch published courses matching the target certification types for those gaps.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "crs-9901",
         "title": "Working at Heights Safety Course",
         "format": "Mixed",
         "price": 350.00,
         "satisfiesGap": "Working at Heights Ticket",
         "isEnrolled": false
       }
     ]
   }
   ```
6. On empty retrieval response: Render "No available courses found for your gaps at this time."
7. Screen data manipulation on success: Populate View Model `mappedCourses`.
8. Side Effects: null
9. Next Action: Learner selects course for enrollment.
10. Errors:
    1. error-024:
       1. Code: 400
       2. Message: Invalid gap filter parameter.
       3. Screen data manipulation on error: Clear filter.
       4. Side Effects: null
       5. Next Action: Display unfiltered list.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Course Format Indicator (STEP-011)

1. **stepId**: STEP-011
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Course Catalog / Course Details Card
5. **Trigger**: Learner views course card or details modal in catalog.
6. **Preconditions**: Course catalog loaded (`STEP-010`).
7. **Business Justification**: Sets accurate expectations up front, reducing complaints and refund requests from mismatched expectations.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "title": "string (source: api_field)",
     "format": "string (source: api_field)",
     "formatBadgeColor": "string (source: derived)",
     "hasTheory": "boolean (source: derived)",
     "hasPractical": "boolean (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Unsure
   2. Target Emotions: Informed
10. **Screen Input Actions**:
    - Click "Format Info" icon to expand format breakdown tooltip.
11. **Screen Output Display**:
    - Format pill badge: `Theory Only` (Blue), `Practical Only` (Green), `Mixed` (Purple).
    - Detailed requirement breakdown text.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/courses/:id
2. Params: id: string
3. Query: null
4. Server Business Logic:
   1. Retrieve detailed course record matching `id`.
   2. Extract format attributes and component flags (`hasTheory`, `hasPractical`).
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "id": "crs-9901",
       "title": "Working at Heights Safety Course",
       "format": "Mixed",
       "hasTheory": true,
       "hasPractical": true,
       "description": "Requires online theory completion followed by a 1-day practical assessment."
     }
   }
   ```
6. On empty retrieval response: Show error modal "Course details unavailable".
7. Screen data manipulation on success: Compute `formatBadgeColor` and update View Model.
8. Side Effects: null
9. Next Action: Learner can click Enroll button.
10. Errors:
    1. error-025:
       1. Code: 404
       2. Message: Course not found.
       3. Screen data manipulation on error: Clear modal content.
       4. Side Effects: null
       5. Next Action: Close modal.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Select & Enroll in Course(s) (STEP-012)

1. **stepId**: STEP-012
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Course Catalog - Enrollment Cart Drawer
5. **Trigger**: Learner clicks "Add to Enrollment Cart" or "Enroll Now" on course cards.
6. **Preconditions**: Learner selected one or more published courses.
7. **Business Justification**: Lets learners batch multiple gaps into a single enrollment/payment flow, increasing basket size.
8. **Screen View Model**:
   ```json
   {
     "selectedCourses": "array (source: user_input)",
     "subtotal": "number (source: derived)",
     "appliedSubsidies": "array (source: api_field)",
     "totalDue": "number (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Undecided
   2. Target Emotions: Ready
10. **Screen Input Actions**:
    - Click "Add to Cart" button.
    - Remove item from cart drawer.
    - Click "Proceed to Checkout".
11. **Screen Output Display**:
    - Slide-out Cart Drawer showing selected courses, prices, subsidies, and total due.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/enrollments/cart
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Fetch active pending cart items for learner.
   3. Check for any pre-assigned subsidies (F-008) for these courses.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "items": [
         { "courseId": "crs-9901", "title": "Working at Heights", "price": 350.00, "subsidyAmount": 100.00 }
       ],
       "subtotal": 350.00,
       "totalSubsidy": 100.00,
       "totalDue": 250.00
     }
   }
   ```
6. On empty retrieval response: Render empty cart view "Your enrollment cart is empty".
7. Screen data manipulation on success: Update View Model cart items and total calculations.
8. Side Effects: null
9. Next Action: Learner can click proceed to checkout.
10. Errors:
    1. error-026:
       1. Code: 401
       2. Message: User authentication invalid.
       3. Screen data manipulation on error: Clear cart display.
       4. Side Effects: null
       5. Next Action: Redirect to login.

### 3.2. CREATE

1. Url route: /api/enrollments/cart/items
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "courseId": "crs-9901"
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Check if course is already in active cart or already enrolled/completed.
   3. Add course item to cart.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "courseId": "crs-9901",
       "addedAt": "2026-08-01T08:20:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Open cart drawer and highlight added course.
8. Side Effects: Update cart counter badge in header.
9. Next Action: Stay on screen with drawer open.
10. Errors:
    1. error-027:
       1. Code: 409
       2. Message: Course already enrolled or in cart.
       3. Screen data manipulation on error: Show info toast "Course is already in your cart".
       4. Side Effects: null
       5. Next Action: Open cart drawer.

### 3.3. DELETE

1. Url route: /api/enrollments/cart/items/:courseId
2. Params: courseId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Remove specified course item from pending cart.
5. Response body schema:
   ```json
   { "success": true, "message": "Item removed from cart" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove item from `selectedCourses` View Model array.
8. Side Effects: Recalculate totals.
9. Next Action: Stay on cart drawer.
10. Errors:
    1. error-028:
       1. Code: 404
       2. Message: Cart item not found.
       3. Screen data manipulation on error: Refresh cart.
       4. Side Effects: null
       5. Next Action: Stay on cart.

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Apply Fee Subsidy (STEP-013)

1. **stepId**: STEP-013
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Learner Profile > Payments & Subsidies Panel
5. **Trigger**: Admin selects an enrolled/pending course for a learner and clicks "Grant Subsidy".
6. **Preconditions**: Learner has pending course enrollment; Admin has permissions.
7. **Business Justification**: Lets the business use subsidies as a lever to fast-track placement-critical candidates without a manual side process.
8. **Screen View Model**:
   ```json
   {
     "learnerId": "string (source: api_field)",
     "courseId": "string (source: api_field)",
     "subsidyType": "string (source: user_input)",
     "subsidyAmount": "number (source: user_input)",
     "reason": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Constrained
   2. Target Emotions: Enabled
10. **Screen Input Actions**:
    - Select subsidy type (`Fixed Amount` or `Percentage`).
    - Enter subsidy value (e.g. 100.00 or 50%).
    - Enter internal reason text.
    - Click "Apply Subsidy".
11. **Screen Output Display**:
    - Subsidy configuration modal.
    - Updated payment breakdown panel.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/subsidies/learners/:learnerId
2. Params: learnerId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Fetch active and applied subsidies for specified learner.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "subsidyId": "sub-1", "courseId": "crs-9901", "amount": 100.00, "reason": "Priority placement candidate", "appliedAt": "2026-08-01T08:00:00Z" }
     ]
   }
   ```
6. On empty retrieval response: Render "No active subsidies applied for this learner".
7. Screen data manipulation on success: Populate View Model subsidies list.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-029:
       1. Code: 404
       2. Message: Learner record not found.
       3. Screen data manipulation on error: Show error message.
       4. Side Effects: null
       5. Next Action: Redirect to learner list.

### 3.2. CREATE

1. Url route: /api/subsidies
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "learnerId": "lrn-5001",
     "courseId": "crs-9901",
     "subsidyType": "FIXED",
     "subsidyAmount": 100.00,
     "reason": "Priority placement candidate"
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Validate subsidy amount <= course full price.
   3. Record Subsidy entry linked to learner and course.
   4. Trigger mandatory learner notification dispatch (F-009).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "subsidyId": "sub-2",
       "learnerId": "lrn-5001",
       "courseId": "crs-9901",
       "subsidyAmount": 100.00,
       "appliedAt": "2026-08-01T08:25:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Update learner payment panel display with subsidy tag.
8. Side Effects: Trigger Notification dispatch e.g. "Fee Subsidy Applied!".
9. Next Action: Close modal.
10. Errors:
    1. error-030:
       1. Code: 400
       2. Message: Subsidy amount exceeds course price.
       3. Screen data manipulation on error: Highlight subsidy amount field.
       4. Side Effects: null
       5. Next Action: Stay on modal.

### 3.3. DELETE

1. Url route: /api/subsidies/:subsidyId
2. Params: subsidyId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Revoke specified subsidy record if unredeemed.
5. Response body schema:
   ```json
   { "success": true, "message": "Subsidy revoked successfully" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove subsidy from View Model.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-031:
       1. Code: 409
       2. Message: Cannot revoke subsidy after payment completion.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Subsidy Notification (STEP-014)

1. **stepId**: STEP-014
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Notifications Modal & Cart Subsidy Banner
5. **Trigger**: Learner receives notification alert when Admin applies subsidy (`STEP-013`).
6. **Preconditions**: Admin applied subsidy to learner's enrollment.
7. **Business Justification**: Builds trust and goodwill, and makes the subsidy value visible so it's felt as a benefit, not silent.
8. **Screen View Model**:
   ```json
   {
     "notificationId": "string (source: api_field)",
     "courseTitle": "string (source: api_field)",
     "originalPrice": "number (source: api_field)",
     "subsidyAmount": "number (source: api_field)",
     "finalPrice": "number (source: api_field)",
     "isRead": "boolean (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Unaware
   2. Target Emotions: Appreciative
10. **Screen Input Actions**:
    - Click "View Discounted Checkout" in notification popover.
    - Click "Mark as Read".
11. **Screen Output Display**:
    - Highlighted banner e.g. "Good news! You received a $100 fee subsidy for Working at Heights Safety Course".
    - Discount badge on Checkout button.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/notifications/my-subsidies
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Query notifications filtered by type `SUBSIDY_APPLIED`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "notif-100",
         "courseTitle": "Working at Heights Safety Course",
         "originalPrice": 350.00,
         "subsidyAmount": 100.00,
         "finalPrice": 250.00,
         "createdAt": "2026-08-01T08:25:00Z",
         "isRead": false
       }
     ]
   }
   ```
6. On empty retrieval response: Return empty array.
7. Screen data manipulation on success: Update View Model with subsidy notifications list.
8. Side Effects: null
9. Next Action: Render notification banner.
10. Errors:
    1. error-032:
       1. Code: 401
       2. Message: Unauthorized request.
       3. Screen data manipulation on error: Clear notifications list.
       4. Side Effects: null
       5. Next Action: Redirect to login.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A - Triggered internally on subsidy assignment.
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: /api/notifications/:id/read
2. Params: id: string
3. Query: null
4. Request body:
   ```json
   {
     "isRead": true
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Mark notification `id` as read.
6. Response body schema:
   ```json
   { "success": true, "message": "Notification marked as read" }
   ```
7. Screen data manipulation on success: Set `isRead = true` in View Model item.
8. Side Effects: Decrement unread notification counter.
9. Next Action: Stay on screen.
10. Errors:
    1. error-033:
       1. Code: 404
       2. Message: Notification not found.
       3. Screen data manipulation on error: Refresh inbox.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: Course Fee Checkout (STEP-015)

1. **stepId**: STEP-015
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Checkout & Payment Gateway Page
5. **Trigger**: Learner clicks "Proceed to Checkout" from Cart.
6. **Preconditions**: Learner has selected courses in cart; net fee calculated (factoring subsidies).
7. **Business Justification**: Core revenue mechanism for the training arm.
8. **Screen View Model**:
   ```json
   {
     "cartItems": "array (source: api_field)",
     "grossAmount": "number (source: api_field)",
     "subsidyDiscount": "number (source: api_field)",
     "netAmountPayable": "number (source: api_field)",
     "paymentMethod": "string (source: user_input)",
     "cardDetails": "object (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Hesitant
   2. Target Emotions: Assured
10. **Screen Input Actions**:
    - Select Payment Method (Credit Card / Employer Voucher).
    - Input Cardholder Name, Number, Expiry, CVV.
    - Click "Complete Secure Payment".
11. **Screen Output Display**:
    - Itemized order summary panel (Gross total, Subsidies applied, Net Total).
    - Encrypted payment gateway input form with SSL security seals.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/payments/checkout-summary
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Fetch active cart items and compute final gross and net fees including subsidies.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "items": [
         { "courseId": "crs-9901", "title": "Working at Heights Safety Course", "price": 350.00 }
       ],
       "grossAmount": 350.00,
       "subsidyDiscount": 100.00,
       "netAmountPayable": 250.00
     }
   }
   ```
6. On empty retrieval response: Redirect to catalog with message "Cart is empty".
7. Screen data manipulation on success: Populate View Model fields (`grossAmount`, `subsidyDiscount`, `netAmountPayable`).
8. Side Effects: null
9. Next Action: Learner enters card details.
10. Errors:
    1. error-034:
       1. Code: 400
       2. Message: Invalid cart contents.
       3. Screen data manipulation on error: Show alert.
       4. Side Effects: null
       5. Next Action: Redirect to `/catalog`.

### 3.2. CREATE

1. Url route: /api/payments/charge
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "paymentMethod": "CREDIT_CARD",
     "paymentToken": "tok_stripe_12345",
     "amount": 250.00
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Verify net payable amount matches current cart state.
   3. Dispatch charge transaction to payment processor gateway.
   4. On payment gateway approval, create Enrollment records for all cart courses with status `ACTIVE`.
   5. Clear learner cart.
   6. Generate Receipt record (F-010).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "transactionId": "txn-88901",
       "receiptId": "rec-4001",
       "status": "PAID",
       "paidAmount": 250.00,
       "enrollmentIds": ["enr-701"]
     }
   }
   ```
7. Screen data manipulation on success: Display payment success screen.
8. Side Effects: Dispatch email confirmation receipt; trigger notification.
9. Next Action: Redirect to `/my-payments/receipts/rec-4001`.
10. Errors:
    1. error-035:
       1. Code: 402
       2. Message: Payment declined by issuing bank.
       3. Screen data manipulation on error: Display payment failure alert.
       4. Side Effects: Log failed transaction attempt.
       5. Next Action: Remain on payment form for retry.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Payment Receipt & Invoice (STEP-016)

1. **stepId**: STEP-016
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: My Payments - Receipt View
5. **Trigger**: Successful payment response from payment gateway (`STEP-015`).
6. **Preconditions**: Transaction recorded in DB.
7. **Business Justification**: Provides a transparent paper trail for both learner and finance/audit purposes.
8. **Screen View Model**:
   ```json
   {
     "receiptId": "string (source: api_field)",
     "transactionDate": "string (source: api_field)",
     "items": "array (source: api_field)",
     "totalPaid": "number (source: api_field)",
     "subsidyCovered": "number (source: api_field)",
     "paymentMethod": "string (source: api_field)",
     "invoicePdfUrl": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Uncertain
   2. Target Emotions: Reassured
10. **Screen Input Actions**:
    - Click "Download PDF Invoice" button.
    - Click "Go to My Courses".
11. **Screen Output Display**:
    - Official Aveling tax invoice view (Receipt #, Date, Items, Subsidy credit, GST, Total Paid).
    - Download PDF link button.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/payments/receipts/:id
2. Params: id: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Retrieve receipt record matching `id` verifying learner ownership.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "receiptId": "rec-4001",
       "transactionDate": "2026-08-01T08:30:00Z",
       "items": [
         { "courseTitle": "Working at Heights Safety Course", "price": 350.00 }
       ],
       "grossAmount": 350.00,
       "subsidyCovered": 100.00,
       "totalPaid": 250.00,
       "paymentMethod": "CREDIT_CARD (ending **** 4242)",
       "invoicePdfUrl": "https://cdn.fifo.com/invoices/rec-4001.pdf"
     }
   }
   ```
6. On empty retrieval response: Display error "Receipt not found".
7. Screen data manipulation on success: Populate View Model receipt values.
8. Side Effects: null
9. Next Action: Learner can click download PDF or navigate to course player.
10. Errors:
    1. error-036:
       1. Code: 404
       2. Message: Receipt record not found or access unauthorized.
       3. Screen data manipulation on error: Show notification.
       4. Side Effects: null
       5. Next Action: Redirect to `/my-payments`.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Access Theory Course Content (STEP-017)

1. **stepId**: STEP-017
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Course Player - Theory Content Player
5. **Trigger**: Learner clicks "Start Learning" on an enrolled Theory or Mixed course.
6. **Preconditions**: Learner is enrolled and payment/subsidy completed.
7. **Business Justification**: Core delivery mechanism for the theory portion of Theory-only and Mixed courses.
8. **Screen View Model**:
   ```json
   {
     "enrollmentId": "string (source: api_field)",
     "courseTitle": "string (source: api_field)",
     "modules": "array (source: api_field)",
     "activeModuleId": "string (source: user_input)",
     "contentUrl": "string (source: api_field)",
     "contentType": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Neutral
   2. Target Emotions: Engaged
10. **Screen Input Actions**:
    - Click module item in navigation sidebar.
    - Click "Mark Module Complete & Next".
11. **Screen Output Display**:
    - Video player / Document viewer in primary view.
    - Collapsible sidebar list of modules with checkmarks for completed items.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/learners/me/enrollments/:enrollmentId/player
2. Params: enrollmentId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Verify active enrollment for `enrollmentId`.
   3. Fetch module list and completion flags for learner.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "enrollmentId": "enr-701",
       "courseTitle": "Working at Heights Safety Course",
       "modules": [
         { "id": "mod-1", "title": "Safety Overview", "contentType": "VIDEO", "contentUrl": "https://cdn.fifo.com/v1.mp4", "isCompleted": true },
         { "id": "mod-2", "title": "Harness Inspection", "contentType": "DOCUMENT", "contentUrl": "https://cdn.fifo.com/d1.pdf", "isCompleted": false }
       ]
     }
   }
   ```
6. On empty retrieval response: Display error "Enrollment content unavailable".
7. Screen data manipulation on success: Set `modules` and select first uncompleted module as `activeModuleId`.
8. Side Effects: null
9. Next Action: Learner views media content.
10. Errors:
    1. error-037:
       1. Code: 403
       2. Message: Enrollment inactive or unpaid.
       3. Screen data manipulation on error: Clear course player.
       4. Side Effects: null
       5. Next Action: Redirect to `/checkout`.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: /api/learners/me/enrollments/:enrollmentId/progress
2. Params: enrollmentId: string
3. Query: null
4. Request body:
   ```json
   {
     "completedModuleId": "mod-2"
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Mark module `mod-2` completed for learner enrollment.
   3. Recalculate total course theory progress percentage.
   4. If all theory modules completed, update `isTheoryComplete = true`.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "enrollmentId": "enr-701",
       "progressPercentage": 100,
       "isTheoryComplete": true
     }
   }
   ```
7. Screen data manipulation on success: Show completion checkmark on sidebar module item and update progress bar.
8. Side Effects: Unlock theory exam (F-016) and unlock practical booking gate if Mixed format (F-015).
9. Next Action: Prompt "Theory modules complete! Take Theory Exam or Book Practical Session".
10. Errors:
    1. error-038:
       1. Code: 400
       2. Message: Invalid module ID.
       3. Screen data manipulation on error: Show warning toast.
       4. Side Effects: null
       5. Next Action: Stay on module view.

---

## 2. OPERATIONAL SCENARIO: Track Theory Progress (STEP-018)

1. **stepId**: STEP-018
2. **Actor**: Learner / Admin
3. **isImplemented**: false
4. **Screen**: Course Player Sidebar / Learner Profile Progress Bar
5. **Trigger**: Learner completes a theory module or Admin views Learner Profile.
6. **Preconditions**: Active theory enrollment.
7. **Business Justification**: Lets admin verify a learner has actually covered material before permitting an exam attempt or practical booking.
8. **Screen View Model**:
   ```json
   {
     "enrollmentId": "string (source: api_field)",
     "completedModulesCount": "number (source: api_field)",
     "totalModulesCount": "number (source: api_field)",
     "progressPercentage": "number (source: derived)",
     "isTheoryComplete": "boolean (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Unsure
   2. Target Emotions: On track
10. **Screen Input Actions**:
    - Hover over progress bar for module breakdown.
11. **Screen Output Display**:
    - Progress bar e.g. "75% Completed (3 of 4 Modules)".
    - Status badge: "In Progress" or "Theory Completed".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/learners/me/enrollments/:enrollmentId/progress
2. Params: enrollmentId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate user session.
   2. Calculate ratio of completed modules to total course modules.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "enrollmentId": "enr-701",
       "completedModulesCount": 3,
       "totalModulesCount": 4,
       "progressPercentage": 75,
       "isTheoryComplete": false
     }
   }
   ```
6. On empty retrieval response: Return progress 0%.
7. Screen data manipulation on success: Update `progressPercentage` in View Model.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-039:
       1. Code: 404
       2. Message: Enrollment progress missing.
       3. Screen data manipulation on error: Reset progress bar to 0%.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Practical Prerequisite Gate (STEP-019)

1. **stepId**: STEP-019
2. **Actor**: System / Learner
3. **isImplemented**: false
4. **Screen**: Practical Scheduling - Locked / Prerequisites Check Screen
5. **Trigger**: Learner attempts to book practical session for a Mixed course.
6. **Preconditions**: Course format is Mixed.
7. **Business Justification**: Mirrors real-world certification bodies' requirement that theory precede practical, avoiding wasted training slots.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "courseFormat": "string (source: api_field)",
     "isTheoryPassed": "boolean (source: api_field)",
     "isGateLocked": "boolean (source: derived)",
     "lockReason": "string (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Impatient
   2. Target Emotions: Reassured
10. **Screen Input Actions**:
    - Click "Return to Theory Modules" button if locked.
11. **Screen Output Display**:
    - Lock icon banner with message: "Practical booking is locked until you complete all theory modules and pass the theory exam."
    - Sequence status steps list.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/practical-sessions/prerequisite-check/:courseId
2. Params: courseId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Query course format for `courseId`.
   3. If format is `Mixed`, check if learner has passed the theory exam or completed all theory modules.
   4. Return gate check status: `isGateLocked = true` if prerequisites unfulfilled.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "courseId": "crs-9901",
       "courseFormat": "Mixed",
       "isTheoryPassed": false,
       "isGateLocked": true,
       "lockReason": "You must pass the Theory Exam before booking a practical training session."
     }
   }
   ```
6. On empty retrieval response: Unlock gate if format is Practical Only.
7. Screen data manipulation on success: Update View Model `isGateLocked` and `lockReason`.
8. Side Effects: null
9. Next Action: If unlocked, proceed to slot selection (`STEP-020`); if locked, show lock banner.
10. Errors:
    1. error-040:
       1. Code: 404
       2. Message: Course prerequisite rule not found.
       3. Screen data manipulation on error: Set gate locked by default.
       4. Side Effects: null
       5. Next Action: Contact support.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Book Practical Session (STEP-020)

1. **stepId**: STEP-020
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Practical Scheduling - Slot Selector
5. **Trigger**: Learner passes prerequisite gate (`STEP-019`) for Mixed course or opens booking for Practical-only course.
6. **Preconditions**: Enrollment paid; theory completed if Mixed course.
7. **Business Justification**: Practical training requires physical capacity planning (instructors, equipment, venue), so bookable slots prevent overbooking.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "availableSlots": "array (source: api_field)",
     "selectedSlotId": "string (source: user_input)",
     "location": "string (source: api_field)",
     "instructorName": "string (source: api_field)",
     "remainingCapacity": "number (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Uncertain
   2. Target Emotions: Organized
10. **Screen Input Actions**:
    - Calendar date selection.
    - Radio selection of time slot e.g., "Aug 12, 2026 - 08:00 AM to 12:00 PM (Perth Site A)".
    - Click "Confirm Booking".
11. **Screen Output Display**:
    - Interactive calendar slot picker.
    - Booking confirmation summary card (Date, Time, Venue Address, Instructor, Capacity status).

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/practical-sessions/available-slots
2. Params: null
3. Query: courseId: string, date: string
4. Server Business Logic:
   1. Authenticate Learner.
   2. Query scheduled practical session slots for `courseId`.
   3. Filter out slots where booked learners count >= slot capacity.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       {
         "slotId": "slot-301",
         "startTime": "2026-08-12T08:00:00Z",
         "endTime": "2026-08-12T12:00:00Z",
         "location": "Aveling Perth South Training Center",
         "instructorName": "Mark Taylor",
         "remainingCapacity": 4
       }
     ]
   }
   ```
6. On empty retrieval response: Render "No available practical slots for selected date".
7. Screen data manipulation on success: Render slot list in calendar selector.
8. Side Effects: null
9. Next Action: Learner selects a slot and clicks confirm.
10. Errors:
    1. error-041:
       1. Code: 400
       2. Message: Invalid course ID parameter.
       3. Screen data manipulation on error: Clear calendar.
       4. Side Effects: null
       5. Next Action: Redirect to course list.

### 3.2. CREATE

1. Url route: /api/practical-sessions/bookings
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "courseId": "crs-9901",
     "slotId": "slot-301"
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Execute transaction: check slot capacity atomically.
   3. Create Booking record for learner.
   4. Decrement slot `remainingCapacity`.
   5. Generate booking confirmation notification (F-023).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "bookingId": "bk-901",
       "slotId": "slot-301",
       "status": "CONFIRMED",
       "location": "Aveling Perth South Training Center",
       "sessionTime": "2026-08-12T08:00:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Render booking confirmed card with venue directions link.
8. Side Effects: Send calendar invite email to learner.
9. Next Action: Show confirmation toast.
10. Errors:
    1. error-042:
       1. Code: 409
       2. Message: Slot fully booked. Please select another slot.
       3. Screen data manipulation on error: Refresh available slots list.
       4. Side Effects: null
       5. Next Action: Retain user on calendar view.

### 3.3. DELETE

1. Url route: /api/practical-sessions/bookings/:bookingId
2. Params: bookingId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Verify cancellation deadline (> 24 hours prior).
   3. Cancel booking and increment slot `remainingCapacity`.
5. Response body schema:
   ```json
   { "success": true, "message": "Booking cancelled successfully" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Reset slot selector view.
8. Side Effects: Send cancellation email.
9. Next Action: Stay on calendar view.
10. Errors:
    1. error-043:
       1. Code: 400
       2. Message: Cancellation deadline passed. Contact support.
       3. Screen data manipulation on error: Show warning modal.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Mark Practical Attendance & Completion (STEP-021)

1. **stepId**: STEP-021
2. **Actor**: Instructor / Admin
3. **isImplemented**: false
4. **Screen**: Session Roster & Attendance Sheet
5. **Trigger**: Instructor accesses roster during or after a scheduled practical session.
6. **Preconditions**: Practical session has booked learners (`STEP-020`).
7. **Business Justification**: Practical completion can't be self-reported by the learner; it must be verified in person for compliance.
8. **Screen View Model**:
   ```json
   {
     "sessionId": "string (source: api_field)",
     "sessionDate": "string (source: api_field)",
     "attendees": "array (source: api_field)",
     "attendanceStatus": "string (source: user_input)",
     "completionNotes": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Radio buttons: `Attended` / `Absent` / `No-Show`.
    - Text box: Attendance notes.
    - Click "Save Roster Attendance".
11. **Screen Output Display**:
    - Learner roster table with photo ID avatars and status switches.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/practical-sessions/:sessionId/roster
2. Params: sessionId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Instructor/Admin role.
   2. Fetch list of booked learners for practical `sessionId`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "sessionId": "slot-301",
       "sessionDate": "2026-08-12T08:00:00Z",
       "attendees": [
         { "bookingId": "bk-901", "learnerId": "lrn-5001", "name": "John Doe", "attendanceStatus": "PENDING" }
       ]
     }
   }
   ```
6. On empty retrieval response: Render empty roster alert.
7. Screen data manipulation on success: Populate View Model `attendees`.
8. Side Effects: null
9. Next Action: Instructor updates attendance tags.
10. Errors:
    1. error-044:
       1. Code: 403
       2. Message: Unauthorized instructor session.
       3. Screen data manipulation on error: Clear roster table.
       4. Side Effects: null
       5. Next Action: Redirect to instructor login.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: /api/practical-sessions/:sessionId/attendance
2. Params: sessionId: string
3. Query: null
4. Request body:
   ```json
   {
     "attendanceRecords": [
       { "bookingId": "bk-901", "attendanceStatus": "ATTENDED", "notes": "Present on time with safety boots." }
     ]
   }
   ```
5. Server Business Logic:
   1. Authenticate Instructor.
   2. Update attendance status on booking records.
6. Response body schema:
   ```json
   { "success": true, "message": "Attendance roster saved successfully" }
   ```
7. Screen data manipulation on success: Show success checkmark next to attendees.
8. Side Effects: Enable practical evaluation scoring (`STEP-025`) for present learners.
9. Next Action: Stay on roster page.
10. Errors:
    1. error-045:
       1. Code: 400
       2. Message: Invalid attendance status value.
       3. Screen data manipulation on error: Highlight invalid row.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: Take Theory Exam (STEP-022)

1. **stepId**: STEP-022
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Exam Portal - Active Exam Screen
5. **Trigger**: Learner clicks "Start Exam" after finishing theory modules or when retake unlocked.
6. **Preconditions**: Enrolled in Theory or Mixed course; theory modules complete (`STEP-018`).
7. **Business Justification**: Theory certification is only valid once tested; this is the core compliance checkpoint.
8. **Screen View Model**:
   ```json
   {
     "examAttemptId": "string (source: api_field)",
     "timeRemainingSeconds": "number (source: derived)",
     "questions": "array (source: api_field)",
     "currentQuestionIndex": "number (source: user_input)",
     "userAnswers": "object (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Anxious
   2. Target Emotions: Confident
10. **Screen Input Actions**:
    - Radio option selection for answers.
    - Navigation buttons: "Next Question", "Previous Question".
    - Click "Submit Final Exam".
11. **Screen Output Display**:
    - Sticky countdown timer bar.
    - Question prompt with multiple-choice options.
    - Question navigator map grid (Unanswered/Answered indicators).

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/exams/attempts/:attemptId
2. Params: attemptId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Retrieve active attempt session.
   3. Calculate remaining timer seconds based on `startTime` and course `timeLimitMinutes`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "examAttemptId": "att-1001",
       "timeRemainingSeconds": 1780,
       "questions": [
         { "questionId": "q-1", "questionText": "What is the anchor point height requirement?", "options": ["1.5m", "2.0m", "2.5m", "3.0m"] }
       ]
     }
   }
   ```
6. On empty retrieval response: Redirect to exam start page.
7. Screen data manipulation on success: Populate questions array and start countdown timer interval.
8. Side Effects: null
9. Next Action: Learner answers questions.
10. Errors:
    1. error-046:
       1. Code: 410
       2. Message: Exam time expired. Auto-submitting attempt.
       3. Screen data manipulation on error: Trigger automatic submission payload.
       4. Side Effects: Dispatch auto-score execution (`STEP-023`).
       5. Next Action: Redirect to exam result screen.

### 3.2. CREATE

1. Url route: /api/exams/attempts/start
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "courseId": "crs-9901"
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Verify theory completion and retake policy rules.
   3. Create new ExamAttempt record with start timestamp.
   4. Fetch randomized question set from question bank (F-026).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "examAttemptId": "att-1001",
       "startTime": "2026-08-01T08:40:00Z",
       "timeLimitMinutes": 30
     }
   }
   ```
7. Screen data manipulation on success: Initialize View Model and render active exam view.
8. Side Effects: Lock retake request state.
9. Next Action: Navigate to `/exam/portal/att-1001`.
10. Errors:
    1. error-047:
       1. Code: 403
       2. Message: Prerequisites incomplete or retake waiting period active.
       3. Screen data manipulation on error: Show lock alert modal.
       4. Side Effects: null
       5. Next Action: Redirect to course player.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: /api/exams/attempts/:attemptId/answers
2. Params: attemptId: string
3. Query: null
4. Request body:
   ```json
   {
     "questionId": "q-1",
     "selectedOptionIndex": 1
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Record selected answer in attempt state cache.
6. Response body schema:
   ```json
   { "success": true, "message": "Answer saved" }
   ```
7. Screen data manipulation on success: Mark question index as answered in navigation map.
8. Side Effects: Auto-save state to prevent data loss on disconnection.
9. Next Action: Stay on exam view.
10. Errors:
    1. error-048:
       1. Code: 400
       2. Message: Exam attempt already submitted or closed.
       3. Screen data manipulation on error: Disable option controls.
       4. Side Effects: null
       5. Next Action: Redirect to result page.

---

## 2. OPERATIONAL SCENARIO: Auto-Score Theory Exam (STEP-023)

1. **stepId**: STEP-023
2. **Actor**: System
3. **isImplemented**: false
4. **Screen**: Exam Portal - Exam Submission Processing (Backend Engine)
5. **Trigger**: Learner submits exam or timer expires (`STEP-022`).
6. **Preconditions**: Active exam attempt submitted.
7. **Business Justification**: Removes manual grading delay, giving learners and recruiters near-instant results.
8. **Screen View Model**:
   ```json
   {
     "attemptId": "string (source: api_field)",
     "scorePercentage": "number (source: api_field)",
     "passThreshold": "number (source: api_field)",
     "passed": "boolean (source: api_field)",
     "breakdown": "array (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Click "View Detailed Results" button.
11. **Screen Output Display**:
    - Animated score circle e.g. "90% - PASSED".
    - Pass threshold comparison tag.
    - Action button: "Proceed to Practical Booking" (if Mixed) or "View Certificate" (if Theory Only).

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/exams/attempts/:attemptId/result
2. Params: attemptId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Fetch completed attempt record score and pass status.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "attemptId": "att-1001",
       "scorePercentage": 90,
       "passThreshold": 80,
       "passed": true,
       "completedAt": "2026-08-01T09:10:00Z"
     }
   }
   ```
6. On empty retrieval response: Show processing spinner.
7. Screen data manipulation on success: Render result summary score screen.
8. Side Effects: null
9. Next Action: Render next stage CTA based on `passed` status.
10. Errors:
    1. error-049:
       1. Code: 404
       2. Message: Exam attempt result unavailable.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Redirect to my courses.

### 3.2. CREATE

1. Url route: /api/exams/attempts/:attemptId/submit
2. Params: attemptId: string
3. Query: null
4. Request body:
   ```json
   {
     "finalAnswers": [
       { "questionId": "q-1", "selectedOptionIndex": 1 },
       { "questionId": "q-2", "selectedOptionIndex": 0 }
     ]
   }
   ```
5. Server Business Logic:
   1. Authenticate Learner.
   2. Retrieve question bank answer keys for course.
   3. Compare user submitted options against correct options.
   4. Calculate weighted total score percentage.
   5. Mark attempt status: `passed = scorePercentage >= passThreshold`.
   6. Record completion timestamp.
   7. Trigger result distribution event (F-020).
   8. If Theory-Only course and passed, trigger certificate issuance (F-021).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "attemptId": "att-1001",
       "scorePercentage": 90,
       "passThreshold": 80,
       "passed": true
     }
   }
   ```
7. Screen data manipulation on success: Update View Model with score results.
8. Side Effects: Push result notification to recruiter dashboard (F-022).
9. Next Action: Render pass/fail result view.
10. Errors:
    1. error-050:
       1. Code: 409
       2. Message: Attempt already submitted.
       3. Screen data manipulation on error: Show info message.
       4. Side Effects: null
       5. Next Action: Redirect to result view.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Retake Failed Exam (STEP-024)

1. **stepId**: STEP-024
2. **Actor**: Learner / Admin
3. **isImplemented**: false
4. **Screen**: Exam Portal - Exam Failed / Retake Rules Screen
5. **Trigger**: Learner fails theory exam (`STEP-023`).
6. **Preconditions**: Learner exam score below pass threshold; attempt count within policy limit.
7. **Business Justification**: Matches real certifying-body rules and prevents learners from indefinitely re-attempting without review.
8. **Screen View Model**:
   ```json
   {
     "courseId": "string (source: api_field)",
     "previousAttemptsCount": "number (source: api_field)",
     "maxAttemptsAllowed": "number (source: api_field)",
     "cooldownEndsAt": "string (source: api_field)",
     "canRetakeNow": "boolean (source: derived)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Discouraged
   2. Target Emotions: Motivated
10. **Screen Input Actions**:
    - Click "Review Theory Material" button.
    - Click "Request Retake" button when cooldown active or unlocked.
11. **Screen Output Display**:
    - Red failure outcome card e.g., "Score: 65% (Required: 80%)".
    - Cooldown timer element e.g. "Next attempt unlocks in 24 hours".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/exams/courses/:courseId/retake-status
2. Params: courseId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Query prior exam attempts for learner on `courseId`.
   3. Check cooldown period enforcement settings (e.g., 24-hour waiting window after 2 failed attempts).
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "courseId": "crs-9901",
       "previousAttemptsCount": 1,
       "maxAttemptsAllowed": 3,
       "cooldownEndsAt": "2026-08-02T09:10:00Z",
       "canRetakeNow": false
     }
   }
   ```
6. On empty retrieval response: Return default retake allowed state.
7. Screen data manipulation on success: Populate View Model fields.
8. Side Effects: null
9. Next Action: Display cooldown banner or retake button.
10. Errors:
    1. error-051:
       1. Code: 404
       2. Message: Course attempt history not found.
       3. Screen data manipulation on error: Display error message.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.2. CREATE

1. Url route: /api/exams/courses/:courseId/request-retake
2. Params: courseId: string
3. Query: null
4. Request body: null
5. Server Business Logic:
   1. Authenticate Learner.
   2. Validate `previousAttemptsCount < maxAttemptsAllowed` and `canRetakeNow == true`.
   3. Unlock new exam attempt session.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "retakeUnlocked": true,
       "attemptNumber": 2
     }
   }
   ```
7. Screen data manipulation on success: Enable "Start Retake Exam" button.
8. Side Effects: null
9. Next Action: Redirect to exam start screen (`STEP-022`).
10. Errors:
    1. error-052:
       1. Code: 429
       2. Message: Cooldown period active. Retake not allowed yet.
       3. Screen data manipulation on error: Disable retake button.
       4. Side Effects: null
       5. Next Action: Display countdown timer.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Score Practical Assessment (STEP-025)

1. **stepId**: STEP-025
2. **Actor**: Instructor
3. **isImplemented**: false
4. **Screen**: Session Roster - Assessment Checklist Modal
5. **Trigger**: Instructor evaluates learner during practical session.
6. **Preconditions**: Learner attended practical session (`STEP-021`).
7. **Business Justification**: Practical skill can only be judged by a qualified assessor in person, not automated.
8. **Screen View Model**:
   ```json
   {
     "bookingId": "string (source: api_field)",
     "learnerName": "string (source: api_field)",
     "criteriaChecklist": "array (source: api_field)",
     "passedCriteriaIds": "array (source: user_input)",
     "overallResult": "string (source: user_input)",
     "assessorNotes": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Evaluated
   2. Target Emotions: Validated
10. **Screen Input Actions**:
    - Checkbox toggle for each criterion item (Pass / Fail).
    - Select overall assessment result (`PASS` / `FAIL`).
    - Input instructor feedback notes.
    - Click "Submit Practical Evaluation".
11. **Screen Output Display**:
    - Criteria checklist evaluation modal.
    - Mandatory criteria warning indicator if an essential item is unchecked.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/practical-assessments/bookings/:bookingId
2. Params: bookingId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Instructor role.
   2. Fetch evaluation criteria defined for course associated with `bookingId` (F-027).
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "bookingId": "bk-901",
       "learnerName": "John Doe",
       "criteria": [
         { "id": "crit-1", "title": "Pre-rigging inspection", "isMandatory": true },
         { "id": "crit-2", "title": "Emergency Lowering Technique", "isMandatory": true }
       ]
     }
   }
   ```
6. On empty retrieval response: Display alert "No evaluation criteria found".
7. Screen data manipulation on success: Render criteria items in checklist View Model.
8. Side Effects: null
9. Next Action: Instructor completes checklist switches.
10. Errors:
    1. error-053:
       1. Code: 404
       2. Message: Booking assessment record missing.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Close evaluation modal.

### 3.2. CREATE

1. Url route: /api/practical-assessments/score
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "bookingId": "bk-901",
     "passedCriteriaIds": ["crit-1", "crit-2"],
     "overallResult": "PASS",
     "assessorNotes": "Demonstrated full mastery of high-level rigging and harness checks."
   }
   ```
5. Server Business Logic:
   1. Authenticate Instructor.
   2. Verify all mandatory criteria are marked pass if `overallResult == PASS`.
   3. Record PracticalAssessment record in database.
   4. Update booking status to `COMPLETED`.
   5. If course is Mixed or Practical-Only and all required elements passed, trigger certificate issuance (F-021).
   6. Dispatch result notification to recruiter dashboard (F-020).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "assessmentId": "pa-501",
       "bookingId": "bk-901",
       "overallResult": "PASS",
       "evaluatedAt": "2026-08-01T10:00:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Mark learner row in session roster as "Passed".
8. Side Effects: Trigger automatic Certificate Issuance sync (F-021 & F-022).
9. Next Action: Close modal and return to roster.
10. Errors:
    1. error-054:
       1. Code: 400
       2. Message: Mandatory criteria missing pass selection.
       3. Screen data manipulation on error: Highlight unchecked mandatory items.
       4. Side Effects: null
       5. Next Action: Stay on modal.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Distribute Exam Results (STEP-026)

1. **stepId**: STEP-026
2. **Actor**: System
3. **isImplemented**: false
4. **Screen**: Notifications / Recruiter Dashboard Results Queue
5. **Trigger**: Theory exam graded (`STEP-023`) or practical assessment submitted (`STEP-025`).
6. **Preconditions**: Exam attempt or practical score recorded.
7. **Business Justification**: Keeps the recruiter's placement decision current without manual follow-up between the two agencies.
8. **Screen View Model**:
   ```json
   {
     "resultId": "string (source: api_field)",
     "learnerId": "string (source: api_field)",
     "courseName": "string (source: api_field)",
     "componentType": "string (source: api_field)",
     "result": "string (source: api_field)",
     "timestamp": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Waiting
   2. Target Emotions: Informed
10. **Screen Input Actions**:
    - Click "View Component Result Detail" on notification card.
11. **Screen Output Display**:
    - Event log card displaying result dispatch event e.g. "Theory Exam Passed: 90%".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/results/learner/:learnerId
2. Params: learnerId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate system/user session.
   2. Fetch test and practical result distribution records for specified learner.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       { "resultId": "res-1", "courseName": "Working at Heights", "componentType": "THEORY", "result": "PASS", "timestamp": "2026-08-01T09:10:00Z" },
       { "resultId": "res-2", "courseName": "Working at Heights", "componentType": "PRACTICAL", "result": "PASS", "timestamp": "2026-08-01T10:00:00Z" }
     ]
   }
   ```
6. On empty retrieval response: Return empty results array.
7. Screen data manipulation on success: Render result history list.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-055:
       1. Code: 404
       2. Message: Learner results missing.
       3. Screen data manipulation on error: Show empty state.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.2. CREATE

1. Url route: /api/results/distribute
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "learnerId": "lrn-5001",
     "courseId": "crs-9901",
     "componentType": "PRACTICAL",
     "result": "PASS"
   }
   ```
5. Server Business Logic:
   1. Execute internal system payload dispatch.
   2. Insert ResultNotification entry.
   3. Update Recruiter candidate activity log on shared backend.
6. Response body schema:
   ```json
   { "success": true, "message": "Result notification dispatched to learner and recruiter" }
   ```
7. Screen data manipulation on success: Update notification state in real-time.
8. Side Effects: Trigger Webhook push to recruiter portal dashboard.
9. Next Action: Stay on processing flow.
10. Errors:
    1. error-056:
       1. Code: 500
       2. Message: Failed to dispatch result webhook.
       3. Screen data manipulation on error: Queue message for background retry.
       4. Side Effects: Log system dispatch error.
       5. Next Action: Retry automatically.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Issue Certificate/Ticket (STEP-027)

1. **stepId**: STEP-027
2. **Actor**: System / Admin
3. **isImplemented**: false
4. **Screen**: My Certifications - Issued Certificate Viewer
5. **Trigger**: Learner passes all required components (Theory and/or Practical) for a course.
6. **Preconditions**: All course components passed in system DB.
7. **Business Justification**: Closes the loop on the original gap, making the learner placement-ready.
8. **Screen View Model**:
   ```json
   {
     "certificateId": "string (source: api_field)",
     "certificateNumber": "string (source: api_field)",
     "learnerName": "string (source: api_field)",
     "certificationName": "string (source: api_field)",
     "issueDate": "string (source: api_field)",
     "expiryDate": "string (source: api_field)",
     "qrCodeUrl": "string (source: api_field)",
     "pdfDownloadUrl": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Hopeful
   2. Target Emotions: Accomplished
10. **Screen Input Actions**:
    - Click "Download Ticket PDF".
    - Click "View Verification QR Code".
11. **Screen Output Display**:
    - Official Digital Ticket / Certificate Card (Aveling seal, Serial #, Issue & Expiry date, Verification QR code).
    - Status badge e.g. "Status: VALID".

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/certificates/learner/me
2. Params: null
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Query all issued certificates for learner.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": [
       {
         "certificateId": "cert-rec-101",
         "certificateNumber": "AVL-2026-9901",
         "learnerName": "John Doe",
         "certificationName": "Working at Heights Ticket",
         "issueDate": "2026-08-01T10:05:00Z",
         "expiryDate": "2028-08-01T10:05:00Z",
         "qrCodeUrl": "https://cdn.fifo.com/qr/AVL-2026-9901.png",
         "pdfDownloadUrl": "https://cdn.fifo.com/certs/AVL-2026-9901.pdf"
       }
     ]
   }
   ```
6. On empty retrieval response: Render "No certificates issued yet".
7. Screen data manipulation on success: Populate View Model list with issued certificates.
8. Side Effects: null
9. Next Action: Learner views or downloads certificate PDF.
10. Errors:
    1. error-057:
       1. Code: 401
       2. Message: Unauthorized request.
       3. Screen data manipulation on error: Clear certificates view.
       4. Side Effects: null
       5. Next Action: Redirect to login.

### 3.2. CREATE

1. Url route: /api/certificates/issue
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "learnerId": "lrn-5001",
     "courseId": "crs-9901"
   }
   ```
5. Server Business Logic:
   1. Verify learner has passed all required components for `crs-9901`.
   2. Generate unique certificate serial number e.g. `AVL-2026-9901`.
   3. Calculate expiry date based on certification validity duration (e.g. 2 years).
   4. Create Certificate record in DB.
   5. Update LearnerCertification gap status from `Missing`/`Expired` to `Valid`.
   6. Automatically trigger Recruiter Sync (F-022).
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "certificateId": "cert-rec-101",
       "certificateNumber": "AVL-2026-9901",
       "status": "VALID",
       "issuedAt": "2026-08-01T10:05:00Z"
     }
   }
   ```
7. Screen data manipulation on success: Display celebration modal with certificate view button.
8. Side Effects: Update shared backend database certification status to `VALID`.
9. Next Action: Trigger sync notification (STEP-028).
10. Errors:
    1. error-058:
       1. Code: 422
       2. Message: Cannot issue certificate: Course components incomplete.
       3. Screen data manipulation on error: Display warning.
       4. Side Effects: null
       5. Next Action: Stay on screen.

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Sync Certification Status to Recruiter (STEP-028)

1. **stepId**: STEP-028
2. **Actor**: Recruiter
3. **isImplemented**: false
4. **Screen**: Recruiter Dashboard - Applicant Compliance Matrix
5. **Trigger**: System issues certificate (`STEP-027`).
6. **Preconditions**: Shared backend updates learner's certification status from `Missing` or `Expired` to `Valid`.
7. **Business Justification**: Lets the recruiter act on placement the moment a learner becomes eligible, shortening time-to-placement.
8. **Screen View Model**:
   ```json
   {
     "applicantId": "string (source: api_field)",
     "applicantName": "string (source: api_field)",
     "roleTitle": "string (source: api_field)",
     "certificationsStatus": "array (source: api_field)",
     "isPlacementReady": "boolean (source: derived)",
     "lastSyncTimestamp": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Click "Deploy Applicant to FIFO Site" action button.
11. **Screen Output Display**:
    - Green compliance checkmark e.g. "Placement Ready (100% Compliant)".
    - Real-time certification update notification badge.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/recruitment/applicants/:applicantId/compliance
2. Params: applicantId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Recruiter session.
   2. Query applicant certification status table on shared database.
   3. Check if all required role certifications are marked `Valid`.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "applicantId": "lrn-5001",
       "applicantName": "John Doe",
       "roleTitle": "Rigging Specialist",
       "certifications": [
         { "certName": "Working at Heights Ticket", "status": "Valid", "issuedAt": "2026-08-01T10:05:00Z" },
         { "certName": "First Aid Certificate", "status": "Valid", "issuedAt": "2025-05-10T00:00:00Z" }
       ],
       "isPlacementReady": true,
       "lastSyncTimestamp": "2026-08-01T10:05:01Z"
     }
   }
   ```
6. On empty retrieval response: Render empty compliance view.
7. Screen data manipulation on success: Set `isPlacementReady = true` and highlight ready badge.
8. Side Effects: null
9. Next Action: Recruiter initiates job placement deployment workflow.
10. Errors:
    1. error-059:
       1. Code: 404
       2. Message: Applicant record not found on recruiter portal.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Redirect to applicant directory.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A - Real-time sync occurs via shared DB update.
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Notification Center (STEP-029)

1. **stepId**: STEP-029
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Notifications Inbox Page
5. **Trigger**: Learner clicks notification bell icon.
6. **Preconditions**: System events logged for learner.
7. **Business Justification**: Reduces missed communications and support tickets by centralizing every status change in one place.
8. **Screen View Model**:
   ```json
   {
     "unreadCount": "number (source: derived)",
     "notifications": "array (source: api_field)",
     "filterType": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: Scattered
   2. Target Emotions: In control
10. **Screen Input Actions**:
    - Filter notifications by category e.g., "Subsidies", "Exams", "Bookings".
    - Click "Mark All as Read".
    - Click notification item to navigate to target detail page.
11. **Screen Output Display**:
    - List of notification cards with icons, timestamp, and read/unread status indicators.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/notifications
2. Params: null
3. Query: filter: string, page: number
4. Server Business Logic:
   1. Authenticate Learner.
   2. Fetch notification records sorted by timestamp descending.
   3. Calculate unread items count.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "unreadCount": 1,
       "notifications": [
         {
           "id": "notif-201",
           "title": "Certificate Issued!",
           "message": "Your Working at Heights Ticket certificate has been issued.",
           "category": "CERTIFICATION",
           "isRead": false,
           "createdAt": "2026-08-01T10:05:00Z"
         }
       ]
     }
   }
   ```
6. On empty retrieval response: Render empty inbox message "You have no notifications".
7. Screen data manipulation on success: Populate View Model `unreadCount` and `notifications`.
8. Side Effects: null
9. Next Action: Learner interacts with notification items.
10. Errors:
    1. error-060:
       1. Code: 401
       2. Message: Unauthorized request.
       3. Screen data manipulation on error: Clear notifications.
       4. Side Effects: null
       5. Next Action: Redirect to login.

### 3.2. CREATE

1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.3. DELETE

1. Url route: /api/notifications/:id
2. Params: id: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Learner.
   2. Remove notification item `id`.
5. Response body schema:
   ```json
   { "success": true, "message": "Notification deleted" }
   ```
6. On empty retrieval response: null
7. Screen data manipulation on success: Remove item from View Model list.
8. Side Effects: null
9. Next Action: Stay on notification inbox.
10. Errors:
    1. error-061:
       1. Code: 404
       2. Message: Notification not found.
       3. Screen data manipulation on error: Refresh list.
       4. Side Effects: null
       5. Next Action: Stay on inbox.

### 3.4. PATCH/PUT

1. Url route: /api/notifications/mark-all-read
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic:
   1. Authenticate Learner.
   2. Update all unread notifications for learner setting `isRead = true`.
6. Response body schema:
   ```json
   { "success": true, "message": "All notifications marked as read" }
   ```
7. Screen data manipulation on success: Set `unreadCount = 0` and update all item badges to read state.
8. Side Effects: Reset header bell icon unread counter badge.
9. Next Action: Stay on screen.
10. Errors:
    1. error-062:
       1. Code: 500
       2. Message: Failed to update notifications.
       3. Screen data manipulation on error: Show error alert.
       4. Side Effects: null
       5. Next Action: Stay on screen.

---

## 2. OPERATIONAL SCENARIO: Aveling Credential Generation (STEP-030)

1. **stepId**: STEP-030
2. **Actor**: Admin
3. **isImplemented**: false
4. **Screen**: Learner Profile > LMS Access Panel
5. **Trigger**: Admin clicks "Generate Aveling Credentials" for an applicant.
6. **Preconditions**: Applicant exists in the recruitment database.
7. **Business Justification**: Ensures isolation between recruitment portal access and LMS access; admin controls exactly who gets access and when.
8. **Screen View Model**:
   ```json
   {
     "applicantId": "string (source: api_field)",
     "hasLmsAccess": "boolean (source: api_field)",
     "lmsUsername": "string (source: api_field)",
     "temporaryPassword": "string (source: api_field)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Click "Generate Credentials" button.
11. **Screen Output Display**:
    - Shows generated LMS username and temporary password.
    - Success toast confirming email sent to applicant.

---

## 3. SCREEN API ACTIONS

### 3.1. READ

1. Url route: /api/lms-credentials/applicants/:applicantId
2. Params: applicantId: string
3. Query: null
4. Server Business Logic:
   1. Authenticate Admin.
   2. Fetch LMS credential status for the applicant.
5. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "applicantId": "usr-101",
       "hasLmsAccess": true,
       "lmsUsername": "Aveling-JohnD"
     }
   }
   ```
6. On empty retrieval response: Return `hasLmsAccess: false`.
7. Screen data manipulation on success: Update View Model.
8. Side Effects: null
9. Next Action: Stay on screen.
10. Errors:
    1. error-063:
       1. Code: 404
       2. Message: Applicant not found.
       3. Screen data manipulation on error: Show error.
       4. Side Effects: null
       5. Next Action: Return to directory.

### 3.2. CREATE

1. Url route: /api/lms-credentials/generate
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "applicantId": "usr-101"
   }
   ```
5. Server Business Logic:
   1. Authenticate Admin.
   2. Generate unique LMS username and random temporary password.
   3. Save to LmsCredential table linked to User.
   4. Trigger email to applicant with login details.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "lmsUsername": "Aveling-JohnD",
       "temporaryPassword": "temp-SecurePassword123"
     }
   }
   ```
7. Screen data manipulation on success: Display generated credentials in View Model.
8. Side Effects: Email dispatched.
9. Next Action: Stay on screen.
10. Errors:
    1. error-064:
       1. Code: 409
       2. Message: Applicant already has LMS credentials.
       3. Screen data manipulation on error: Show warning toast.
       4. Side Effects: null
       5. Next Action: Refresh status.

### 3.3. DELETE
1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT
1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

---

## 2. OPERATIONAL SCENARIO: Aveling Portal Login (STEP-031)

1. **stepId**: STEP-031
2. **Actor**: Learner
3. **isImplemented**: false
4. **Screen**: Aveling LMS - Login Page
5. **Trigger**: Learner enters LMS username and password and clicks Login.
6. **Preconditions**: Admin has generated credentials via STEP-030.
7. **Business Justification**: Enforces the separate Aveling login requirement for applicants taking courses.
8. **Screen View Model**:
   ```json
   {
     "lmsUsername": "string (source: user_input)",
     "password": "string (source: user_input)"
   }
   ```
9. **Emotions**:
   1. Current Emotions: N/A
   2. Target Emotions: N/A
10. **Screen Input Actions**:
    - Input username and password.
    - Click Login button.
11. **Screen Output Display**:
    - Loading spinner.
    - Validation error messages if incorrect.

---

## 3. SCREEN API ACTIONS

### 3.1. READ
1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.2. CREATE

1. Url route: /api/lms-auth/login
2. Params: null
3. Query: null
4. Request body:
   ```json
   {
     "lmsUsername": "Aveling-JohnD",
     "password": "temp-SecurePassword123"
   }
   ```
5. Server Business Logic:
   1. Find LmsCredential by username.
   2. Verify password hash.
   3. Generate LMS-specific JWT access and refresh tokens.
6. Response body schema:
   ```json
   {
     "success": true,
     "data": {
       "accessToken": "jwt_token_here",
       "user": {
         "id": "usr-101",
         "name": "John Doe",
         "lmsUsername": "Aveling-JohnD",
         "role": "LEARNER"
       }
     }
   }
   ```
7. Screen data manipulation on success: Set auth context.
8. Side Effects: Set refresh token HTTP-only cookie.
9. Next Action: Redirect to `/dashboard`.
10. Errors:
    1. error-065:
       1. Code: 401
       2. Message: Invalid LMS username or password.
       3. Screen data manipulation on error: Highlight fields, show error text.
       4. Side Effects: Log failed attempt.
       5. Next Action: Clear password field.

### 3.3. DELETE
1. Url route: null
2. Params: null
3. Query: null
4. Server Business Logic: N/A
5. Response body schema: null
6. On empty retrieval response: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null

### 3.4. PATCH/PUT
1. Url route: null
2. Params: null
3. Query: null
4. Request body: null
5. Server Business Logic: N/A
6. Response body schema: null
7. Screen data manipulation on success: null
8. Side Effects: null
9. Next Action: null
10. Errors: null
