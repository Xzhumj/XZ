# Content Fidelity

## Core rule

The latest user-approved canonical input is the editorial source of truth.
Without an explicit current instruction, production adds visual design and
motion rather than new editorial content.

Default behavior:

- Add nothing.
- Remove nothing.
- Do not rewrite, summarize, expand, or reorder the source.
- Treat an unanswered suggestion as rejection.
- In this library, approximately 95% of projects should need no invented
  content.

## User-authorized edits

- The user's explicit instructions govern requested changes to picture,
  material, motion, transitions, visible text, subtitles, narration, voice,
  sound, pacing, duration, and editing.
- Treat an approved revision as the new canonical source and apply it to every
  affected scene, subtitle cue, voice track, and timing map.
- Do not invent facts, evidence, or claims beyond the requested revision. If
  the instruction is ambiguous or conflicts with supplied inputs, ask which
  version is authoritative before editing.
- Record the change, affected timecodes or segment IDs, and approval in the
  project records.

## Source audit

Before the production plan:

1. Assign a stable ID to every canonical sentence, subtitle cue, or transcript
   segment.
2. When a script and storyboard images are supplied together, treat the script
   as the authority for narration, visible text, wording, and order, and the
   storyboard as the authority for scenes, framing, composition, and visual
   sequence.
3. Do not rewrite, reorder, delete, add, or replace supplied script or
   storyboard content unless the user explicitly requests that revision. If
   they conflict, stop and ask which supplied version is authoritative.
4. Keep the canonical order.
5. Map every segment to one or more intended scenes or subtitle entries.
6. Mark every source segment as covered.
7. Verify that no source word is duplicated, omitted, inserted, or reordered.

The plan must show the source coverage map and the current canonical text,
including any user-approved additions, deletions, rewrites, or reordering.

## Allowed presentation changes

These changes do not alter editorial content:

- Sentence- or clause-level subtitle cue boundaries and whitespace that do not
  alter any character or punctuation mark. Burned subtitle cues stay
  single-line.
- Scene boundaries.
- Typography, color, layout, motion, and transition design.
- B-roll, screenshots, and other supporting visuals that do not introduce new
  claims.
- Non-semantic sound effects tied to visible actions or shot boundaries.
- Minor speed changes that preserve meaning and intelligibility.
- Removal of breaths and silent gaps.

Preserve the original words when splitting or regrouping text.

## Standalone-opening text

When a standalone opening is selected:

1. Use one continuous passage from the beginning of the canonical source.
2. Use the selected template, verified material-library entries, or
   user-supplied source assets for opening visual, motion, graphic, transition,
   and sound treatment. When the opening needs a new picture, search only its
   relevant material libraries. If no suitable source exists, request user
   material. A description, placeholder, template example, or self-generated
   picture cannot bypass that request.
3. Keep burned subtitles to one complete reading clause per single-line cue.
   A source sentence may use at most three sequential cues, within one scene or
   across scenes. Never apply character reveals or karaoke to subtitles.
4. Keep the opening normally 5-10 seconds. If it cannot fit, use only the
   permitted speed, breath, or silent-gap adjustments, propose another
   continuous source passage, or request approval of a different duration.
5. Produce a real opening sample and wait for `确认开头` before building the
   body.
6. After confirmation, mark the opening source segment IDs and SRT cues as
   consumed.
7. Start the body at the first unconsumed source segment.
8. Do not repeat a consumed word or SRT cue in the body.
9. Rebuild subtitle timing for the combined opening plus body.
10. Generate timeline keyframes from the rebuilt timeline and wait for
    `确认关键帧` before final rendering.

The opening and body together must contain every canonical word occurrence
exactly once in source order.

## Template text

Template-default titles, labels, CTAs, badges, lower thirds, and outro copy are
not source content.

- Disable them when possible.
- Replace them with an exact phrase from the canonical source when the slot is
  required.
- Keep every retained or replacement text layer within its current canonical
  sentence. Do not introduce a later source sentence before it begins.
- If a template-controlled text layer cannot respect the current sentence
  boundary, disable or replace it. If neither is possible, stop and report the
  exact layer and timecode.
- If no exact source phrase fits, disable or redesign the slot. Do not add new
  text.
- Never let polished English or Chinese template copy stand in for missing
  source content.

## Unauthorized text changes

Without an explicit current user request, do not add, delete, summarize,
paraphrase, expand, condense, replace, or reorder semantic text or narration,
including titles, transitions, examples, labels, summaries, claims, numbers,
testimonials, conclusions, CTAs, and outros.

When the user requests a text, narration, or voice change:

1. Record the exact approved revision.
2. Make it the new canonical source for affected segments.
3. Regenerate subtitles, voice timing, visual-group timing, and coverage checks.
4. Validate the keyframes and final video against the revised source.

When a template cannot fit the full source:

1. Extend duration.
2. Split the scene.
3. Reduce type size within the safe area.
4. Change layout within the template's supported parameters.
5. If it still does not fit, stop and report the blocker.

Never trim a sentence, drop a subtitle cue, merge different claims, rewrite
text, or materially accelerate speech to fit the template. Minor speed
adjustments are allowed only when meaning and intelligibility remain intact.
Removing audible filler words requires separate explicit confirmation.

## Authorized talking-head retake cleanup

When the user explicitly requests automatic stutter or failed-take cleanup, the
skill may remove only segments that satisfy all documented retake checks:

- A pause of at least the configured threshold, default two seconds.
- A repeated opening consistent with restarting the same passage.
- High transcript similarity with the following take.
- A following take that is substantially as complete or more complete.

Keep intentional rhetorical repetition, meaningful repeated claims, and
ambiguous pairs. The original recording remains intact. The cleaned cut and
regenerated SRT must pass keyframe review and final validation before delivery.

## Keyframe and final checks

For timeline keyframes and the final video:

- Compare subtitle text against the canonical source after ignoring approved
  presentation-only differences such as cue boundaries and timing.
- Confirm burned subtitles show one complete reading clause per single-line cue,
  may split a long sentence into at most three sequential cues at semantic
  boundaries, never show a later cue or two sentences together, and contain no
  character reveal, karaoke, or line-break tags.
- Confirm no text, title, emphasis word, or B-ROLL from a later sentence appears
  early.
- Confirm multi-stage B-ROLL graphic text is not shown as one undifferentiated
  block. Its semantic lines or phrases enter sequentially in exact source order,
  with later wording and later sentences gated by their own timing.
- Confirm every visual group carries no more than three consecutive canonical
  sentences. A shared background or main visual may continue through the group,
  but each sentence's dedicated text and B-ROLL enter only when that sentence
  begins.
- Confirm no scene or visual group contains only a script fragment below five
  visible characters, letters, or digits after excluding punctuation and
  whitespace; merge any such fragment into adjacent visual content.
- Confirm a long sentence's visual groups are strictly serial: the previous
  dedicated group must finish before the next group enters; a shared background
  may remain.
- Confirm every canonical word occurrence appears exactly once in source order.
- Confirm every supplied storyboard scene, sequence, framing intent, and scene
  owner is represented, or report the exact technical blocker.
- Confirm the opening consumed its source range and the body starts at the
  first unconsumed segment.
- Confirm every opening and scene picture has an explicit user source, a
  verified material-library source, a user-material request and response, or
  recorded AI-generation authorization.
- Search all visible template text for content absent from the source.
- Confirm narration and visible claims introduce no semantic content.
- Confirm order, names, numbers, units, dates, negation, and claim strength.
- Confirm the production plan, reviewed keyframe range, and final coverage map
  agree.

If any addition, deletion, rewrite, condensation, duplication, or reordering
differs from the latest approved canonical source, stop and correct the video
before delivery.

