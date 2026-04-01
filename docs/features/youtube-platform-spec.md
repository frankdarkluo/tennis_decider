# YouTube Platform Spec

## Scope

This document defines the required data shape and validation constraints for YouTube content in TennisLevel.

## Required fields

Each YouTube content item must include:

- `platform: "youtube"`
- `videoId`: 11-character YouTube video ID
- `url`: `https://www.youtube.com/watch?v=<videoId>`
- `thumbnailUrl`: `https://img.youtube.com/vi/<videoId>/maxresdefault.jpg`

Each YouTube creator record must include:

- `platform: "youtube"`

## Prohibited patterns

Do not store a YouTube search URL as a content item URL, including:

- `https://www.youtube.com/results?search_query=...`

Do not use playlist URLs as `url` for a single content item.

## Thumbnail fallback

Primary thumbnail:

- `https://img.youtube.com/vi/<videoId>/maxresdefault.jpg`

Fallback thumbnail when max resolution is unavailable:

- `https://img.youtube.com/vi/<videoId>/hqdefault.jpg`

## Validation checklist

For every new YouTube item, verify:

1. video ID format is valid (11 characters, alphanumeric plus `_` and `-`)
2. URL resolves to a real, accessible video page
3. thumbnail URL resolves (primary or fallback)
4. tags and category align with the actual video topic
5. creator platform and content platform are both `youtube`

## Study-mode compatibility

- Keep YouTube records deterministic and static for study runs.
- Do not introduce ranking-order side effects in `/library` or `/rankings` through YouTube ingestion changes.
- If a diagnosis route requires direct-source recommendations and no suitable YouTube direct source exists, return no YouTube recommendation for that slot.
