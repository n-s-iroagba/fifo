# Reverse-Engineering Prompt — Next.js Client [Client] (Steps 1–4)

s

You are reverse-engineering a design from an existing, undocumented
Next.js codebase. You are recovering what the code actually does,
not what it should do. Do not silently "fix," clean up, or improve
anything you read. Do not invent behavior that isn't in the code.
Where uncertain, say so explicitly rather than guessing confidently.

If a recovered LLD for the Express API backend exists at
`docs/reverse-engineered/express-api/04-lld/`, read it first and use
it as the source of truth for backend contract shape — do not
re-derive backend behavior from client-side assumptions (e.g. from
TypeScript types written on the client that may be stale or wrong).
Flag any mismatch between what the client assumes and what the
backend LLD says, rather than silently trusting either side.

Work through these steps in order. Write output to
`docs/reverse-engineered/nextjs-client-a/` as you go. Stop after
Step 4 — do not judge correctness, resolve inconsistencies, or write
requirements. That is a separate human step.

---

## Step 1 — Inventory

1. List every route (pages/ or app/ directory — note which router
   is in use), every component, every hook, every context provider,
   every client-side utility/lib module.
2. Generate a call graph / render-tree map: for each page/route,
   what components it renders, what hooks each component calls, what
   contexts it consumes.
3. List every external call surface actually invoked: API calls
   (fetch/axios/React Query/SWR — note which), third-party SDKs
   (analytics, auth providers, payment widgets), browser storage
   (localStorage/sessionStorage/cookies) actually read or written.
4. List every environment variable and public config value read
   (e.g. `NEXT_PUBLIC_*`).

Write to `01-inventory.md`.

## Step 2 — Cluster into candidate components

1. Group by feature/screen-flow, not by folder: e.g. everything
   involved in the checkout flow (page, form components, the hook
   fetching cart data, the validation logic) is one cluster even if
   split across `components/`, `hooks/`, and `lib/`.
2. Cross-check clusters against which backend endpoints (from the
   Express LLD, if available) each screen-flow actually calls — a
   cluster's boundary should roughly track which backend
   component/resource it depends on.
3. Note drift between the current folder structure and your
   data/flow-driven clusters.
4. Produce a flat list: cluster name, one-sentence responsibility
   (no "and"), files/components currently implementing it.

Write to `02-clusters.md`.

## Step 3 — Recover the HLD

1. List every route/page and the cluster (Step 2) it belongs to;
   note routing structure (static/dynamic routes, layouts, route
   groups, middleware/auth guards).
2. List every backend endpoint this client actually calls (method +
   path + which cluster calls it) and every third-party service it
   integrates with directly from the client.
3. Identify global client-side state: what lives in context
   providers, what lives in a state library (Redux/Zustand/etc. if
   present), what's purely local component state — and which
   clusters read/write each.
4. Draw the recovered architecture (Mermaid is fine): routes →
   clusters → backend endpoints / third-party services, global state
   stores clearly marked.
5. Flag anything unusual: a component reaching directly into another
   cluster's state, prop-drilling that suggests a missing shared
   store, or a route with no clear cluster ownership.

Write to `03-hld.md`.

## Step 4 — Recover LLD per component/cluster

For each cluster from Step 2, write
`04-lld/{cluster-id}.md` containing:

- **Screens/routes covered** and their responsibility.
- **Component breakdown** — key components in this cluster, their
  props (actual types), and what each renders/does.
- **Data fetching** — exact calls made (endpoint, method, request/
  response shape actually used on the client — compare against the
  backend LLD contract if available and flag any mismatch),
  caching/revalidation behavior (SWR/React Query config), loading
  and error states actually handled.
- **State management** — what state this cluster owns, where it
  lives (local/context/store), and the actual transitions/updates
  triggered by user actions. If there's a multi-step flow (e.g. a
  wizard/checkout), reconstruct it as a state machine: steps,
  allowed transitions, what triggers each.
- **Validation logic** — client-side validation rules actually
  enforced (form schemas, inline checks), in plain language.
- **Business/presentation logic** — any non-trivial conditional
  logic (feature flags, conditional rendering, permission checks),
  described in plain language, not restated code.
- **Error handling** — what happens on a failed request, a thrown
  exception, or a validation failure — plain-language description.

End each file with an **Open Questions** section for anything
unclear from the code alone.

## Cross-cutting: observations and debt

Log to `observations-and-debt.md`: suspected bugs, inconsistent
handling of the same kind of data/flow across clusters, dead
code/unused components, undocumented business rules, silent failure
modes, and any client/backend contract mismatches found while
cross-referencing the Express LLD. Do not decide bug-vs-intentional —
flag and move on.

---

Stop here. Report a summary of what was produced per step and the
total count of open questions, observations, and client/backend
mismatches logged.
