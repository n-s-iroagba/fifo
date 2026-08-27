# Reverse-Engineering Prompt — Express API Service (Steps 1–4)

You are reverse-engineering a design from an existing, undocumented
TypeScript/Express codebase. You are recovering what the code
actually does, not what it should do. Do not silently "fix," clean
up, or improve anything you read. Do not invent behavior that isn't
in the code. Where you're uncertain, say so explicitly rather than
guessing confidently.

Work through these steps in order. Write output to
`docs/reverse-engineered/express-api/` as you go, per the file
layout below. Stop after Step 4 — do not attempt to judge whether
recovered logic is correct, resolve inconsistencies, or write an
SRS. That is a separate human step.

---

## Step 1 — Inventory

Goal: an objective, mechanical map of the codebase before any
interpretation.

1. List every route file, controller, service/use-case module,
   repository/data-access module, middleware, and shared utility.
2. Generate a call graph: for each exported function/class method,
   list what it calls (internal calls) and what it's called by.
   Use static analysis where possible (e.g. `madge` for module
   dependencies) rather than reading and guessing.
3. List every external dependency actually invoked at runtime:
   database calls (ORM models/queries), external HTTP calls, queue/
   event bus publishes and subscribes, file system or cache access.
4. List every environment variable and config value read.

Do not interpret meaning yet — this step is purely structural.

Write to `01-inventory.md`: file list, call graph (as an adjacency
list or Mermaid diagram), external dependency list, config list.

## Step 2 — Cluster into candidate components

Goal: group code by actual responsibility/data ownership, ignoring
existing folder structure.

1. For each route/entry point, identify what core entity or business
   capability it operates on (e.g. everything touching `orders` —
   create, cancel, apply-discount — clusters together regardless of
   which file each currently lives in).
2. Cross-check clusters against actual database tables/ORM models
   touched — two routes that read/write the same table are strong
   evidence of the same cluster; a route touching no table shared
   with anything else may be its own cluster.
3. Note where the *existing* file/folder structure disagrees with
   your data-driven clusters — this drift is itself useful signal,
   not something to paper over.
4. Produce a flat list of candidate components: name, one-sentence
   responsibility (no "and" — if you need "and," split it further),
   and the specific files/functions currently implementing it.

Write to `02-clusters.md`.

## Step 3 — Recover the HLD

Goal: service-level architecture as it actually exists.

1. List every exposed entry point: HTTP routes (method + path),
   queue consumers, scheduled jobs — with the component (from Step
   2) each belongs to.
2. List every external interface this service exposes (i.e. what a
   client could call) and every external system this service itself
   depends on (databases, third-party APIs, other internal
   services) — direction of each dependency matters, note it.
3. Draw the recovered architecture as a diagram (Mermaid is fine):
   components as boxes, calls between them as arrows, external
   systems clearly marked as external.
4. Flag anything structurally unusual: a component calling directly
   into another component's internals rather than through a defined
   interface, circular dependencies, or an entry point that doesn't
   cleanly belong to any Step 2 cluster.

Write to `03-hld.md`.

## Step 4 — Recover LLD per component

Goal: one LLD file per component from Step 2, detailed enough that
someone with zero other context could reimplement it correctly.

For each component, write `04-lld/{component-id}.md` containing:

- **Interfaces exposed** — exact method/route signatures: path,
  HTTP verb, request shape, response shape, status codes actually
  returned (pull from real code, e.g. actual Zod/TypeScript types,
  not idealized versions).
- **Interfaces consumed** — every other component or external
  system this one calls, with the actual contract shape used at the
  call site.
- **Data structures** — internal types/interfaces/DTOs specific to
  this component, and the DB schema fields it actually reads/writes.
- **Algorithms / business logic** — for each non-trivial function,
  write plain-language pseudocode describing *intent* ("apply the
  discount if the order total exceeds X and the customer's loyalty
  tier is Y"), not a line-by-line restatement of the code. This is
  the one part of this step that requires genuine reading, not
  transcription.
- **State machine** — if this component mutates any kind of status/
  state field, reconstruct the legal transitions by finding every
  place that field is written. Mark any transition you can't confirm
  is intentionally blocked as "unconfirmed."
- **Error handling** — actual exception types thrown/caught, retry
  logic present, and what happens on failure (silent swallow, log,
  propagate, retry).

At the end of each component's LLD file, add an **Open Questions**
section for anything you could not determine confidently from the
code alone.

## Cross-cutting: observations and debt

Throughout Steps 1–4, whenever you notice something that looks like
a bug, an inconsistency between call sites, dead code, an
undocumented business rule, or a silent failure mode — do NOT fold
it silently into the LLD as if it were clearly intentional. Log it
separately in `observations-and-debt.md` with: what you saw, where
(file/function), and why it looked off. Do not decide whether it's a
bug — flag it and move on.

---

Stop here. Do not attempt to validate the recovered logic against
business intent, resolve flagged inconsistencies, or write any
requirements document. Report back with a summary of what was
produced per step and the total count of open questions and
observations logged.
