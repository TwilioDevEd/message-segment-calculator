# Claude Code Review — PR #61

## Overview

Fix for GitHub issue #57: GSM extension characters (`|`, `^`, `{`, `}`, etc.) were double-counted when a message was forced into UCS-2 encoding by a non-GSM character.

**Root cause:** `EncodedChar` constructor stored GSM-7 code units (2 per extension char due to `0x1b` escape prefix) regardless of encoding mode. The `countSegmentUsed()` function in `segmenter.ts` sums `codeUnits.length`, so extension chars inflated the count.

**Fix:** Single conditional in `EncodedChar.ts` — when encoding is UCS-2, store `[char.charCodeAt(0)]` (1 unit) instead of the GSM-7 extension mapping (2 units).

## Strengths

- Minimal, surgical fix — one line of logic changed
- Root cause correctly identified and fixed at the source (`EncodedChar`) rather than patching downstream consumers
- `sizeInBits()` already had a special case for UCS-2 + GSM chars (lines 40-43), so the fix aligns `codeUnits` with that existing logic
- Regression test covers the exact scenario from the bug report
- All 667 tests pass, lint clean, build succeeds

## Issues

### Non-blockers

1. **Comment wording (resolved):** Copilot correctly noted that `charCodeAt()` returns UTF-16 code units, not Unicode code points. Comment updated in follow-up commit.

2. **Pre-existing `charCodeAt` vs `codePointAt` warnings:** IDE flags multiple `charCodeAt()` calls in the file. These are pre-existing and out of scope for this PR. For GSM-7 characters (all in BMP), `charCodeAt` and `codePointAt` are equivalent, so this is cosmetic.

3. **`extractCharDetails` in segmenter.ts already had a workaround** (line 43) that corrected code units for the char detail view. This PR fixes the root cause so the workaround is now redundant but harmless.

## Verdict

**Approve.** Clean, focused fix with proper test coverage. No regressions.
