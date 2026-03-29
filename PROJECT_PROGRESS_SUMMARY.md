# TennisLevel Interactive Pages Handoff

This file is a local handoff note for Claude / GPT-5.4 paper refinement.
It is intentionally **not** meant for GitHub.

## March 28, 2026 Progress Update

### What Was Completed Today

- A large bilingual polish pass was completed and pushed to GitHub in commit `c16f635` (`Polish bilingual study mode surfaces and content subtitles`).
- The bilingual audit was rewritten into a current-state version in `BILINGUAL_AUDIT.md` so it reflects the actual repo status instead of the earlier pre-fix snapshot.
- The remaining high-priority active-surface localization gaps were cleaned up across:
  - profile
  - auth callback / login flow
  - video diagnose
  - footer
  - platform video search
  - study banner
  - plan UI residuals
- The exact plan / study-path bilingual work was extended so the visible study flow is much more consistent in English mode.
- `ContentCard` and related shared display helpers were further refined so English-mode content rendering is more systematic across the library and recommendation surfaces.
- Chinese-environment subtitles for English creator featured videos were improved substantially:
  - a curated Chinese subtitle override layer was added
  - a backlog generator script was added
  - the creator-video subtitle backlog was reduced from `200` pending items to `5`
- The remaining creator subtitle items that were too clickbait / too semantically vague to polish confidently were intentionally left in `CONTENT_TRANSLATION_BACKLOG.md` instead of being force-translated.
- English-mode focus-line fallback behavior for Chinese videos was fixed so cards no longer silently hide `Focus:` just because the fallback was too generic or collapsed into the title.
- README metadata was updated to reflect the current validated data scale:
  - `673` content items
  - `52` creators
  - `9` plan templates

### Validation Completed Today

- `npm test`
- `npm run validate:data`
- `npm run build`
- `npm run generate:translation-backlog`

### What Still Needs Improvement

- The bilingual work is meaningfully better, but it is still not “done” in a deep long-tail sense.
- The biggest remaining quality gap is **expanded library content in English mode**:
  - many Chinese videos now show a visible English `Focus:` fallback
  - however, a large number of expanded items still rely on generic English fallback titles / focus lines rather than hand-polished English phrasing
  - this is especially visible on long-tail Bilibili entries
- Related to that, some expanded-content metadata is still too coarse:
  - certain videos are tagged with broad skills like `basics` / `matchplay`
  - when that happens, the English fallback can feel generic even if it is no longer invisible
- The 5 remaining creator subtitle backlog items still need human-quality Chinese polishing:
  - `creator_2minute_tennis_video_02`
  - `creator_2minute_tennis_video_04`
  - `creator_total_tennis_domination_video_02`
  - `creator_tennis_hacker_video_08`
  - `creator_tennis_hacker_video_10`
- The creator-video Chinese subtitle system is now practical, but it is partly override-based rather than fully normalized back into creator data fields. This is acceptable for now, but could be unified later if the data model is cleaned further.
- Some bilingual surfaces are now fallback-safe rather than truly copy-complete:
  - they no longer leak Chinese incorrectly
  - but not every item has bespoke English copy yet
- The current repo state is therefore best described as:
  - **core bilingual study-mode and active surfaces are in place**
  - **long-tail content translation quality still needs another pass**

### Recommended Next Improvement Pass

- Prioritize the English long tail in the library by adding better `displayTitleEn` / `focusLineEn` coverage for the highest-traffic Chinese expanded content items.
- Review and refine coarse skill tagging in `expandedContents` where it is clearly producing weak English fallback titles.
- Finish the last `CONTENT_TRANSLATION_BACKLOG.md` items with human-approved Chinese subtitle phrasing.
- After that, do another visual QA pass specifically in:
  - `/library?lang=en`
  - `/diagnose?lang=en`
  - `/video-diagnose?lang=en`
  - creator modal / rankings / homepage hot cards

## Current System Snapshot

- Project: `TennisLevel`
- Current repo: `https://github.com/frankdarkluo/tennis_level.git`
- Current validated data snapshot:
  - Creators: `52`
  - Total content items: `673`
  - Static curated items: `39`
  - Expanded content items: `634`
  - Plan templates: `9`
- Primary platforms represented in the experience:
  - `Bilibili`
  - `YouTube`
- Current product stance:
  - low-friction guidance over exhaustive analytics
  - coach-grounded curation over fully open search
  - progressive disclosure over dense dashboards
  - source fidelity over aggressive recommendation automation

## SportsHCI Framing

The current implementation can be described as a **coach-grounded, interaction-light tennis learning system** that helps recreational players move from vague confusion to concrete next actions. The system is not trying to be a full social platform or generic content browser. Instead, it combines lightweight self-assessment, problem articulation, video-supported diagnosis, and coach-curated educational content into a single training support flow.

The design aligns well with several SportsHCI themes:

- `Situated self-improvement`
  - Users are not asked to quantify everything up front.
  - They can start from a felt problem, a short assessment, or a practice video.
- `Low-friction sports interaction`
  - Entry flows are intentionally short.
  - Most pages prioritize one next action rather than many competing controls.
- `Coach-grounded curation`
  - Recommendations are not purely popularity-based.
  - They are filtered and framed around player problems, levels, and training contexts.
- `Progressive disclosure`
  - Diagnosis pages reveal more detail only when the user asks for it.
  - This reduces cognitive load while keeping richer evidence available.
- `Human-interpretable support`
  - Results are phrased as “what to fix next” and “who to learn from,” not as abstract model scores.
- `Cross-platform sport learning ecology`
  - The content ecosystem bridges Bilibili and YouTube while preserving creator/source integrity.

## Cross-Page Design Principles

### 1. Start from the user's immediate problem
The homepage, diagnosis page, and video diagnosis page all assume that many players do not begin with a cleanly articulated training goal. They begin with something like “my backhand keeps going into the net” or “I do not know what to fix first.”

### 2. Hide raw complexity unless it helps action
Assessment scores, confidence values, and internal dimensions are preserved in data, but most user-facing pages reduce the presentation to a few actionable statements.

### 3. Preserve source authenticity
For content and creator data, the system prioritizes:
- correct creator-to-video mapping
- original source titles when available
- direct source links
- local thumbnail storage for stability when possible

### 4. Keep recommendation pages browsable but not chaotic
Both the creator ranking page and the content library now use lightweight controls, batching, and simplified cards to keep browsing manageable.

## Page-by-Page Implementation

## 1. Homepage `/`

### User role in the system
The homepage is the primary intake page. Its job is not to explain the whole product. Its job is to help users start.

### Current interaction design
The homepage currently has four major functions:
- a hero prompt for direct problem entry
- a compact “关注这些内容” section
- a compact “网球博主” section
- a large assessment CTA card that is fully clickable

### Main behaviors
- The hero supports free-text problem entry and quick-tag shortcuts.
- The primary CTA sends the user to `/diagnose` with the typed query in the URL.
- A secondary CTA sends the user to `/assessment`.
- The bottom assessment CTA card is clickable across the whole card, not just the button region.
- Hot content and hot creator sections are intentionally reduced in density.

### SportsHCI interpretation
This page works as a **minimal entry surface for sports self-support**. It does not force users to choose a formal workflow first. Instead, it supports multiple entry styles:
- symptom-first
- assessment-first
- video-first

### Key files
- `src/app/page.tsx`
- `src/components/home/HeroSection.tsx`
- `src/components/home/HotContentSection.tsx`
- `src/components/home/HotCreatorsSection.tsx`

## 2. Level Assessment `/assessment`

### User role in the system
This page provides a very short adaptive assessment that gives the system enough structure to personalize downstream guidance without exhausting the user.

### Current interaction design
The assessment is now an `8-step` adaptive flow:
- `2` profile steps
- `3` coarse screening questions
- `3` branch-specific fine questions

### Main behaviors
- Gender is selected with one tap.
- Years playing uses a slider with sparse visual labels but finer selectable values.
- Choice questions auto-advance after selection.
- The branch of the last three questions depends on the coarse score.
- The UI emphasizes speed and completion over survey-like seriousness.
- The assessment result is written locally and can also be stored remotely for authenticated users.

### SportsHCI interpretation
This page reflects a **low-burden sports profiling strategy**. Instead of presenting a traditional long form, it uses short interaction bursts to infer enough context for personalized coaching support.

### Research-relevant note
Years playing does not currently determine level directly, but it is stored for downstream personalization and is conceptually available for recommendation weighting.

### Key files
- `src/app/assessment/page.tsx`
- `src/data/assessmentQuestions.ts`
- `src/lib/assessment.ts`
- `src/components/assessment/QuestionCard.tsx`
- `src/components/assessment/AssessmentProgress.tsx`

## 3. Assessment Result `/assessment/result`

### User role in the system
This page translates internal assessment output into a user-friendly “where you are now and what to work on next” view.

### Current interaction design
The result page intentionally shows only three things:
- approximate level band
- strongest areas
- weakest areas / next priority

### Main behaviors
- The page loads the newest result from local storage or Supabase.
- Raw scores and confidence details are not foregrounded.
- Two primary next actions are shown:
  - diagnose a specific problem
  - browse suitable content

### SportsHCI interpretation
This page exemplifies **action-oriented feedback compression**. It turns measurement into a next-step coaching cue rather than a dashboard.

### Key files
- `src/app/assessment/result/page.tsx`
- `src/components/assessment/ResultSummary.tsx`

## 4. Problem Diagnosis `/diagnose`

### User role in the system
This page lets users describe a problem in natural language and receive a structured response that feels closer to coaching guidance than search results.

### Current interaction design
The page has three states:
- empty input state
- active diagnosis state
- three-layer expanded results

### Main behaviors
- Users can type a problem or click quick tags.
- The page can inherit level context from the assessment result.
- The result is organized into three disclosure layers:
  1. the core problem and one immediate fix
  2. why it likely happens and one recommended content item
  3. more content and platform search suggestions
- If no strong rule match exists, the page falls back to assessment-based or general guidance rather than failing silently.

### SportsHCI interpretation
This page implements **problem-to-practice translation**. It converts informal player language into a structured practice recommendation pipeline.

### Key files
- `src/app/diagnose/page.tsx`
- `src/components/diagnose/DiagnoseInput.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/lib/diagnosis.ts`
- `src/data/diagnosisRules.ts`

## 5. Video Diagnosis `/video-diagnose`

### User role in the system
This page supports users who have a real stroke or practice clip and want more concrete feedback than text alone can provide.

### Current interaction design
The video diagnosis flow is built around:
- lightweight metadata selection
- upload validation
- a staged processing UI
- a three-layer result page

### Main behaviors
- Users upload a video and optionally specify stroke type and practice scene.
- The browser extracts frames client-side before sending the payload.
- Usage limits are tracked for guest and authenticated users.
- The result page follows the same progressive disclosure logic as text diagnosis:
  1. primary issue + one key fix
  2. AI observations + cause explanation + one highlighted content item + plan CTA
  3. more content, recommended creators, search suggestions
- If evidence is insufficient, the system explicitly communicates uncertainty instead of overclaiming.

### SportsHCI interpretation
This page is the clearest example of **hybrid AI + coach-curated intervention**. The model produces a diagnosis scaffold, but the final learning path is still expressed through curated content, creators, and a training plan.

### Key files
- `src/app/video-diagnose/page.tsx`
- `src/components/video/VideoUploader.tsx`
- `src/components/video/VideoProcessingStatus.tsx`
- `src/components/video/VideoAnalysisResult.tsx`
- `src/lib/videoFrames.ts`
- `src/app/api/video-diagnose/route.ts`

## 6. Content Library `/library`

### User role in the system
The content library is the main browsing surface for educational videos. It is where diagnosis and assessment outputs become a manageable learning inventory.

### Current interaction design
The library is intentionally simplified:
- a search bar
- a platform dropdown
- an optional bookmarks filter
- batched loading with “查看更多”

### Main behaviors
- The library merges three sources:
  - static curated items
  - expanded generated items
  - creator featured videos
- Duplicate URLs are merged into one item.
- Thumbnail-backed items are shown first.
- Within that, ordering uses a mixed strategy:
  - partially randomized surfacing
  - partially boosted by view count
- Cards are fully clickable to source videos.
- Bookmarking is handled separately so card clicks and bookmark clicks do not conflict.
- Bilibili titles are cleaned for readability while trying to preserve source fidelity.
- Bilibili thumbnails are increasingly localized to improve stability.

### SportsHCI interpretation
The library functions as a **curated sport learning repository** rather than an open video feed. The emphasis is on learnability, source trust, and problem relevance.

### Key files
- `src/app/library/page.tsx`
- `src/components/library/LibraryFilters.tsx`
- `src/components/library/ContentCard.tsx`
- `src/data/contents.ts`
- `src/data/expandedContents.ts`

## 7. Creator Rankings `/rankings`

### User role in the system
This page helps users choose *who to learn from*, not only *what video to watch*.

### Current interaction design
The ranking page is now intentionally light:
- domestic / overseas toggle
- search box
- show `20` creators first, then `查看更多`
- creator detail modal

### Main behaviors
- Ranking uses a mixed score based on:
  - level match
  - content quality signals
  - curator / authority signals
- Search matches name, short description, bio, and tags.
- Creator cards are visually simplified.
- The creator modal shows curated featured videos and a homepage CTA.
- Creator/source identity is treated carefully; hidden creators are used where needed to preserve true upload source without polluting the main ranking list.

### SportsHCI interpretation
This page supports **coach selection as interaction**, which is especially relevant in sports learning ecosystems where creator trust and teaching style matter as much as topic coverage.

### Key files
- `src/app/rankings/page.tsx`
- `src/components/rankings/CreatorCard.tsx`
- `src/components/rankings/CreatorDetailModal.tsx`
- `src/data/creators.ts`

## 8. Training Plan `/plan`

### User role in the system
This page converts a diagnosis or level estimate into a short-term actionable plan.

### Current interaction design
The page is centered on “today first”:
- one headline summary
- a prominent `Day 1 / 今天`
- later days shown as follow-up structure

### Main behaviors
- The page reads `problemTag` and `level` from query params.
- If there is no upstream context, it nudges users back to assessment or diagnosis.
- Today’s plan is highlighted as the main action unit.
- Users can regenerate or save plans.

### SportsHCI interpretation
This page embodies **bridging diagnosis to practice structure**. Instead of stopping at feedback, it operationalizes what to do next.

### Key files
- `src/app/plan/page.tsx`
- `src/components/plan/PlanSummary.tsx`
- `src/components/plan/DayPlanCard.tsx`
- `src/lib/plans.ts`

## 9. Profile / My Record `/profile`

### User role in the system
This page acts as a personal history and lightweight memory surface rather than a social profile.

### Current interaction design
It aggregates:
- latest assessment
- diagnosis history
- video diagnosis history
- bookmarks
- saved plans

### Main behaviors
- Bookmark cards reuse the library card component in compact form.
- Saved plans can be revisited and expanded.
- The page is intentionally calmer than the library or diagnosis pages.

### SportsHCI interpretation
This page supports **continuity of practice**. It helps the user revisit prior guidance instead of starting over every session.

### Key files
- `src/app/profile/page.tsx`
- `src/lib/userData.ts`

## Content and Creator Curation Notes

### Why source fidelity matters in the paper
One of the strongest system-level claims available in the current implementation is that the project does **not** simply scrape tennis videos and present them as if they were equivalent. There has been repeated manual correction of:
- creator-to-video mismatches
- non-direct search entries
- misleading titles
- broken or missing thumbnails
- missing real uploader attribution

This is important for SportsHCI framing because the system is not just recommending content. It is doing **curated instructional mediation**.

### Current curation strategy
- Prefer direct source video links over generic channel links for content items.
- Preserve original source titles where possible.
- Normalize noisy Bilibili title prefixes only when they are clearly non-semantic decorations.
- Use hidden creators when a video needs truthful source attribution but the uploader should not become a ranked public creator.
- Keep Bilibili and YouTube together in one library, but preserve platform identity visibly.

## What Is Already Strong Enough for the Paper

These claims are already well-supported by the current implementation:
- the system supports multiple low-friction starting points into training support
- diagnosis is action-oriented and progressively disclosed
- the library is coach-grounded and cross-platform
- creator selection is personalized rather than pure popularity ranking
- the design intentionally reduces cognitive load for everyday recreational athletes
- the system bridges reflective understanding and actionable short-term practice

## What Should Be Described Carefully in the Paper

These are good contributions, but they should be phrased carefully:
- the assessment is approximate and guidance-oriented, not a formal rating engine
- AI video diagnosis is best described as assistive and uncertainty-aware, not authoritative biomechanical truth
- the content ranking is hybrid and curated, not fully automatic recommendation optimization
- view counts and creator popularity are supporting signals, not the core logic

## Suggested Paper Language Hooks

Possible phrases that fit the current product well:
- `coach-grounded content curation`
- `low-friction sports guidance workflow`
- `progressive disclosure for recreational athlete support`
- `problem-to-practice translation`
- `cross-platform tennis learning ecology`
- `source-faithful sports instruction mediation`
- `assessment-informed creator and content discovery`

## Key Files for Paper-Focused Inspection

If Claude or GPT-5.4 needs to inspect the implementation directly, these are the most useful starting points:

- `src/app/page.tsx`
- `src/components/home/HeroSection.tsx`
- `src/app/assessment/page.tsx`
- `src/app/assessment/result/page.tsx`
- `src/components/assessment/ResultSummary.tsx`
- `src/app/diagnose/page.tsx`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/app/video-diagnose/page.tsx`
- `src/components/video/VideoAnalysisResult.tsx`
- `src/app/library/page.tsx`
- `src/components/library/ContentCard.tsx`
- `src/app/rankings/page.tsx`
- `src/components/rankings/CreatorDetailModal.tsx`
- `src/app/plan/page.tsx`
- `src/app/profile/page.tsx`
- `src/data/creators.ts`
- `src/data/contents.ts`
- `src/data/expandedContents.ts`
- `src/data/diagnosisRules.ts`

## Final Handoff Note

If the paper needs a sharper contribution statement, the cleanest formulation is probably:

> TennisLevel is an interactive SportsHCI system that helps recreational tennis players move from ambiguous performance frustration to concrete next-step practice through lightweight assessment, problem-oriented diagnosis, source-faithful content curation, and coach-informed creator discovery.
