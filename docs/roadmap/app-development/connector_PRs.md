We need to implement the next two major roadmap slices after the accepted PR1–PR5 checkpoint.

To avoid confusion with the earlier numbering drift, treat these as:

* **Connector PR** = the original “PR6 — Platform connectors”
* **Hard Mode PR** = the original “PR7 — Auth, saved plans, notifications, history, and packaging readiness”

Do **not** treat this as one giant implementation block.
I want a careful, staged, branch-aware plan and execution path.

## Product reminder

TennisLevel is still:

* routing-first
* diagnosis-first
* deterministic plan generation
* small high-signal recommendation sets
* not a content-abundance feed product

Any connector or account work must preserve that identity.

## Current accepted checkpoint

Assume the following are already accepted and should remain stable:

* consumer shell
* intake boundary
* unified diagnose flow
* deterministic 7-step planning
* normalized content-catalog boundary
* accepted PR1–PR5 app behavior

Do not reopen them unless a change is strictly required and explicitly justified.

---

# Connector PR

## Goal

Add a connector-ready platform layer for future content expansion, while implementing only the safest and clearest first-party-supported ingestion path now.

## Required connector strategy

### 1. YouTube

Implement the real first connector around YouTube first.

This means:

* importer / normalizer for YouTube entries
* canonical handling of YouTube video identity
* stable metadata mapping into the existing normalized catalog boundary
* no feed UI
* no popularity-driven browsing surface

### 2. TikTok

Treat TikTok as **creator-authorized adapter only** in this slice.

This means:

* create typed adapter interfaces / contracts
* support future creator-authorized import flow assumptions
* do not implement generic scraping or unauthenticated ingestion
* do not promise broad public-content import behavior in UI or docs

### 3. Instagram

Treat Instagram as **creator-authorized / professional-account adapter only** in this slice.

This means:

* create typed adapter interfaces / contracts
* do not build a consumer-style public import path
* do not assume legacy public media import behavior
* no broad UI promise

### 4. RedNote / Xiaohongshu

Postpone live RedNote connector implementation until the official interface is clearly verified.

In this slice:

* you may define a placeholder adapter contract
* you may document verification status / open questions
* do not implement live ingestion
* do not create product promises around it

## Connector PR scope constraints

* no live TikTok scraping
* no live Instagram scraping
* no live RedNote ingestion
* no connector-driven feed UI
* no study-mode deletion
* no content-abundance posture
* no broad rewrite of the accepted catalog boundary

## Connector PR likely implementation areas

Inspect and use judgment, but likely areas include:

* `src/lib/content-catalog/*`
* platform-specific adapter folder(s), e.g. `src/lib/platform-connectors/*`
* importer/normalizer utilities
* small config / environment plumbing if truly needed
* tests around normalization / adapter contracts / retrieval compatibility
* docs updates for connector scope and limitations

## Connector PR required output format

Use this exact structure.

### Phase 1 — Analysis

Provide:

1. the exact files/modules you plan to add or change
2. the connector boundary you propose
3. what is real now vs adapter-ready only
4. how YouTube importer fits the accepted catalog boundary
5. what explicitly stays out of scope
6. risk analysis, especially around platform assumptions and product drift

### Phase 2 — Implementation

Implement:

* YouTube importer / normalizer path
* typed adapter contracts for TikTok / Instagram / RedNote placeholder support
* no live unsupported integrations
* no UI over-promise
* compatibility with current diagnosis / plan retrieval flow

### Phase 3 — Verification

Provide:

1. what changed
2. files touched
3. tests added/updated
4. verification performed
5. remaining risks / ambiguities
6. recommended next effort

## Connector PR testing requirements

Add or update targeted tests for:

* YouTube normalization into the accepted catalog schema
* connector contract typing and fallback behavior
* diagnosis and plan retrieval compatibility with imported YouTube items
* recommendation cap and routing-first behavior remain unchanged
* no supported surface accidentally becomes a browsing/feed surface

Do not implement the Hard Mode PR yet until the Connector PR analysis and implementation are complete and accepted.

---

# Hard Mode PR

After the Connector PR is accepted, move to the Hard Mode PR.

## Goal

Add the first serious account and retention layer for the consumer app:

* auth
* saved plans
* history
* notifications
* packaging readiness only after that

This is not just “more features.”
It should make the accepted consumer path durable and reusable for real users.

## Required sequencing

Implement Hard Mode in this order:

### Slice A — Auth + saved plans

* user auth / account boundary
* save current plan
* retrieve saved plans
* minimal stable ownership model
* do not mix in notifications yet

### Slice B — History

* surface prior diagnoses / prior plans cleanly
* make history useful, not noisy
* preserve low information density
* do not create a cluttered dashboard

### Slice C — Notifications

* reminder / re-engagement support only after auth and saved plans exist
* keep notification logic lightweight and clearly scoped
* do not build an overcomplicated campaign system

### Slice D — Packaging readiness

* only after auth/history/notifications are stable
* evaluate PWA / mobile-web readiness first
* only then consider native wrapper / App Store packaging readiness
* do not jump straight to native packaging before the product/account layer is settled

## Hard Mode scope constraints

* no broad redesign of the accepted diagnose/plan flow
* no reopening deterministic plan behavior
* no connector expansion mixed into this PR
* no study-mode deletion unless explicitly scoped later
* no bloated dashboard
* no “social app” drift

## Hard Mode likely implementation areas

Use judgment, but likely:

* auth/session boundary
* user-owned persisted plan/history storage
* profile/account surface if needed
* saved plan/history routes or components
* reminder/notification scaffolding
* packaging-readiness checklist or doc
* targeted tests for auth, save/load, history rendering, and reminder triggers

## Hard Mode required output format

Use this exact structure.

### Phase 1 — Analysis

Provide:

1. the exact files/modules you plan to add or change
2. the minimal account/data model
3. what persistence boundary you propose
4. how saved plans/history integrate without clutter
5. what notification scope is appropriate now
6. whether packaging readiness should be PWA-first, wrapper-later
7. what explicitly stays out of scope

### Phase 2 — Implementation

Implement in slices:

* Slice A first
* then Slice B
* then Slice C
* only then Slice D if appropriate

Do not collapse all slices into one uncontrolled patch.

### Phase 3 — Verification

Provide:

1. what changed
2. files touched
3. tests added/updated
4. verification performed
5. remaining risks / ambiguities
6. recommended next effort

## Hard Mode testing requirements

Add or update targeted tests for:

* auth/session boundary behavior
* save plan / retrieve plan flow
* user history rendering
* notification scheduling / trigger boundary if implemented
* accepted consumer shell and diagnose/plan path remain stable
* no regression in low-density mobile UX

---

# Important execution rules

* Start with **Connector PR analysis only**
* do not implement Hard Mode yet
* do not silently expand scope
* if a platform cannot be responsibly implemented now, keep it adapter-ready and document why
* preserve TennisLevel as a routing-first product
* keep bilingual semantics clean
* keep the code readable and easy to revise

Please begin with the **Connector PR analysis only**.
