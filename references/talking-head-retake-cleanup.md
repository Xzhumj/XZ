# Talking-Head Retake Cleanup

## When to use

Use this workflow when a talking-head recording contains a failed attempt,
approximately two seconds of silence or more, and then a repeated, more
complete take.

This is a rough-cut automation, not an unrestricted semantic editor. It may
remove only a failed repeated take. It must not remove a deliberate emphasis,
a different claim, or content whose meaning cannot be established from the
transcript.

## Required evidence for an automatic cut

All four conditions must be true:

1. The later take begins after a pause meeting the configured threshold,
   default `2` seconds.
2. The later take repeats the earlier opening. Default prefix containment:
   `0.45`.
3. The normalized text is highly similar. Defaults:
   - Containment: `0.82`.
   - Similarity: `0.58`.
   - Minimum text length: `6` normalized characters.
4. The later take is substantially as complete or more complete than the
   earlier take. Default length ratio: `0.85`.

If the later take is shorter, stop automatic deletion and flag the pair for
review.

## Workflow

1. Preserve the original talking-head file and compute its SHA-256.
2. Run word-level local ASR:

   ```powershell
   hyperframes transcribe "<talking-head-file>" --language zh --json --to srt -o "<project>/素材/口播/原始字幕.srt"
   ```

   Read the JSON output and record the returned `transcriptPath`.

3. Analyze repeated takes, generate a clean SRT, and render the rough cut
   without overwriting source:

   ```powershell
   node "<skill-dir>/scripts/retake-cleanup.mjs" --transcript "<transcriptPath>" --media "<talking-head-file>" --output-dir "<project>/素材/处理/口播去卡顿_v1" --pause-seconds 2 --render
   ```

4. Inspect `retake-plan.json` and `retake-plan.md`.
   - Every automatic deletion must cite the earlier take and the later take.
   - Ambiguous pairs must remain uncut and appear in the review warnings.
   - A no-candidate result is valid. Never force a cut.

5. Re-transcribe `clean.mp4` and compare its transcript with `clean.srt`.
   Regenerate or repair subtitle timing if the cut changed word boundaries.
6. When the project uses a standalone opening, complete the timeline-keyframe
   gate after `确认开头`.
7. Use the cleaned media and synced SRT in the approved timeline.
8. Show the affected keyframes and wait for `确认关键帧`.
9. After `确认关键帧`, place the talking-head in the approved treatment and render
   the final video directly.

## Outputs

The helper writes:

- `retake-plan.json`: full takes, comparisons, cut ranges, kept words, warnings.
- `retake-plan.md`: human-readable cut decision report.
- `clean.srt`: subtitle file shifted onto the cleaned timeline. Each cue is one
  complete reading clause on one line; a long sentence may use sequential cues
  at comma boundaries. The helper never inserts line breaks or character-reveal
  timing.
- `clean.mp4`: optional rough-cut talking-head when `--render` is used.

The source audio and video are never modified.

## Visual cut handling

- Keep the speaker in sync with audio.
- Use straight cuts by default.
- Do not crop, stretch, or change speed to hide a cut.
- A short dissolve or motion cover may be used only when the selected template
  supports it and the affected keyframes have been approved.

## Limits

Do not claim automatic reliability for:

- Repetition without a long pause.
- Repetition with a different opening or a continuation that shares only a
  common tail.
- Non-adjacent retakes with other content between them.
- Meaningfully different paraphrases.
- Intentional rhetorical repetition.
- Overlapping audio sources that prevent reliable transcription.
- Cases where the later take sounds complete but omits required information.

Flag these cases for human review instead of cutting.

