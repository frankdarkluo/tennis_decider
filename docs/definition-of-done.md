# Definition of Done — TennisLevel

## Task done

A task is done when all of the following are true:

- `npm run build` passes
- the intended behavior is visible in code or UI
- no obvious regression was introduced in the touched area
- no debug-only `console.log` was added
- no undocumented `any` was added
- relevant tests were added or updated when appropriate
- the diff stays within the approved slice

## Slice done

A slice is done when:

- all planned tasks for that slice are complete
- the smallest relevant verification checks have passed
- the final diff is reviewable and intentionally scoped
- any non-obvious decisions are reflected in local docs when needed

## Verification guidance

Prefer smallest-first verification:

1. targeted tests for touched files or modules
2. `npm run lint` when shared UI, types, routing, or cross-page code changed
3. `npm run build` before claiming the slice is complete

Do not default to running the entire test suite for tiny local edits unless the slice truly touches broad shared behavior.

## UI acceptance

For user-facing UI changes:

- check the main intended viewport
- check a small mobile width around 375px
- ensure the page remains readable and usable

## Documentation

Update local docs only when they help future agent work:
- roadmap priority changes
- boundaries change
- completion criteria change
- a non-obvious local workflow decision is introduced
