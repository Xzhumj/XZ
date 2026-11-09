# Input Consistency

## Accepted combinations

A project may start with any one primary input:

- Copy.
- SRT.
- Speech audio.
- Talking-head video.

Multiple inputs are allowed only when they describe the same content. Examples:

- Copy plus SRT.
- Copy plus narration audio.
- SRT plus talking-head video.
- Copy, SRT, and talking-head video.

Unrelated topics must be split into separate projects. Images, logos, product
shots, and other supporting assets do not count as primary text sources.

## Check before matching and planning

Complete the consistency check after runtime preflight and before template
matching, storyboard work, or the production plan.

1. Inventory each supplied input and compute a SHA-256 hash for the source files.
2. Extract the SRT text, copy text, and ASR transcript.
3. Compare content in reading order.
4. Treat punctuation variants, whitespace, line breaks, and subtitle
   segmentation as presentation differences, not content conflicts.
5. Do not ignore differences in words, names, numbers, units, dates, order,
   negation, calls to action, or factual claims.
6. Treat a language difference as material unless the inputs are explicitly
   approved as translations of each other.
7. Listen to or inspect low-confidence ASR spans before declaring a conflict.
8. Record the chosen canonical text source, language, and any confirmed
   presentation-only differences in the production plan.

## ASR evidence

ASR is evidence about what was spoken, not automatically the authoritative
script.

- If the audio clearly matches supplied copy or SRT and ASR differs only because
  of recognition errors, resolve the difference as an ASR error and continue.
- If the spoken words differ from supplied copy or SRT in meaning, stop and ask
  which source is canonical.
- Preserve the supplied narration audio when it is approved as final audio.
- For SRT-only input, preserve the supplied subtitle timing.
- When SRT is supplied with audio or talking-head video and the texts agree,
  preserve the approved SRT wording and use the real speech timing for
  subtitles.
- Record any SRT-versus-speech timing differences in the production plan. Do
  not silently discard the supplied timing.

## Conflict handling

When a material difference remains, stop before template matching and report:

- The input pair or file names.
- The relevant timecode or copy segment.
- The exact differing text.
- Whether the difference affects names, numbers, claims, order, or meaning.

Then ask one concise question:

> 这些内容不一致。以文案、SRT、音频或口播中的哪一份为准？或者请提供修正版。

Do not proceed until the user selects a canonical source or supplies a corrected
version.

## User-directed changes

The user's explicit current instructions govern requested changes to picture,
text, subtitles, narration, voice, timing, or other video content. These
instructions override saved preferences and automatic recommendations.

- Treat the approved revision as the new canonical source for affected
  segments.
- Rebuild affected subtitle cues, voice timing, visual-group timing, scene
  mapping, and validation against that revision.
- Do not invent facts, evidence, or claims beyond the requested change. Ask
  before continuing when the target, wording, or authoritative version is
  ambiguous.
- Record the requested change and affected timecodes or segment IDs in the
  production plan.

## Single-input behavior

- Copy alone: build scenes and timed subtitles from the approved copy.
- SRT alone: preserve its words and order; timing may be regenerated for the
  approved structure or synchronized final audio. Narration is optional unless
  requested.
- SRT plus consistent speech: keep the approved SRT wording and use the real
  speech timing; document timing differences.
- Speech audio alone: transcribe it and use the verified transcript for
  subtitles; preserve the supplied audio.
- Talking-head alone: transcribe speech, preserve the original audio and every
  spoken word, and synchronize captions to the real speech. Only minor speed,
  breath, and silent-gap adjustments are allowed.
- Talking-head with long-pause repeated retakes: use word-level timestamps to
  identify only failed repeated takes with a repeated opening, then regenerate
  the SRT against the cleaned timeline. The cleaned text must retain every
  unique semantic segment.

