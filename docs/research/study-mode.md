---
aliases:
  - Study Mode
tags:
  - type/research
  - area/study
  - status/reference
---

# TennisLevel Study Mode

This file is local-only and should not be committed.

## Goal

Run reproducible pilot sessions without forcing sign-in, while keeping exports structured and privacy-safe.

## Related docs
- [[index]]
- [[roadmap/current]]
- [[research/study-remote-migration-checklist]]
- [[research/study-snapshot-note]]
- [[research/study-facilitator-checklist]]
- [[features/diagnosis-study-observability]]
- [[weekly/project-progress-summary]]

## Canonical Entry

- Start: `/study/start?participantId=P001&lang=zh`
- Start: `/study/start?participantId=P002&lang=en`
- End: `/study/end`

`/study` redirects to `/study/start`.

## What Study Mode Does

- creates a locked study session with:
  - `participantId`
  - `sessionId`
  - `language`
  - `snapshotId`
  - `snapshotSeed`
  - `buildVersion`
- disables login-gated study actions
- records structured study artifacts instead of user-owned cloud history
- records page enter/leave and key interaction events
- supports diagnosis snapshot replay (without restoring raw user free text)
- uses deterministic study ordering for:
  - rankings
  - library
  - plan generation metadata

## Privacy Defaults

- do not store raw uploaded video
- do not store raw free text
- keep only structured outputs and study events
- diagnosis replay stores `inputSummary` and structured diagnosis payload, not the raw user sentence

The sanitizers live in:

- `src/lib/study/privacy.ts`

## Main Study APIs

- `POST /api/study/session/start`
- `POST /api/study/session/end`
- `POST /api/study/event`
- `POST /api/study/artifact`

## Main Study Pages

- `/study/start`
- `/assessment`
- `/assessment/result`
- `/diagnose`
- `/video-diagnose`
- `/plan`
- `/profile`
- `/study/end`

## Export Path

Use the existing admin export page. Study data is bundled via:

- `buildStudyExportBundle` in `src/lib/researchData.ts`

The bundle includes:

- sessions
- artifacts
- events
- snapshot/build metadata

Local export (`导出本地日志`) additionally includes:

- `events`
- `studyFlushFallbackLogs`
- `studyFlushFallbackSummary`

`studyFlushFallbackSummary` buckets failure reasons into:

- `network_error`
- `http_non_2xx`
- `beacon_rejected`

## Determinism Notes

Study mode uses the snapshot in:

- `src/lib/study/snapshot.ts`

Current frozen identifiers:

- `snapshotId`
- `seed`
- `buildVersion`
- content / creator / assessment / diagnosis / plan / locale / ranking versions

## Pilot Checklist

1. Open `/study/start?participantId=P001&lang=en`
2. Confirm session starts and redirects home
3. Complete assessment
4. Run text diagnosis
5. Run video diagnosis with a short clip
6. Open a plan
7. Open profile and verify study counts / resume links
8. End session at `/study/end`
9. Export from admin and verify:
   - no raw video
   - no raw free text
   - session/artifact/event linkage is intact
  - `studyFlushFallbackSummary` appears and bucket counts are parsable

## Local Reset

For a clean next participant:

- use the clear button on `/study/end`

or clear browser local storage/session storage for the site.
