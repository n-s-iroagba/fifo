# CODE_GENERATION_FLOW

**AGENT.MD — Zero-Omission Development Workflow**

**This file is the executable plan. It contains no code — only precise instructions that you must follow. Every step is mandatory. Reference `SPECIFICATION.md` for UI details, screen view models, API action templates, and operational scenarios. Reference `ADR.md` for architectural decisions, tech stack, and code standards. Your output must be a complete, working application with no omissions.**

---

## PHASE 1 — CONFIGURATION & PROJECT SETUP

1. **Read `ADR.md`** to confirm the required tech stack and architectural constraints.
2. **Create the backend project structure** (Express, TypeScript) exactly as described in ADR.md. Include folders for:
   * `src/config`
   * `src/db` (models, migrations, seeders)
   * `src/middleware`
   * `src/modules` (each domain module contains its own router, service, controller)
   * `src/types`
   * `src/constants` (route paths, query keys, error codes, messages — no string literals elsewhere)
3. **Create the frontend project structure** (Next.js, TypeScript) exactly as described in ADR.md. Include folders for:
   * `lib` (constants, API client, query keys)
   * `components` (reusable UI components)
   * `hooks` (custom hooks for each API action)
   * `pages` (or `app` router) — one page per screen
4. **Set up environment variable files**:
   * Backend `.env`: Include all keys listed in ADR.md (database connection, JWT secrets, Cloudinary credentials, CORS origin, rate limits). **Never hardcode these values anywhere else.**
   * Frontend `.env.local`: Include API base URL and any public keys.
   * Create `.env.example` files with placeholder descriptions.
5. **Configure Tailwind**:
   * Extract primary, secondary, and accent colours from `SPECIFICATION.md` → Section 1: UI Design Theme.
   * Extend the Tailwind configuration with those colour tokens.
   * Set any additional design tokens (fonts, shadows) if mentioned.
6. **Configure Axios instances**:
   * Backend: Not needed (Axios is only used for external calls; if external calls exist, set base URL and interceptors).
   * Frontend: Create an Axios instance with base URL, request interceptor to attach JWT from auth context, response interceptor for global error handling and refresh token flow (as per ADR.md).

---

## PHASE 2 — SCREEN & VIEW MODEL EXTRACTION (PLANNING)

1. **Parse `SPECIFICATION.md` thoroughly.**
2. **Identify every Actor** listed under Operational Scenario.
3. **List every Screen** for each actor. Keep a running count.
4. **For each screen, extract the Screen View Model** (the data shape the UI expects). It is explicitly stated in the specification under each step's "Screen View Model" field.
5. **Create a Master Screen Inventory table** containing:
   * stepId
   * Screen name
   * Actor(s) who use it
   * View Model name
   * A short description
6. **Verify**: Every screen mentioned anywhere in the specification must be in this inventory. No exceptions.

---

## PHASE 3 — DATABASE SCHEMA DERIVATION & IMPLEMENTATION

1. **Collect every API action** (READ, CREATE, UPDATE, DELETE) from the specification. For each action, note:
   * The response body schema (for READ)
   * The request body schema (for CREATE and UPDATE)
2. **Derive entities**: Group related data into logical tables. Look for repeated objects, relationships, and unique identifiers.
3. **Define Sequelize models** for each entity.
   * Each model file must explicitly list attributes, types, constraints, and default values exactly as derived from the schemas.
   * Use `underscored: true` in model options to match ADR.md conventions.
4. **Create migration files** (up and down) for every model. Migrations must produce the exact columns and indexes derived from the schema.
5. **Define associations** in a dedicated associations file. Associate models based on nested data, foreign keys, or clear relationships described in the API response schemas.
6. **If seed data is needed**, create seeder files that match the example responses in the specification. This is essential for testing.

---

## PHASE 4 — BACKEND API IMPLEMENTATION (PER SCREEN, PER ACTION)

You must implement **every API action** for **every screen** following the exact structure below. Do not skip a single field.

### 4.1 Route Registration

* For each action, register a route in the corresponding module's router file. The HTTP method, URL pattern, and middleware (authentication, authorization) must match the specification.
* Use path parameters and query strings exactly as defined.

### 4.2 Controllers & Services

* Each route handler calls a service function.
* Service functions contain all business logic. They must:
  * Validate input using Zod schemas. Only validate fields present in the request schema.
  * Interact with database models.
  * Perform side effects (e.g., Cloudinary uploads).
  * Return data in the exact response body schema format.

### 4.3 Detailed Action Implementation Checklist

For each action, follow this template rigidly:

**READ Action**

* **URL route**: Match spec exactly.
* **Params & Query**: Accept and validate them.
* **Server business logic**: Implement precisely as described in the spec. If the spec says "fetch with filters", you must implement those filters.
* **Response body schema**: Return JSON that matches the given schema. Every field must be present; if a field can be null, it must be null when there is no data.
* **On empty retrieval response**: The frontend expects a specific behaviour. Ensure the backend returns an appropriate status (200 with empty array or null) if that is what the spec implies. The frontend (Phase 5) will handle the UI display.
* **Errors**: For every `error-XXX` listed:
  * Create a custom error class or use standard HTTP errors with the exact `code` and `message`.
  * The global error handler must convert these into the JSON response `{ code, message }`.
  * Do not invent errors that are not listed in the specification.

**CREATE Action**

* **URL route, params, query**: As in spec.
* **Request body**: Validate strictly against the provided JSON schema using Zod.
* **Server business logic**: Create the resource, handle any uploads, and return the created object.
* **Response body schema**: Return the created resource as per spec.
* **Success data manipulation on frontend**: (Handled in Phase 5) — the response must contain all data needed for the view model update.
* **Errors**: Map each `error-XXX` to an actual error response with the correct code and message.

**DELETE Action**

* **URL route, params, query**: As in spec.
* **Server business logic**: Delete resource, handle cascading if specified.
* **Response body schema**: Return a success confirmation or no content, as specified.
* **Errors**: Every listed error must be implemented.

**PATCH/PUT Action**

* **URL route, params, query, request body**: Validate exactly as per spec.
* **Server business logic**: Update the resource. Handle partial updates correctly.
* **Response body schema**: Return the updated resource as per spec.
* **Errors**: All specified errors must be implemented.

### 4.4 Side Effects & Logging

* Use Winston for all server-side logging as per ADR.md. Log every error and important transaction.
* Any external side effect (e.g., Cloudinary file upload) must be wrapped in try/catch and translated to a proper error response if it fails.

---

## PHASE 5 — FRONTEND IMPLEMENTATION (PER SCREEN, PER VIEW MODEL)

1. **Create a Next.js page for every screen** in the Master Screen Inventory. Annotate each page with a comment containing its stepId.
2. **Implement custom hooks for every API action** that a screen requires. Each hook must:
   * Use the Axios instance and the exact URL route, params, query, and body from the spec.
   * Return a TanStack Query `useQuery` or `useMutation` hook.
   * **On success**, map the API response to the Screen View Model exactly as described in the spec's "Screen data manipulation on success". Every field transformation must be done here.
   * **Execute Side Effects** exactly as listed: show a toast, invalidate related queries, update a global state.
   * **On error** (for each error code):
     * Perform the specified **Screen data manipulation on error** (e.g., set an error message in the view model, clear a field).
     * Execute the **Side Effects** (e.g., disable a button, log an analytics event).
     * Execute the **Next Action** (e.g., stay on page, redirect to login, show a modal). This must be tied to the error code.
3. **Handle empty retrieval responses**:
   * In the query hook, if the response is empty (empty array, null), implement the **On empty retrieval response** instruction from the spec. Typically: set a flag in the view model, render a "no data" component.
4. **Apply the UI Design Theme**:
   * Use the primary, secondary, and accent colours from the Tailwind config (set up in Phase 1) throughout the classes.
   * Use `lucide-react` icons as needed.
5. **Implement RBAC on the frontend**:
   * Use the AuthContext to get user role.
   * Protect routes: if a screen is only accessible to certain actors, wrap it with a role guard component.
   * Disable UI elements that the user's role does not permit.
6. **Use Emotions to guide UX**:
   * Current Emotions inform the initial UI state (e.g., "uncertain" → show reassuring copy and clear guidance).
   * Target Emotions inform the success state (e.g., "confident" → show confirmation with clear next steps).
   * If Emotions are `N/A`, use neutral professional UX defaults.
7. **Reuse components**: Identify common patterns (error displays, empty states, loaders, confirmation modals) and build them as reusable components, accepting view model data as props.

---

## PHASE 6 — VERIFICATION (COMPLETENESS CHECK)

Before you mark the project as done, go through this checklist:

- [ ] Every screen from the Master Screen Inventory has a corresponding page.
- [ ] Every READ, CREATE, DELETE, UPDATE action defined in `SPECIFICATION.md` has:
  - [ ] A backend route.
  - [ ] A service function with correct business logic.
  - [ ] A frontend hook.
  - [ ] Correct mapping of response to view model.
  - [ ] Every listed error handled on both sides with the exact data manipulation, side effects, and next action.
- [ ] **On empty retrieval response** logic is present for all READ actions where applicable.
- [ ] All side effects (toasts, cache invalidation, navigation) are implemented.
- [ ] RBAC is enforced on every protected endpoint (backend) and every restricted UI element (frontend).
- [ ] No string literals appear anywhere outside of constants files. Route paths, query keys, error codes, and messages are all in constant files.
- [ ] Tailwind colours match the UI design theme.
- [ ] Cloudinary uploads are correctly implemented and error-handled.
- [ ] Refresh token flow works according to ADR.md.
- [ ] Database has seeding files.
- [ ] Every page has a comment with its stepId for traceability.
- [ ] Every controller has a comment with its stepId for traceability.
- [ ] The application runs end-to-end and fulfills every operational scenario described in `SPECIFICATION.md`.

**Deliver this completed application. No step, no screen, no error state may be missing.**