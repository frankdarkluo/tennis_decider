# Bilingual Audit

## Current Status

- Active-path `P0` blockers are cleared in the current repo state:
  - English CTA keys resolve to real copy
  - profile/auth/video-diagnose surfaces are dictionary-backed
  - active plan/library/footer/platform-search/study-banner leaks have been localized
- Study-path bilingual rendering remains in place:
  - English content cards use English primary titles with original Chinese as a quiet secondary line
  - creator bios, short descriptions, tags, and featured video titles/targets use display helpers on active surfaces
  - exact plan templates remain bilingual at the data level

## Resolved In This Pass

- [x] `src/lib/i18n/dictionaries/en.ts` CTA machine IDs replaced with human-readable English copy
- [x] `src/app/profile/page.tsx` hardcoded Chinese UI replaced with dictionary-backed copy and locale-aware date formatting
- [x] Auth flow localized:
  - `src/components/auth/LoginModal.tsx`
  - `src/components/auth/AuthCallbackCard.tsx`
  - `src/app/auth/callback/page.tsx`
- [x] Active video-diagnose flow localized:
  - `src/app/video-diagnose/page.tsx`
  - `src/components/video/VideoUploader.tsx`
  - `src/components/video/UsageMeter.tsx`
- [x] Active visible surfaces localized:
  - `src/components/layout/Footer.tsx`
  - `src/components/PlatformVideoSearch.tsx`
  - `src/components/library/LibraryFilters.tsx`
  - `src/components/study/StudyBanner.tsx`
  - `src/app/plan/page.tsx`
  - `src/components/plan/DayPlanCard.tsx`
- [x] Active creator/search surfaces now consistently use display helpers where locale mixing mattered:
  - `src/components/home/HotCreatorsSection.tsx`
  - `src/app/rankings/page.tsx`
  - `src/components/rankings/CreatorDetailModal.tsx`
  - `src/components/library/ContentCard.tsx`
- [x] `src/data/diagnosisRules.ts` now has broader English trigger coverage across the active rule set; English matching is no longer limited to a small subset of rule phrases

## Deferred / Not In Scope

- [ ] Inactive homepage sections are still not part of the live homepage path and remain deferred:
  - `src/components/home/ImprovementPathSection.tsx`
  - `src/components/home/QuickEntrySection.tsx`
  - `src/components/home/ProblemTagsSection.tsx`
- [ ] Hidden/source-only creator English override cleanup remains deferred because it does not affect the current active user-visible path
- [ ] Broader long-tail bilingual cleanup beyond active pages is still a follow-up area:
  - deeper helper/data normalization not required for current UI correctness
  - future English diagnosis matching can still be expanded with more natural phrasing coverage over time

## Notes

- Exact plan templates are bilingual at the source; current plan-page cleanup in this pass was about UI labels and locale formatting, not reworking template content.
- Rankings and creator surfaces already had partial helper usage before this pass; this audit now treats them as polish/consistency work rather than open bilingual blockers.
- Current audit priority should stay on active-path regressions. Inactive components and hidden data should not be treated as `P0/P1` unless they re-enter the live user flow.
