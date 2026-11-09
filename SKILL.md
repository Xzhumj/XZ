---
name: xz-video
description: "使用 MOTION .motion 模板库、Lemo-Opuscar 全部 66 种风格、VIDEO-SHOTCRAFT 的 INK-PRESS 模板与 124 张镜头卡、SHOWREEL-43 的 43 种动态风格，以及 Video Template Kit 检查层，将文案、SRT、语音音频、口播视频或脚本加分镜图制作成完整视频，并可自动识别口播中的长停顿重复重录。Use when the user wants talking-head retake cleanup, four-library template selection or matching, plan, standalone-opening, timeline-keyframe, an optional BGM decision with no-BGM default when unanswered, constant-level instrumental BGM when selected, engine checks, rendering, validation, delivery, saved production preferences, or a skill-upgrade proposal from completed projects; do not use for unrelated editing."
---

# XZ-video

## Purpose

Produce complete videos from copy, an SRT file, speech audio, a talking-head
video, or a video-production script with storyboard images using the user's
authorized MOTION `.motion` library, the Lemo-Opuscar style library,
VIDEO-SHOTCRAFT's INK-PRESS template and shot-card library, and SHOWREEL-43's
43-style library.
The approved visual direction may use one item or a deliberate combination from
any of the four template libraries.

Background music is optional. After the required timeline keyframes are
approved, ask whether the final video should include BGM. If the user does not
answer, use no BGM. When selected, use one constant-level instrumental track.
The standalone-opening sample always contains no background music.

A script-and-storyboard input is direct production: use the supplied storyboard
and script as the production plan, and use the eleven material libraries in
`Script and storyboard direct production` to fill the required picture,
motion, graphic, sound, transition, and camera content. Do not match or apply a
MOTION, Lemo-Opuscar, VIDEO-SHOTCRAFT, or SHOWREEL-43 template for that input.
The script and storyboard express creative intent; author any missing ordinary
scene motion during production instead of asking the user for keyframes or code.

Ordinary template-based work uses the selected template as a visual framework
and execution capability, not as a finished animation treatment. The canonical
content supplies meaning and timing. Author missing internal motion during
production within the selected template's declared native-motion, editable-slot,
overlay, and production-medium boundaries instead of asking the user for
keyframes or element-by-element code.

This is the single user-facing skill for this workflow. It combines the user's selection and approval process with the Video Template Kit configuration and health-check engine.

The user supplies content and creative intent. Handle template choice, planning, preview, rendering, validation, and delivery without making the user manage package internals, parameter schemas, or shell commands.

After receiving source content, verify the required runtime before template
matching or production planning. Runtime readiness is a hard gate, not a warning.
Do not resolve or validate all template and material libraries at startup; check
each library only when the current step actually needs it. At picture-generation
time, checking the material libraries relevant to the current scene is mandatory.

## Visual-content source resolution

Apply this rule to the standalone opening, storyboard or example frames, timeline
keyframes, final video, and every visual revision.

1. Follow any explicit visual asset, source, or treatment the user supplies for
   the current scene.
2. Do not scan every material library. When a scene first needs a picture,
   resolve only the libraries that scene actually needs and search for a verified
   suitable entry. Use a directly compatible entry when one exists.
3. If the relevant library is unavailable or contains no suitable usable entry,
   stop picture creation for that scene. Tell the user the exact scene or
   timecode, required picture, and missing library or source material, and ask
   the user to provide the library or source assets.
4. Do not use a verbal description, placeholder, template-bundled example, or
   newly generated picture to bypass that request.
5. Only after the user explicitly says they cannot provide the material or
   explicitly authorizes AI generation for that scene may Codex generate the
   picture itself. Silence is not approval.
6. When the user provides a library or source asset, use it as the scene's
   source, preserve the original files, and record its identity. When AI
   generation is authorized, record the request, user reply, authorization,
   target scene or timecode, and generated-file paths.

Creating new scene artwork, including an AI-generated image or a newly authored
illustration presented as the scene's subject, follows the approval above.
Ordinary layout, typography, motion, and transitions around approved source
assets do not require a separate generation approval.

## User authority

The user's explicit instructions for the current video govern every requested
change to the video, including picture content, source material, motion,
transitions, on-screen text, subtitles, narration copy, voice, sound, pacing,
duration, editing, and output treatment.

Follow the requested scope even when it differs from template defaults,
automatic matching, material-library recommendations, saved preferences, or the
default rules in this skill. Do not silently broaden, narrow, or replace the
request.

- When the user requests copy, narration, voice, timing, or picture changes,
  treat the approved revision as the new canonical source for all later work.
- Rebuild affected subtitles, voice, sentence and visual-group timing, scene
  mapping, and validation against the revised source.
- Do not invent facts, evidence, or claims beyond what the user requested. If
  the request conflicts with supplied inputs or is ambiguous, ask which version
  is authoritative before changing the video.
- Record each requested change, affected scene or timecode, and approval in the
  project records.

## Template libraries

Treat the following as the four user-facing template libraries:

- `MOTION`: the existing local `.motion` package library.
- `LEMO-OPUSCAR`: the Lemo-Opuscar library. Include all 66 styles currently
  listed in its official catalog.
- `VIDEO-SHOTCRAFT`: the bundled VIDEO-SHOTCRAFT library. Its complete
  full-film template inventory currently contains `INK-PRESS`; it also supplies
  124 shot cards and 150 styles as reusable material capabilities.
- `SHOWREEL-43`: the bundled 43-style dynamic visual library. Its complete
  inventory and 5-second previews are in `references/showreel-43.md`.

Use one selection model regardless of the library that will execute the work:

- For AI matching, resolve and search template libraries in this exact order:
  1. Search `LEMO-OPUSCAR` and `VIDEO-SHOTCRAFT` first. Evaluate both at the
     same priority tier.
  2. Use `SHOWREEL-43` only when neither first-tier library has a genuinely
     suitable executable item for the request.
  3. Use `MOTION` only when neither `LEMO-OPUSCAR`, `VIDEO-SHOTCRAFT`, nor
     `SHOWREEL-43` has a genuinely suitable executable item.
- A usable match in a higher-priority tier blocks every lower-priority library.
  Do not use a lower-priority library merely to fill a recommendation count.
  Recommend 3-5 suitable items when the successful tier contains that many;
  otherwise recommend only the suitable items found in that tier.
- Explicit user-selected templates or styles override this automatic matching
  priority.
- For self-selection, provide all four complete entrances in the same response:
  - The complete MOTION template list in `references/templates.md`.
  - The Lemo-Opuscar official online gallery:
    https://lemomo-ai.github.io/lemo-opuscar/
  - The complete VIDEO-SHOTCRAFT template, card, and style reference in
    `references/video-shotcraft.md`, its local gallery, and the official gallery:
    https://vincentwei1021.github.io/video-shotcraft/
  - The complete SHOWREEL-43 style and preview entry in
    `references/showreel-43.md`.
- Do not explain to the user that the four libraries use different underlying
  production methods. Show candidate names, previews, source labels, fit
  reasons, and compatibility results only.
- Treat a direct MOTION template name or ID, a direct Lemo-Opuscar style name or
  slug, a direct VIDEO-SHOTCRAFT template, card name, or style key, or a direct
  SHOWREEL-43 slug or Chinese style name as a completed self-selection. Do not
  ask the selection-mode question again.
- For execution, route a confirmed MOTION selection through its `.motion`
  package workflow, a confirmed Lemo-Opuscar selection through the installed
  `lemo-opuscar` workflow, and a confirmed VIDEO-SHOTCRAFT selection through the
  bundled VIDEO-SHOTCRAFT workflow, and a confirmed SHOWREEL-43 selection through
  its matching style document and production rules. This routing is internal.

Read [references/template-motion-direction.md](references/template-motion-direction.md)
before planning or executing ordinary template-based work. A template's ability
to place, scale, pan, or transition a whole scene does not prove that its
internal cards, text, icons, paths, data, people, objects, or other required
elements can move. Motion completion is part of production work wherever the
selected template exposes editable content or animation.

The Lemo-Opuscar official gallery is the user-facing complete catalog and preview
entry. Use the library's `styles/README.md` only to map a displayed name to its
local slug. Do not maintain a second 66-item catalog in this skill, and do not
replace the official gallery with a self-maintained list.

When Lemo-Opuscar or VIDEO-SHOTCRAFT is invoked through this skill, the
four-library matching and self-selection rules above take precedence over that
library's ordinary single-library suggestions. After an item is confirmed,
follow its exact template, card, and production instructions.

## Decision prompts

Every time a decision is required, state the exact reply words and what each
choice will do. Keep the prompt short enough for a non-technical user to answer
without guessing.

When asking whether content, effects, transitions, text, or another visual part
should be replaced, use these canonical replies:

- `需要替换`: perform the requested replacement.
- `不需要替换`: keep the current version and continue.

For example:

> 需要替换请回复“需要替换”，并写明目标场景或时间码、使用部位以及素材库和 ID；不需要替换请回复“不需要替换”。

Use similarly explicit reply pairs at every other approval gate. Continue to
accept natural-language answers when the user does not use the suggested words;
infer the intent, restate it when ambiguity remains, and do not make the user
repeat a valid answer merely because its wording differs.

The timeline-keyframe approval gate uses:

- `确认关键帧`: approve the timeline keyframes and authorize the final-render
  phase after the BGM decision.
- `需要修改关键帧`: keep the keyframe gate open, revise the requested keyframes,
  and do not render the final MP4.

The standalone-opening approval gate uses:

- `确认开头`: approve the real opening sample and allow the remaining body to
  be built.
- `需要修改开头`: keep the opening gate closed, revise the opening sample, and
  do not start body production.

Approval of the opening sample does not approve timeline keyframes or the final
MP4 render.

When a standalone opening is used, the approval sequence is mandatory:

1. Approve the production plan.
2. Build the real opening sample and wait for `确认开头`.
3. Generate timeline keyframes from the approved time-ordered timeline and wait
   for `确认关键帧`.
4. If the user has not chosen BGM, ask whether the final video should include
   BGM. If there is no answer when rendering starts, use no BGM.
5. Render the complete final MP4 and run final technical validation.

Do not skip a gate or treat one approval as another.

## Mandatory subtitles

Every delivered video must contain readable, time-synchronized subtitles burned
into the picture. A missing request for subtitles is not permission to omit
them.

- Always deliver matching SRT and ASS files with the final MP4.
- Never ask whether subtitles are needed. Determine their source and visual
  treatment from the selected input and template.
- Preserve the source language unless translation is explicitly requested.
- Keep subtitles inside the approved safe area and readable on both desktop and
  mobile viewing.
- Template titles, decorative words, and body copy do not satisfy the subtitle
  requirement unless they form a complete, readable, timed caption sequence.
- If a user later asks to omit subtitles, treat that as a change to this
  library-wide requirement and ask them to confirm it explicitly.

### Burned subtitle display

These rules apply to burned subtitles and the matching SRT and ASS subtitle
cues.

- Show exactly one complete reading clause per cue. A subtitle clause may end
  at a comma (`，` or `,`) or at sentence-ending punctuation (`。！？!?`).
  One canonical sentence may therefore produce several sequential subtitle
  cues.
- Split only at a natural clause boundary and never inside a word or an
  inseparable semantic unit. Do not split every comma mechanically when the
  result would be too short to read as a complete clause.
- Do not show two subtitle clauses at the same time. Cues from the same source
  sentence remain sequential and must not overlap.
- Show each subtitle cue on one line. Never insert a manual or automatic line
  break such as `\n` or `\N`.
- Burned subtitles must not use character-by-character reveal, typewriter,
  progressive masking, karaoke or word-by-word highlighting, or any other
  effect that displays part of the cue before the rest.
- When a subtitle clause begins, show its complete text as one whole line. The
  next clause enters only when its own audio or text timing begins.
- If a complete subtitle clause does not fit readably on one line, split it at
  natural semantic boundaries into at most three sequential subtitle cues.
  A source sentence may use at most three subtitle cues. Each resulting cue
  remains one line and appears in full when it starts. The split cues may stay
  in one scene or continue across scenes; later cues must not appear early.
- A segment with fewer than five visible characters, letters, or digits, after
  excluding punctuation and whitespace, must not be the only script-driven text
  in a scene or visual group. Merge it into adjacent visual content.
- If the text cannot fit in three readable single-line cues, stop and report the
  exact clause and layout limitation. Do not delete or rewrite source text.

### Sentence and visual-group timing

Use every canonical sentence as a timing gate for its text and
sentence-specific picture content.

- One visual group may carry a continuous passage of 1-3 canonical sentences
  when keeping one complete picture or scene serves the approved visual design.
  Never exceed three. A fourth consecutive sentence requires a new visual group.
- When any canonical sentence in a group begins, only that sentence's subtitles,
  titles, emphasis words, B-ROLL, and sentence-specific visual elements may
  enter. A shared background or main visual may continue, but no later
  sentence's dedicated content may appear early.
- Do not show text, B-ROLL, titles, subtitles, or emphasis words from a later
  canonical sentence before that sentence begins.
- Within the current canonical sentence, do not show all B-ROLL graphic text at
  once when it has multiple semantic stages. Reveal one semantic line or phrase
  at a time in exact source order. Earlier lines may remain, weaken, or exit;
  later semantic lines and later sentences stay hidden until their own timing.
  This does not apply to burned subtitles, SRT, or ASS and never permits
  character-by-character reveal.
- Burned subtitles follow their current canonical sentence and may change to a
  new cue at a complete subtitle-clause boundary within that sentence. Do not
  display a later clause or a second source sentence early.
- A long canonical sentence may use up to three sequential subtitle cues and
  either remain in one scene or continue across multiple scenes. Display the
  cues serially. When separate visual groups are used, the previous dedicated
  group must finish before the next group enters; a shared background may remain.
- Within one visual group, multiple visual elements may be composed and animated
  together. An already-started shared background or main visual may continue
  across later sentences, while each sentence's dedicated elements follow that
  sentence's own cue.
- When the next sentence begins, its own elements may enter or advance. The
  previous sentence may remain, weaken, or exit according to the approved
  picture design.
- Text from a template, material library, placeholder, or verbal description
  must follow the same sentence boundary. It must not introduce a later source
  sentence early or add semantic content.
- Rebuild affected sentence and visual-group timing after any speed adjustment,
  breath or silent-gap removal, opening split, retake cleanup, cue rebuild, or
  other change that moves the source audio or text.
- Enforce these boundaries in the standalone-opening sample and final MP4.

For editable B-ROLL typography, including titles, emphasis words, and key
phrases, choose a free, legible typeface from a verified material-library font
or typography entry, or from [Google Fonts](https://fonts.google.com/). Verify
that the actual font file licenses the intended use and covers every Chinese
character, Latin letter, number, punctuation mark, and symbol required by the
approved text before using it. Follow the font matching, licensing,
glyph-coverage, and recording rules in
[references/visual-asset-selection.md](references/visual-asset-selection.md).
Apply the font only where the production workflow treats the B-ROLL typography
as editable; preserve fixed template typography and branding. A font choice
does not change canonical wording or bypass subtitle and sentence timing.

For editable B-ROLL color, [Color Hunt](https://colorhunt.co/) is an approved
direct-use source for free color palettes. Match a palette to the approved
content, tone, and visual style, and verify contrast and legibility at final
size. A complete video may use at most **three distinct Color Hunt palettes in
total**, not three per scene. Count a palette by its unique Color Hunt URL or ID
and exact color set; reusing the same approved palette does not increase the
count. Preserve fixed template colors and branding, and do not use a palette
change to bypass the editable-visual repetition audit. Follow
[references/visual-asset-selection.md](references/visual-asset-selection.md)
for assignment and recording.

SRT carries the canonical subtitle text with one complete reading clause per cue
and one line per cue. A source sentence may use multiple cues when it is split
at comma or other natural clause boundaries. ASS carries the same subtitle text
and timing. Neither the SRT nor the ASS subtitle track may use karaoke,
character-reveal, progressive masking, or line-break tags.

## Background music

Background music is optional. After the required timeline keyframes are
approved and before rendering the final MP4, ask whether the final video should
include BGM. When a project has no keyframe gate, ask after the production plan
and any requested storyboard revisions are approved. If the user has not
already explicitly chosen, ask:

> 成片需要 BGM 吗？请回复“需要 BGM”或“不需要 BGM”。如果暂不答复，我会按不需要 BGM 制作。

If no answer has been received when final rendering starts, record the
unanswered default as `included: false` and proceed without BGM. Do not infer
consent from silence. Keep the standalone-opening sample free of BGM regardless
of this decision.

- When the user chooses BGM, select exactly one track from a verified material
  library or from
  [Pixabay Music](https://pixabay.com/music/). Confirm the actual downloaded
  file and its licence before use. Do not infer availability or licensing from
  a search result alone.
- When the user chooses BGM, use instrumental music only. Do not use lyrics,
  singing, rapping, spoken
  word, vocal chops that carry words, or any other vocal content. Check the
  actual audio file by listening; title, tags, and metadata alone are not proof.
- When the user chooses BGM, match the track to the canonical copy's theme,
  emotion, pace, and duration. Record why the selected track fits.
- When the user chooses BGM, use one single track in the final video. Keep one
  fixed gain for the whole asset. Do not switch tracks and do not use ducking,
  sidechain lowering, volume automation, rises, drops, fades, or any other
  time-varying level treatment.
- When BGM is included, set the fixed gain once so narration remains clearly
  dominant and
  intelligible. Do not rely on automatic ducking to rescue an unsuitable level.
- When BGM is included, measure the final master. Keep integrated loudness near
  `-14 LUFS` and true peak no higher than `-1 dBTP`. A BGM master that misses
  these limits is not acceptable.
- If the user chooses no BGM or gives no answer, the final video must not
  contain BGM. Do not source a track merely to leave it muted.
- Record the decision in `方案/BGM记录.json`, including `included` and
  `decisionSource` (`explicit-response` or `unanswered-default`). When BGM is
  included, also store the selected file under `素材/BGM/` and record its title,
  creator or artist when available, source library or Pixabay URL/ID, licence
  and attribution requirements, actual duration, constant gain, measured
  measured integrated loudness, measured true peak, and final-video path. Leave
  unknown metadata unknown rather than guessing.

## Inputs and consistency

Any one of these single inputs is sufficient to start production:

- Copy.
- SRT file.
- Audio containing narration or speech.
- Talking-head video.

A video-production script and a storyboard image set are also sufficient when
supplied together.

Multiple inputs are allowed when they represent the same content. Treat them as
one input bundle, not as separate projects. Before production planning, compare
the supplied copy, SRT text, ASR transcript, and spoken content in audio or
video. For ordinary template-based work, do this before template matching.

If words, names, numbers, units, dates, order, negation, or claims conflict,
stop and ask which source is authoritative or for a corrected version. Do not
silently merge, rewrite, choose one, or continue with a mismatched template
recommendation.

Read [references/input-consistency.md](references/input-consistency.md) whenever
more than one primary input is supplied or when audio/video requires
transcription.

## Script and storyboard direct production

When the user supplies both a video-production script and storyboard images,
treat the pair as the approved production plan and direct-production source.

Read
[references/storyboard-motion-direction.md](references/storyboard-motion-direction.md)
before planning or building any script-and-storyboard direct production.

- The script controls narration, spoken content, visible text, wording, and
  order.
- The storyboard controls scene count, scene order, framing, composition, camera
  intent, and visual sequence.
- The script and storyboard define creative intent, not an execution timeline.
  The user does not need to supply keyframes, code, or frame-by-frame motion
  instructions.
- When a scene's motion is absent, vague, or incomplete, author a complete
  element-level motion treatment from the narration, storyboard, visual
  emphasis, emotion, rhythm, and adjacent-scene continuity.
- Choose the simplest production capability that fully realizes the approved
  motion: HTML, SVG, Canvas, Three.js, Blender, WebGL, a vertex shader, or a
  fragment shader.
- Whole-frame zoom, pan, slide, fade, or blur alone does not satisfy an internal
  action required by the storyboard.
- Motion completion may not change the supplied scene count, order, framing,
  composition, subject, narrative meaning, or source assets without explicit
  user approval.
- Do not ask for template selection and do not select, recommend, match, or
  apply any MOTION `.motion` template, Lemo-Opuscar style, or VIDEO-SHOTCRAFT
  template. Do not replace a supplied storyboard scene with a template layout.
- The supplied script and storyboard are the plan. Template default semantic
  content and template-bundled examples are not available in this branch.
- If the script and storyboard conflict on wording, order, scene ownership, or
  visible claims, stop and ask which supplied version is authoritative. Do not
  choose one silently.
- Runtime preflight, input-consistency checks, content fidelity, mandatory
  subtitles, and language checks still apply.
- If the storyboard already defines an opening, treat it as part of the supplied
  direction and do not ask the separate standalone-opening question unless the
  opening is ambiguous.

Build the supplied storyboard directly. Use these eleven material libraries as
the content-source pool for animation, motion, picture elements, graphics,
sound, transitions, and camera language:

- CARD.
- Kitbitz.
- Meta Open Sound.
- UI SFX.
- The 192-entry motion-prompt catalog.
- React Video Editor.
- Remotion Scenes.
- Curvable Motion.
- Remotion Playground.
- Tabler Icons.
- VIDEO-SHOTCRAFT.

Use the relevant verified entries to complete each storyboard scene without
changing the storyboard's scene count, order, framing, composition, or visual
sequence. Do not run a separate all-library material-selection gate before the
production plan; resolve only the libraries a scene or sound cue actually
needs.

- Use CARD for motion, transitions, UI behavior, data, camera, typography, and
  effect ideas.
- Use Kitbitz for object and scene illustrations that explain the script.
- Use Meta Open Sound for realistic recorded foley, ambience, materials, and
  action sounds.
- Use UI SFX for designed clicks, switches, successes, warnings, loading, and
  other interface cues.
- Use motion-prompt, specifically its #001-#192 catalog entries, for motion,
  animation, entrance, exit, transition, camera language, UI behavior, web
  effects, and lighting or photo-look references. It is an asset catalog, not a
  skill dependency.
- Use React Video Editor only for editor UI, timeline, panel, control, and
  editing-interaction references.
- Use Remotion Scenes for scene, layout, camera, transition, text, UI, data,
  particle, background, and motion references.
- Use Curvable Motion's 14 components for text, background, and composite-scene
  references.
- Use Remotion Playground's current Composition IDs for text, transitions, data,
  3D, audio-reactive, particle, loading, media, and promotional scene
  references.
- Use Tabler Icons only for editable B-ROLL that explicitly names a clear
  object, action, or concept. Search for a semantically matching SVG icon,
  verify the current icon name in the local inventory or official gallery, and
  use it only when it improves clarity and remains legible at final size.
  Preserve fixed template graphics and branding.
- Use VIDEO-SHOTCRAFT only through its exact card name, style key, component,
  texture, or audio entry. Read its complete reference and the exact selected
  card document before adapting anything. Keep its 124-card system separate
  from the MOTION 124-Card system; IDs, card names, and style keys are not
  interchangeable.
- In script-and-storyboard direct production, any verified transition reference
  from these libraries may be adapted when it fits the supplied storyboard,
  scene sequence, and supported execution path. Template matching is not a
  prerequisite. A reference remains a reference unless the workflow supports
  direct import; never claim it was inserted as a ready-made transition.
- Treat CARD, Kitbitz, motion-prompt, Remotion Scenes, React Video Editor,
  Curvable Motion, Remotion Playground previews or renders, and online Tabler
  Icons entries as visual references or source assets unless the selected
  workflow supports rebuilding, downloading, or importing the requested visual.
  Never claim a reference or online icon was inserted directly.
- Resolve every material locator through the root plus relative-path rules in
  [references/visual-asset-selection.md](references/visual-asset-selection.md).
  Do not write a machine-specific absolute path into the skill.
- Do not guess asset names. Read the current catalogs and manifests and use only
  entries that actually exist.
- Do not force an incompatible asset. Explain the mismatch and offer an actual
  alternative.
- Record visual choices and the repetition audit in
  `方案/视觉元素匹配与重复率.md`; record sound IDs, cue timing, source, license,
  and attribution requirements in `sfx-cue-sheet.json` or the local SFX
  manifest copy.
- Do not pre-check every material library. For each picture, transition, or
  effect that actually needs material, resolve only the libraries that item
  needs and follow `Visual-content source resolution`. If the relevant library
  is unavailable or no usable entry exists, stop that picture and ask the user
  to provide the local library or source assets. A verbal description,
  placeholder, template-bundled example, or newly generated picture is not a
  substitute.
- For a sound cue, resolve only its relevant sound library. If that sound
  library is unavailable, ask the user for a local sound folder, package, or
  accessible inventory, or for a concrete sound treatment. The visual-source
  approval rule does not change this audio rule.
- If no compatible library entry exists, keep the required storyboard scene and
  do not substitute a template. Report the exact picture gap and request the
  missing local library or source assets. Use AI generation for that picture
  only after the user explicitly says no material will be provided or
  explicitly authorizes AI generation.
- Record each scene as a verified material-library entry, a user-supplied asset
  or supplied storyboard source, or an AI-generated picture with the recorded
  authorization. A plan may mark a scene as blocked pending user material, but
  a placeholder cannot pass into keyframes or the final video. Never claim a
  generated or placeholder picture came from a material library.
- Record every material library, verified ID, purpose, and target scene or
  timecode in `方案/视觉元素匹配与重复率.md`. Record sound IDs and cue timing in
  `sfx-cue-sheet.json`.

## Standalone opening recommendation

After the source input passes the runtime and input-consistency checks, and
before template matching or production planning, proactively offer an optional
standalone opening once. A standalone opening is normally 5-10 seconds and uses
a continuous passage from the beginning of the canonical source. Its visual,
motion, graphic, transition, and sound treatment may use the selected template
for ordinary template-based inputs, verified material-library entries, or
user-supplied source assets. For script-and-storyboard direct production, use
the supplied storyboard, user-supplied source assets, and the eleven material
libraries; do not use a template. Canonical source words remain unchanged. The
opening must present the exact source words under the sentence and visual-group
timing rules without rewriting, reordering, repeating, or inventing text.
If no usable library entry or user source covers an opening picture, stop and
request user material. AI may create that picture only after explicit user
authorization under `Visual-content source resolution`.

When an opening is used, produce a real opening sample first. Do not build the
remaining body until the user explicitly replies `确认开头`. Mark every source
segment ID and SRT cue used by the opening as consumed. The body starts at the
first unconsumed source segment, and the combined opening plus body must contain
every canonical word occurrence exactly once in source order.

For a talking-head video, use a stronger recommendation without forcing it:

> 这是口播视频。通常建议单独做一个短视觉开头，用模板库、当前场景真正相关的素材库或你提供的画面素材，先建立主题，再进入正式口播；这通常更利于第一印象和完播。独立开头不会改动你的原始口播内容。

Use the same recommendation for other inputs when an opening would improve the
first impression, without claiming it is mandatory. Ask:

> 独立开头怎么做？请回复“我来选开头”“AI匹配开头”或“不加独立开头”。

- `我来选开头`: provide the relevant available material galleries, lists, or
  manifests without pre-checking every library. Ask for one or more library IDs
  or scene names, and ask the user to provide source assets for any picture
  that has no suitable entry. A plain-language description may refine an
  approved source but does not replace the source-material request.
- `AI匹配开头`: use the title, opening source line, theme, tone, ratio, and
  approved template direction to propose a concrete executable combination
  from verified available sources and user-supplied assets. List verified IDs
  when material libraries are used. If a required picture has no usable source,
  identify the exact gap and request user material instead of proposing a
  placeholder or self-generated replacement. Include the exact source segment
  range and planned 5-10 second duration.
- `不加独立开头`: keep the original structure and continue without an opening.

Ask exactly once per project. Skip the prompt when the user already chose an
opening route or a resumed project records the decision. Record the decision
and source types in `方案/制作选项.md`; when an opening is used, also record its
visual mapping in `方案/视觉元素匹配与重复率.md`. Include the decision and
source records in the production plan. At execution time, check only the
libraries that the opening actually calls. If a required library is missing or
has no usable entry, ask the user to provide the library or source assets. AI
generation is allowed only after the user explicitly says no material will be
provided or explicitly authorizes it.

## Content fidelity

The final video must faithfully represent the canonical source content.
With explicit user approval, the canonical source may be amended before
production or during revision; validate against the latest approved version.

- Default to zero additions.
- Do not invent titles, explanations, examples, claims, transitions, CTAs,
  conclusions, data, testimonials, or outro copy.
- Do not delete, insert, summarize, paraphrase, shorten, expand, replace, or
  reorder any source text or spoken word unless the user explicitly requests
  that change.
- Preserve words, names, numbers, units, dates, negation, qualifications, call
  to action, and claim strength in the latest approved canonical version.
- Allow presentation-only changes such as spacing around unchanged punctuation,
  sentence- or clause-level subtitle cue boundaries, scene splitting, and
  visual layout. Burned subtitle text remains one complete reading clause per
  single-line cue.
- Allow only small speed adjustments that do not impair meaning or
  intelligibility, and removal of breaths or silent gaps. Removing audible
  speech tokens such as filler words requires separate explicit confirmation.
- Disable or replace template-default semantic text. Template text is not
  approved source content.
- If the layout cannot fit the source text, extend duration, split scenes, or
  adjust typography. Do not condense, trim, or rewrite the text to fit without
  an explicit user request.
- Every canonical word occurrence must appear exactly once in the final
  timeline. A standalone opening consumes its source range rather than
  duplicating it.
- Changing speed or removing breaths or silent gaps does not authorize changing
  subtitle text. Regenerate subtitle timing against the resulting audio.

Read [references/content-fidelity.md](references/content-fidelity.md) before
building the production plan, coverage map, or final validation.

## Output language

The final video language follows the canonical input, not the template's demo
language.

- When the canonical input is Chinese, every visible text element created for
  the final video must be Chinese.
- This includes titles, subtitles, labels, captions, buttons, CTAs, data labels,
  lower thirds, callouts, transition text, outro text, and default template
  copy.
- An English template preview may be used to choose visual style, but its
  English demo text is not the final version.
- Localization does not authorize new semantic content. Localized template text
  must come from the canonical source without changing any words.
- Preserve the input's Simplified or Traditional Chinese variant unless the
  user explicitly requests conversion.
- Keep user-supplied brand names, product names, model numbers, URLs, code,
  acronyms, units, and proper nouns unchanged unless the user provides a
  Chinese replacement.
- If any selected template contains non-editable English text that cannot be
  changed, hidden, or rebuilt through its declared workflow, stop and report
  the exact blocker. Do not deliver a mixed-language final video or silently
  switch templates.

Read [references/output-language.md](references/output-language.md) whenever the
canonical input language differs from the template's default or demo language.

## Capability boundary

The bundled engine currently provides toolkit discovery, configuration, catalog discovery, and `doctor` checks.

Treat a feature as available only when:

- The toolkit's `kit.json` reports that feature as `true`.
- `doctor --json` reports no failed dependency for it.

The engine is a prerequisite and health-check layer, not proof that a production feature exists. Actual template execution must use the selected `.motion` package's own declared production entry.

Never describe an unavailable engine feature as implemented.

## Locate the template libraries

Resolve a template library only when the current matching or execution step
needs it. Do not run any resolver as a startup pre-check.

### MOTION library

Resolve the Motion template library root in this order:

1. `MOTION_TEMPLATE_LIBRARY_ROOT`, but only after confirming it exists.
2. The current working directory when it contains the required library files.
3. When this skill is stored inside the library, the skill directory's grandparent.
4. Otherwise, ask the user one concise question for the library folder path.

Do not stop at an invalid environment-variable path. Continue to the next valid source.

A valid Motion template library contains:

```text
template-number-index.csv
template-preview-index.csv
previews/
gallery/index.html
CARD_LIST.md
MT-*.motion
```

Resolve preview and template paths against this library root. Never hard-code the current machine path into the skill.

The skill's [references/templates.md](references/templates.md) is the authoritative list for this library. Do not replace it with the Video Template Kit's separate public catalog.

### Lemo-Opuscar library

Resolve the Lemo-Opuscar library in this order:

1. `LEMO_OPUSCAR_ROOT`, but only after confirming it exists.
2. The library path documented by the installed `lemo-opuscar` skill, if that
   path exists.
3. `$HOME/lemo-opuscar` when it exists.
4. Otherwise, ask the user one concise question for the library folder path.

A valid Lemo-Opuscar library contains:

```text
AGENTS.md
DIRECTOR.md
TECHNIQUE.md
styles/README.md
styles/<slug>/STYLE.md
```

The current official catalog contains 66 styles. Verify that a chosen name or
slug resolves to an existing directory before recommending or using it. Use
`styles/README.md` for the name-to-slug lookup and
[the official gallery](https://lemomo-ai.github.io/lemo-opuscar/) for user
previews. Do not copy the full catalog into this skill.

### VIDEO-SHOTCRAFT library

Use the bundled library at the skill-relative path
`assets/vendor/video-shotcraft`. It is portable with the skill and requires no
external root lookup for its cards, styles, components, audio, or INK-PRESS
template.

Required entries:

```text
SKILL.md
template/TEMPLATE.md
gallery/library.html
gallery/api/library.json
assets/
THIRD-PARTY-NOTICES.md
```

Read [references/video-shotcraft.md](references/video-shotcraft.md) for the
complete template, card, style, category, source, and preview index. For a
local visual gallery, run:

```powershell
node "<skill-dir>/scripts/gallery-video-shotcraft.mjs"
```

Open `http://127.0.0.1:4173/library.html`. The same server exposes the current
inventory at `http://127.0.0.1:4173/api/library.json`. The official gallery is
<https://vincentwei1021.github.io/video-shotcraft/>.

`INK-PRESS` is the first complete full-film template in this library. Its
canonical production brief is `template/TEMPLATE.md`. The library contains 124
cards, 150 styles, and 10 categories. The local package includes poster images
for part of the dynamic catalog; do not claim every dynamic preview is available
offline.

## Preflight

Once the user has supplied copy, SRT, speech audio, a talking-head video, or a
script and storyboard pair, run the runtime gate before matching, recommending
templates, writing a storyboard, or generating a preview:

On Windows, run the bootstrap first. It is safe to run on every task and uses
the built-in Windows PowerShell 5.1 host when PowerShell 7 is not available:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/bootstrap-environment.ps1" -RunPreflight -ProjectRoot "<project-root>" -Json
```

The bootstrap installs missing Node.js 22+, PowerShell 7, FFmpeg, and ffprobe
into the current user's Codex tools directory. It does not require administrator
privileges. It immediately runs the Node preflight in the same process, so newly
installed commands are visible even when the parent shell PATH is stale.

When Node.js is already available and the bootstrap has already run, preflight
may be invoked directly:

```powershell
node "<skill-dir>/scripts/cli.mjs" preflight --json --project-root "<project-root>"
```

Pass `--kit-root "<toolkit-root>"` only when the toolkit path is already known.
The report must include six required checks:

- Node.js 22 or newer.
- PowerShell 7 or newer.
- FFmpeg and ffprobe.
- HyperFrames CLI.
- Remotion.
- Video Template Kit through its bundled `doctor`.

Preflight automatically installs every missing required runtime. This is
standing permission for the required environment described in this skill:

- Remotion is installed from the official npm packages pinned to `4.0.539` in
  the user's Codex tools directory, with a local command shim.
- HyperFrames is installed from the official `hyperframes` package into the
  user's Codex tools directory, with a local command shim.
- Video Template Kit is created from the bundled foundation metadata in the
  user's Codex tools directory and registered in the local configuration.

Do not ask whether to install a missing required runtime that this skill can
install under the user's Codex tools directory. Rerun with the permission
needed for that directory, process execution, or network access when automatic
installation is blocked.

If the report is not `ok`, stop before production planning and report the exact
failed IDs, paths, versions, and hints. Do not treat a missing required runtime
as a warning or substitute another renderer. Ask only when installation would
require administrator privileges, a machine-wide package or service, acceptance
of a separate license, account login, a paid resource, or an undeclared
third-party package.

Read [references/environment-preflight.md](references/environment-preflight.md)
when the gate fails or when a non-required dependency is needed.

Do not validate the MOTION, Lemo-Opuscar, or VIDEO-SHOTCRAFT library merely
because production is starting. Validate a selected template library at the step
that first needs to read or execute it. If an external library is unavailable,
ask the user for its local folder, package, or accessible inventory before
continuing.

The runtime preflight already installs a missing Video Template Kit foundation
and runs its `doctor`. Use the following command only when an existing toolkit
needs explicit registration or repair:

```bash
node "<skill-dir>/scripts/cli.mjs" install --kit-root "<toolkit-root>"
```

For non-required dependencies, check them only at first use. If they are
declared by the selected project's reviewed manifest or lockfile, install them
into the project or user tool cache without changing the global environment,
then rerun that dependency's health check. Ask once before administrator-level
changes, machine-wide PATH or driver changes, license acceptance, account
login, paid services, or installation of undeclared packages. Other user-level
optional dependencies are auto-installed at first use:

```powershell
node "<skill-dir>/scripts/cli.mjs" ensure-dependency <component> --project-root "<project-root>"
```

Supported components:

- `browser`: install the HyperFrames rendering browser.
- `html`: verify the browser can create and render DOM and CSS content; install
  the rendering browser first when missing.
- `svg`: verify SVG creation, geometry, and rendered bounding boxes; install the
  rendering browser first when missing.
- `canvas`: verify Canvas 2D drawing and pixel readback; install the rendering
  browser first when missing.
- `threejs`: resolve or install Three.js in the project, instantiate its core
  scene API, and verify WebGL rendering support.
- `blender`: find and start Blender, or install a user-level portable Windows
  build when Blender is missing.
- `webgl`: verify a real WebGL context, draw, and pixel readback; install or
  repair the rendering browser when needed.
- `vertex-shader`: compile a vertex shader, link it, draw, and read back the
  rendered result; install or repair the browser and WebGL path when needed.
- `fragment-shader`: compile a fragment shader, link it, draw, and read back the
  rendered result; install or repair the browser and WebGL path when needed.
- `asr`: run HyperFrames transcription with its runtime/model installer.
- `tts`: install uv, managed Python, `kokoro-onnx`, and `soundfile`, then use
  the returned `HYPERFRAMES_PYTHON` path for local TTS.
- `python`: install uv and managed Python.
- `uv`: install the official uv executable.
- `template`: install dependencies declared by every selected template's
  reviewed JavaScript or Python manifest and lockfile.

Always read the JSON result and use any returned environment paths. Do not
claim success when `status` is `failed`.

### On-demand picture-capability gate

Apply this gate per scene or transition when a picture is first assigned to one
of these eight production capabilities:

- HTML.
- SVG.
- Canvas.
- Three.js.
- Blender.
- WebGL.
- Vertex shader.
- Fragment shader.

Check only the capability the approved scene or transition actually uses. Do
not pre-check or install all eight, and do not make an unused capability part of
the production direction. Detection and installation happen in this order:

1. Resolve the selected capability and run its real health check.
2. If it is missing, install or configure it under the user-level or
   project-level rules above.
3. Re-run the same real check after installation.
4. Record the capability, check result, installed version or path when
   available, target scene or timecode, and selected role in the production
   plan and `方案/视觉元素匹配与重复率.md`.
5. Continue only when the post-install check passes. If installation or the
   check fails, stop that scene and report the exact failed capability, command,
   error, and blocking condition. Do not substitute a different medium silently.

Use the matching component ID with `ensure-dependency`:

| Capability | ID | Required proof |
| --- | --- | --- |
| HTML | `html` | DOM nodes render with computed CSS |
| SVG | `svg` | SVG geometry is created and has a rendered bounding box |
| Canvas | `canvas` | Canvas 2D draws and returns the expected pixel |
| Three.js | `threejs` | Project module resolves, core scene objects instantiate, and WebGL passes |
| Blender | `blender` | The executable starts and reports its version |
| WebGL | `webgl` | A WebGL context draws and returns the expected pixel |
| Vertex shader | `vertex-shader` | Vertex shader compiles, links, draws, and returns the expected pixel |
| Fragment shader | `fragment-shader` | Fragment shader compiles, links, draws, and returns the expected pixel |

HTML, SVG, Canvas, WebGL, and both shader capabilities use the HyperFrames
rendering browser. Three.js uses a project dependency plus the verified WebGL
path. Blender uses its own executable. A successful package download or file
existence check is not proof that the capability works.

After the first template-library root is resolved for actual use, read its
`创作偏好.md` when it exists. Apply only relevant saved preferences. Explicit
current instructions always override saved preferences.

If `学习状态.json` reports `needsUpgradeProposal: true`, mention it once without interrupting the current video task.

## Required references

Read [references/templates.md](references/templates.md) when:

- The user wants to choose a template.
- The user asks for recommendations.
- The user names a template ID.
- A plan or scene needs template capabilities checked.

Read [references/template-motion-direction.md](references/template-motion-direction.md)
before planning or executing any ordinary template-based work. Use it to
classify each template scene and editable slot as native motion, editable slot,
fixed overlay area, or sealed or unsupported capability, and to author the
missing internal action within that boundary.

Read [references/video-shotcraft.md](references/video-shotcraft.md) when:

- The user chooses `VIDEO-SHOTCRAFT` or `INK-PRESS`.
- The user names a VIDEO-SHOTCRAFT card name, style key, category, or material.
- AI matching evaluates the third template library.
- A scene uses a VIDEO-SHOTCRAFT card, component, texture, or audio asset.

Read [references/operating-contract.md](references/operating-contract.md) before production work. It defines source isolation, review gates, output standards, recovery, and security boundaries.

Read [references/input-consistency.md](references/input-consistency.md) before
combining multiple inputs or validating a transcript against supplied text.

Read [references/content-fidelity.md](references/content-fidelity.md) before
mapping source segments to scenes or checking for additions and omissions.

Read [references/output-language.md](references/output-language.md) before
localizing a template or validating the language of timeline keyframes or the
final video.

Read
[references/visual-asset-selection.md](references/visual-asset-selection.md)
before choosing scene visuals, replacing template content, or auditing visual
repetition.

Read [references/learning-loop.md](references/learning-loop.md) before applying saved preferences, recording a project review, or proposing a skill upgrade.

Read [references/sfx-library.md](references/sfx-library.md) when planning
picture transitions or other sound effects, or when an existing edit needs
stronger transitions, UI accents, impacts, or foley. Its local and online
locators follow the same root-plus-relative-path convention as the
material-library guide.

Read [references/card-effects-review.md](references/card-effects-review.md) before
the post-render effects review or any material-library-driven revision.

Read [references/visual-feedback.md](references/visual-feedback.md) before
presenting storyboard images, timeline keyframes, or a revised material-library
treatment.

Read
[references/talking-head-retake-cleanup.md](references/talking-head-retake-cleanup.md)
when a talking-head recording contains a failed take followed by a repeated
take after a long pause.

## Mandatory motion principles

Every video and animation must follow the twelve principles of animation.

- Animate different elements separately, and animate separate parts within an
  element separately. Stagger their entrances and exits rather than moving the
  entire group as one block.
- Treat camera motion, object motion, and scene-transition motion as separate
  layers. A camera move cannot substitute for an object action required by the
  storyboard.
- Keep a motion treatment specific enough to show what each primary and
  supporting element does, when it starts, how long it lasts, how it settles,
  and which elements intentionally remain still.
- Use whole-frame camera motion only as composition, emphasis, or continuity.
  When the storyboard requires an internal action, author that action on the
  relevant elements even when the supplied storyboard shows only one still.
- Match easing curves to the action and connect successive motions so the
  result feels natural, fluid, and rhythmic.
- Preserve the existing visual design and layout. Motion must not require
  unauthorized repositioning, resizing, or redesign of the original frame.
- Preserve the template's fixed format and protected structure. Editable visual
  slots may use a treatment from any verified material library only when the
  selected template's declared workflow supports the change.
- In ordinary template-based work, use the template's native motion first.
  When a native motion is insufficient but the template exposes editable
  content, author element-level motion inside the editable slot. Use an
  independent overlay only where the declared workflow permits it.
- A template whose required internal layer is sealed or unsupported is a
  capability blocker. Do not use a whole-frame push, pan, zoom, fade, blur, or
  unrelated transition to pretend that the missing internal action was
  delivered.

For animation revisions, use the library's:

- `gallery/index.html`
- `CARD_LIST.md`
- `src/motion/motion-catalog.json`
- Selected `.motion` package

## Picture-transition design and audit

Every picture transition must use a verified sound effect that matches the
visible action and transition peak. The sound may come from the template's
native SFX, Meta Open Sound, UI SFX, or the verified supplemental local SFX
index. Record its library, asset ID, cue time, purpose, license, and local path.
Never invent a sound asset or let a transition sound mask narration.

Every non-hard-cut transition must be smooth and continuous, with coordinated
easing. A fade or crossfade must include both its fade-out and fade-in; never
accept only one half. Hard cuts are instantaneous and do not require transition
easing or paired fades.

Build the animation between storyboard scenes with the production medium that
fits the approved picture:

- **HTML**: simple layouts, text, cards, images, layers, basic motion, fades,
  wipes, and UI-like movement.
- **SVG**: editable vector shapes, line drawing, masks, charts, diagrams, icon
  motion, and precise two-dimensional transformations.
- **Canvas**: pixel-based drawing, particles, complex two-dimensional effects,
  procedural graphics, and dense motion that is impractical as DOM elements.
- **Three.js**: three-dimensional scenes and 2.5D depth, perspective, camera
  travel, parallax, layered depth, and spatial transitions.
- **Blender**: material, lighting, texture, reflection, physical realism, and
  other high-quality rendering that the web-rendered media cannot
  achieve convincingly.
- **WebGL**: browser-rendered effects that need a direct graphics pipeline,
  custom buffers, procedural rendering, or real-time GPU work beyond ordinary
  HTML, SVG, Canvas 2D, or standard Three.js usage.
- **Vertex shader**: geometry deformation, wave, morph, displacement, particles,
  or camera-space effects that must be calculated per vertex.
- **Fragment shader**: per-pixel color, texture, mask, light, noise, dissolve,
  distortion, or procedural material effects that must be calculated per pixel.

For suitable two-dimensional work, prefer SVG or Canvas. Use HTML when the
picture is simple enough that a full Canvas or Three.js scene would add
unnecessary complexity. Use Three.js when the scene specifically needs 3D or
2.5D spatial treatment, not merely because it is complex. Use WebGL directly
only when the picture needs a custom graphics pipeline that Three.js or Canvas
does not fit cleanly. Use a vertex or fragment shader only when the approved
motion or material genuinely needs shader work. Shader capabilities require a
working WebGL path. Choose the simplest capability that fully achieves the
approved visual result.

Blender may:

- create materials, textures, still images, and reusable assets for a downstream
  HTML, SVG, Canvas, Three.js, WebGL, vertex-shader, or fragment-shader
  composition; or
- render the storyboard-to-storyboard animation directly when material,
  lighting, or physical realism requires it.

Record which Blender role was used and where its output is integrated.

Material libraries supply content, references, or source assets; they do not
determine the production medium.

- When a library item is already an editable or directly importable HTML, SVG,
  Canvas, Three.js, WebGL, vertex-shader, or fragment-shader component, it may
  be used directly inside that medium.
- When a library item is only a preview, GIF, MP4, demo, or visual reference,
  use it as reference or as a composited texture or asset inside the chosen
  medium. Do not treat the whole pre-rendered clip as the completed
  storyboard-to-storyboard animation unless the user explicitly authorises it
  or it is an approved direct Blender render.
- A directly usable template-native transition remains valid only when the
  selected template's declared workflow can execute it. Record it as
  template-native, not as a material-library insertion.
- Sound assets are unaffected by this picture-production rule and continue to
  follow the SFX matching, licence, timing, and repetition rules.

Resolve every picture transition in this exact order:

1. Classify the required picture as simple 2D, complex 2D, 2.5D, 3D, or
   material-quality rendering.
2. Search the relevant sources for a verified transition that is already
   directly compatible with the selected template or production medium. Use it
   when it satisfies the approved picture, motion, duration, SFX, and
   content-fidelity rules.
3. If no suitable transition can be used directly and the transition can be
   expressed through depth, perspective, parallax, camera travel, or layered
   space, build a 2.5D transition with Three.js. Run its on-demand capability
   gate and record the source as an authored Three.js transition.
4. Only when the first two options cannot satisfy the approved visual or
   technical requirement, use visual replication: rebuild a verified reference
   in the appropriate supported medium and record it as an adaptation.
5. When Blender is selected for visual replication or material-quality output,
   record whether it renders the complete transition
   or supplies assets to a downstream HTML, SVG, Canvas, Three.js, WebGL,
   vertex-shader, or fragment-shader composition.

A preview or visual reference is not direct use. A Three.js 2.5D transition is
not a direct library insertion. Record a rebuilt item as an adaptation, not as
a directly inserted template. Every option remains subject to the transition
duration, SFX, repetition, content-fidelity, and output-language rules.

- A standard non-hard-cut transition must not exceed **0.5 seconds** in total.
- A complex transition may exceed 0.5 seconds only when its visual treatment
  requires the extra time. Its maximum total duration is **0.8 seconds**.
- Let `Q` be the total number of picture-transition slots in the complete video,
  including hard cuts and other cuts. For `C` complex-transition slots, require
  `C <= floor(Q × 10%)`. A complex transition exceeding this allowance fails the
  plan and must be replaced with a standard transition or hard cut.
- The 10% complex-transition allowance is a frequency limit and is not a
  repetition rate. Keep it separate from the 20% picture-transition repetition
  audit and from the editable- and template-fixed repetition audits.

Do not default every transition to Three.js, WebGL, or a shader. Use each only
when the approved picture needs that capability. If the selected medium is
unavailable after its automatic installation and verification attempts, explain
the exact capability gap and select another approved medium only with the
user's approval before rebuilding the transition.

For script-and-storyboard direct production, transitions from the eleven material
libraries may be used when they fit the supplied storyboard and the execution
path supports them. The supplied scene count, order, framing, composition, and
visual sequence remain authoritative.

## Pexels B-ROLL photo sourcing

Use [Pexels Chinese site](https://www.pexels.com/zh-cn/) as an optional source
of real photographic B-ROLL when the canonical sentence or visual group names a
person, action, object, place, scene, or emotion that a verified photo can
explain more concretely and accurately. Pexels is a photographic B-ROLL source,
not one of the eleven material libraries. It does not determine the HTML, SVG,
Canvas, Three.js, Blender, WebGL, vertex-shader, or fragment-shader production
medium.

1. Derive the photographic search intent from the current canonical sentence or
   visual group. Record the people, action, object, setting, mood, orientation,
   and framing that the photo must communicate. Do not choose a merely related
   decorative photo that does not help explain the current content.
2. Compare candidates for factual fit, visual clarity, resolution, subject
   anatomy and completeness after cropping, landscape or portrait suitability,
   subtitle safe area, and A-ROLL occlusion. The photo must not cover the A-ROLL
   person in any A-ROLL layout mode.
3. Re-check the current Pexels license and the image page's author or
   attribution requirements before use. Do not infer rights from a thumbnail,
   search result, or an old summary. If the license or attribution requirement
   cannot be verified, do not use that image.
4. After selection, download the image to the project's local asset folder and
   preserve the original file. Do not depend on a remote URL during rendering.
5. Record in `方案/视觉元素匹配与重复率.md`: the Pexels page URL, image ID,
   author or attribution as shown, download date, license check date and result,
   target scene or timecode, source sentence and visual purpose, crop or fit,
   subtitle and A-ROLL safe-area result, local asset path, and selected
   production medium.
6. Use the downloaded photo as content inside the production medium chosen for
   the picture. Whether the photo stays static, receives a camera move, or is
   combined with other graphics still follows the HTML, SVG, Canvas, Three.js,
   Blender, WebGL, vertex-shader, or fragment-shader selection rules above.
7. Pexels photos remain subject to sentence timing, content fidelity, subtitle
   readability, A-ROLL visibility, repetition, and the user's explicit visual
   direction. A user-specified photo or A-ROLL trajectory, a supplied
   storyboard, and a template's protected graphics take precedence over an
   automatic Pexels choice.
8. If no suitable image exists, the page is inaccessible, or the license cannot
   be confirmed, search only another material source that the current scene
   actually needs. If none has a usable entry, request a user-supplied library
   or source asset under `Visual-content source resolution`. Do not substitute a
   placeholder, verbal description, or self-generated image without explicit
   user authorization. Never guess an image ID, author, license, or visual
   content.

## Visual asset matching and repetition

When an approved scene calls for library material, search the relevant
available material libraries by the approved source meaning. CARD covers
motion, transitions, UI, data, camera, typography, and effect ideas. Kitbitz
covers object and scene illustrations. Meta Open Sound and UI SFX cover
recorded and designed audio events. motion-prompt covers its 192 numbered
motion, animation, entrance, exit, transition, camera, UI, web, and photo-look
references. React Video Editor covers editor UI and timeline metaphors;
Remotion Scenes covers Remotion scene, layout, camera, and transition examples;
Curvable Motion covers its 14 Remotion components; Remotion Playground covers
the Composition IDs in its current `src/Root.jsx`; Tabler Icons covers clear
objects, actions, and concepts in editable B-ROLL when a matching SVG icon can
be verified. Preserve the template's fixed format, graphics, and branding.
Every scene must resolve its picture through `Visual-content source resolution`:
an explicit user-selected asset, a verified entry from a relevant material
library, a user-supplied source asset, or an AI-generated picture with recorded
user authorization. A plain-language description, placeholder, or
template-bundled example cannot bypass a missing-source request.

Record every proposal and calculation in
`方案/视觉元素匹配与重复率.md` using
[references/visual-asset-selection.md](references/visual-asset-selection.md).

The three limits are separate:

- Template fixed visual content may repeat up to 50%. When editable content
  causes the excess, replace the excess occurrences with suitable treatments
  from verified material libraries. Protected fixed structure must be reported
  rather than falsely marked as compliant.
- Added, replaced, or otherwise editable visual slots must have an overall
  repetition rate no greater than 30% across the complete video. This is not a
  per-combination allowance.
- Picture transitions use a separate aggregate repetition rate no greater than
  20%. Count transitions between clips, scenes, or visual groups; do not count
  subtitle changes or element entrance and exit inside one visual group.
  Hard cuts count as transitions but do not require entrance or exit animation.

For `T` editable slots and `D` distinct visual combinations, calculate
`(T - D) / T`. A result above 30% fails. Change the editable visual selection or
motion treatment until it passes; do not hide repeated slots in the count.
Transition method is not part of this editable-visual key.

For `Q` picture-transition slots and `U` distinct transition keys, calculate
`(Q - U) / Q`. A result above 20% fails. A transition key includes source,
asset or Card ID when applicable, production medium, transition method, and
easing or fade treatment. Hard cuts use their own `hard cut` key. A fade or
crossfade passes only when both its fade-out and fade-in are present.

## First interaction

Apply this order:

1. If the user has already supplied copy, SRT, speech audio, a talking-head
   video, or a script and storyboard pair, run the runtime preflight and input
   consistency checks before asking another production question. Do not make
   template-selection mode the first response when source content is already
   available.
2. After those checks pass, offer the standalone opening route unless the user
   or a resumed project already decided, or the storyboard already defines the
   opening.
3. If no primary input has been supplied, ask for the template-selection mode
   and request one source input:

> 你想自己选择模板，还是由我根据内容推荐模板？

请回复“自主选择模板”或“AI 匹配模板”。

If self-selection is chosen, state that the user may select one template or
combine multiple templates from any of the four libraries. Recommend using no
more than three templates.

请对方同时发送文案、SRT、语音音频或口播视频中的任意一种。

4. If the user already named a MOTION template ID or name, a Lemo-Opuscar style
   name or slug, a VIDEO-SHOTCRAFT template, card name, or style key, or a
   SHOWREEL-43 slug or Chinese style name, infer self-selection.
5. If the user already asked Codex to choose or recommend, infer AI matching.
6. Ask only for the missing choice or production information. Do not repeat a
   choice the user already made.

For a script-and-storyboard pair, skip template selection and all template
matching. Proceed from the direct-production rules to the production plan.

## Template selection modes

These modes apply only to ordinary inputs that are not a script-and-storyboard
pair. Never enter them for script-and-storyboard direct production.

### Self-selection

1. Provide all four template-library entrances in the same response:
   - The MOTION template appendix or the library's `模板清单.md`.
   - The Lemo-Opuscar official online gallery:
     https://lemomo-ai.github.io/lemo-opuscar/
   - The complete VIDEO-SHOTCRAFT reference and gallery:
     `references/video-shotcraft.md`,
     https://vincentwei1021.github.io/video-shotcraft/
   - The complete SHOWREEL-43 list and local preview gallery:
     `references/showreel-43.md`
2. Ask for one or more template IDs, names, card names, or style keys when none
   were supplied. Tell the user that a cross-library combination is allowed and
   that no more than three templates is preferred.
3. Confirm every selected MOTION `.motion` file, Lemo-Opuscar style slug,
   VIDEO-SHOTCRAFT template, card, or style, or SHOWREEL-43 slug and rule file
   exists. Record each item's source library, title, version when available,
   ratio, preview, and card/style identifiers when used.
4. When the user selects more than three templates, explain the added review,
   rendering, and continuity risk and ask for explicit confirmation before
   continuing. Do not reject the request solely because it exceeds three.
5. Inspect whether every selected template can render all visible text in the
   canonical output language through its declared parameters or workflow.
6. Use only the template set confirmed by the user. Do not add, remove, replace,
   or reorder templates silently.
7. For a multi-template set, require a role and scene boundary for every
   template before the production plan.
8. If any selected template's ratio conflicts with the requested final canvas,
   stop and list the exact conflicts. Offer only:
   - Replace or remove the conflicting template and keep the approved canvas.
   - Change the final canvas only when every remaining selected template can
     render at that new ratio.
9. If non-editable English blocks Chinese output, report the exact template,
   text, and scene. Do not switch templates silently.
10. Do not crop, stretch, redesign, or replace any template without explicit
    approval.

### Codex matching

1. Ask for any one input:
   - Copy.
   - SRT file.
   - Speech audio.
   - Talking-head video.
2. If the runtime preflight has not passed for this input, run it now.
3. If the ratio is unknown, ask:

> 你要 16:9 还是 9:16？请回复“16:9”或“9:16”。

4. Match in the required tier order:
   1. Compare the current Lemo-Opuscar 66-style catalog and the
      VIDEO-SHOTCRAFT template, card, and style reference as equal-priority
      first-tier sources.
   2. Only when neither first-tier source has a genuinely suitable executable
      item, compare the SHOWREEL-43 style catalog.
   3. Only when all three higher-priority sources fail, compare the complete
      MOTION template reference.
   Filter each source on content type, structure, emotion, material form,
   rhythm, duration, ratio, and execution compatibility.
5. Recommend 3-5 suitable templates or styles from the first successful tier.
   If that tier contains fewer than three suitable matches, recommend only those
   matches. Never use a lower-priority library to fill the count. A direct user
   selection overrides this matching priority.
6. For each recommendation, include:
   - Source library.
   - Template ID, Lemo-Opuscar style slug, VIDEO-SHOTCRAFT card name and style
     key, or SHOWREEL-43 slug.
   - Template or style name, with the Chinese name for a Chinese user.
   - Ratio.
   - Why it fits this content.
   - Whether its declared workflow can author the internal scene motion the
     content needs, or which motion capability remains unavailable.
   - Preview: the MOTION local preview, the Lemo-Opuscar official gallery entry,
      the VIDEO-SHOTCRAFT local card entry and official gallery anchor, or the
      SHOWREEL-43 local 5-second preview.
   - Whether its visible text can be localized to the canonical output language.
7. State that this is a template-selection preview, not a preview of the user's new video.
   State that English or other demo text in the preview is template sample copy
   and will be localized in the timeline keyframes and final video.
8. Do not explain the difference between the four libraries' underlying
   production methods and do not append all complete catalogs during AI
   matching. Keep the response focused on the 3-5 candidates and their fit.
9. After presenting the recommendations, ask proactively:

> 如果你要使用以上建议模板，请回复“使用建议模板”；如果只选其中几项，请回复名称；如果要自己浏览四个模板库，请回复“自主选择模板”；如果要重新推荐，请回复“重新推荐模板”。

10. Wait for the template set to be confirmed.
11. If the user names different template IDs, Lemo-Opuscar style names,
    VIDEO-SHOTCRAFT card names or style keys, or SHOWREEL-43 slugs or names,
    switch to self-selection and use only the confirmed set.

After confirmation, use only the confirmed template set. For multiple
templates, define each template's role, scene ownership, order, and transition
before planning. Do not silently add, remove, or split work across templates
that the user did not approve.

A failed gate blocks matching and template recommendations.

## Ratio rules

- The normal workflow supports `16:9` and `9:16`.
- For MOTION, `MT-034` is the only native `1:1` template. Allow it only when
  the user explicitly selects it and confirms `1:1`.
- Never recommend `MT-034` for a `16:9` or `9:16` request.
- For Lemo-Opuscar, verify the requested output ratio against the selected
  style's declared production instructions before the production plan. Do not
  guess an unsupported ratio.
- For SHOWREEL-43, verify the ratio and production route in the selected style
  document before the production plan. The 5-second previews are 16:9; they do
  not prove that every style's full production workflow is 16:9 only.
- `INK-PRESS` is native `16:9` only. Do not silently crop, stretch, letterbox,
  or convert it to `9:16`. If the user requests another ratio, stop and ask
  whether to choose a compatible template instead.
- Never replace a requested ratio with a simple crop.
- Every template in a combination must render to the same approved final
  canvas. Do not combine conflicting native ratios by cropping or stretching.

## Source-content rules

### SRT

- For SRT-only input, preserve the supplied words, punctuation, and order.
  Timing may be regenerated only when an approved scene structure requires it.
- For SRT plus audio or talking-head input, compare the texts first. When they
  agree, keep the approved SRT wording and use the real speech timing for
  burned and delivered subtitles.
- Document timing differences between the supplied SRT and the real speech in
  the production plan. Do not silently discard the supplied timing.
- If the SRT text and spoken meaning differ materially, follow the
  input-consistency conflict rules and stop for a canonical source.
- Do not drop, shorten, merge two sentences, rewrite, or reorder subtitle text
  without explicit user approval. After approval, treat the revised text as the
  canonical subtitle source and rebuild one complete reading clause per
  single-line cue and its timing.
- Use the actual audio duration and speech timing when audio is provided.
- When a standalone opening consumes opening cues, exclude those cues from the
  body and rebuild the combined SRT timing. Do not duplicate an opening cue in
  both parts.
- If narration is required but no audio exists, ask once whether to generate AI narration.
- Burn the SRT text into the final video and deliver matching SRT and ASS files.
  Rebuild cues so each burned subtitle is one complete reading clause on one
  line. A long sentence may be split into sequential cues at comma or other
  natural clause boundaries, but a cue must not end inside a word or
  inseparable semantic unit.
- State the subtitle style, single-line fit treatment, position, and safe area
  in the production plan.

### Speech audio

- Treat audio with narration or speech as a complete starting input.
- Preserve the supplied voice and every spoken word when the audio is used as
  final narration unless the user explicitly requests a different narration or
  voice treatment. Otherwise, use only the minor speed, breath, and silent-gap
  adjustments allowed by `Content fidelity`.
- Transcribe the speech through the approved local ASR path.
- Use the transcript as the subtitle source after confidence checks.
- Do not add narration, explanations, or claims that were not spoken unless the
  user explicitly approves the exact revised narration or copy.
- If the audio contains no intelligible speech, ask for matching copy or SRT
  because mandatory subtitles cannot be derived reliably.
- If copy or SRT is also supplied, follow the input-consistency rules before
  using either text source.

### Talking-head video

- Preserve the original voice and every spoken word unless the user explicitly
  requests a different narration, voice, or edit treatment. Otherwise, use only
  the minor speed, breath, and silent-gap adjustments allowed by
  `Content fidelity`.
- Do not add, remove, shorten, expand, reorder, or reword spoken content without
  explicit user approval.
- Arrange scenes around the real speaking duration.
- If no SRT is provided, transcribe the speech automatically with the approved
  local ASR path. Do not ask whether subtitles are needed.
- If transcription fails or confidence is too low, repair the dependency or ask
  for a corrected SRT. Do not deliver without subtitles.
- Keep person, recording, original audio, and captions synchronized.
- When the recording contains failed retakes separated by a long pause, offer
  and run the retake-cleanup workflow from
  [references/talking-head-retake-cleanup.md](references/talking-head-retake-cleanup.md).
- Do not cut repeated speech unless the pause, repeated-opening, text-similarity,
  and later-take completeness checks all pass. Flag ambiguous pairs and keep
  them unchanged.
- Keep the original recording untouched. Generate the cleaned media under the
  project asset folder and regenerate SRT timing for the cleaned timeline.
- If a standalone opening uses the first source passage, the body starts at the
  first unconsumed passage. Do not repeat the opening speech or captions.

### A-ROLL visible layout after a standalone opening

Treat a talking-head video as the A-ROLL. Apply these rules after a standalone
opening and throughout the body unless the user specifies an A-ROLL trajectory.

- Implement A-ROLL entrances, exits, position changes, resizing, shape changes,
  full-screen returns, split-screen changes, and other visible motion in HTML
  through the supported HTML rendering workflow. Do not treat them as manual
  crop-and-keyframe edits in an external video editor.
- Keep the original A-ROLL source, voice, spoken words, and caption timing
  authoritative. HTML controls presentation only.
- Use exactly one of the three modes below for the complete video. Do not mix
  modes in one project unless the user explicitly supplies the required
  A-ROLL trajectory for the mixed treatment.
- When the user specifies an A-ROLL trajectory, follow that trajectory exactly
  for entry, exit, position, scale, shape, movement, timing, and the final
  frame. The user's trajectory overrides the three default modes.
- Record the selected mode or the user-specified trajectory, its scene and
  sentence boundaries, and the final A-ROLL state in the production plan.

#### Mode 1: full-screen A-ROLL to lower-left circle

- Begin with A-ROLL filling the main picture while B-ROLL appears in the same
  frame. B-ROLL must not cover the person.
- Keep this initial full-screen state for at least two spoken sentences.
- Then move A-ROLL continuously into a suitable-sized circular window in the
  lower-left corner and let B-ROLL become the main visual.
- At a key point, enlarge A-ROLL continuously back to a full-screen main
  picture.
- Keep the enlarged full-screen A-ROLL for at least two spoken sentences before
  it may leave again.
- End the video with A-ROLL filling the main picture.

#### Mode 2: split-screen with movable A-ROLL

- Place A-ROLL on the left with B-ROLL on the right, or place B-ROLL on the left
  with A-ROLL on the right.
- Move A-ROLL between sides as the content requires, and enlarge or reduce it
  without losing visibility of the speaker or harming caption readability.
- End the video with A-ROLL filling the main picture.

#### Mode 3: repeated full-screen A-ROLL inserts

- Show A-ROLL full-screen at least three times in the body, prioritising key
  points.
- Each full-screen appearance must cover one complete spoken sentence, or two
  short sentences or short clauses.
- Do not require A-ROLL to fill the main picture at the end of the video.

### Copy

- Treat the supplied copy as a complete starting input. Do not require an
  SRT, audio file, or talking-head video merely because the input is copy.
- Split the copy into scenes by sentence or coherent semantic unit.
- Keep every supplied word intact and in source order. Do not insert, delete,
  summarize, polish, expand, condense, or rewrite the copy.
- If duration is not supplied, estimate it from readable text length and state
  the estimate in the production plan.
- Default to a text-motion video.
- Generate a timed subtitle sequence from the approved copy and burn it into
  the final video. Do not rely on unrelated template text.
- Add narration only when requested. Subtitles remain mandatory either way.
- If the copy is also used as kinetic on-screen text, avoid duplicate overlays
  only when that text already satisfies the complete, readable, timed caption
  requirement.

### Assets

- Use only supplied people, products, screenshots, logos, data, and media.
- Never invent evidence, customers, testimonials, or product claims.
- Ask only for missing assets that materially block the approved direction.
- Preserve all original user files.

## Talking-head retake cleanup

Use the bundled helper when the user wants stutters and failed repeated takes
removed automatically:

```powershell
node "<skill-dir>/scripts/retake-cleanup.mjs" --transcript "<word-transcript.json>" --media "<talking-head-file>" --output-dir "<project>/素材/处理/口播去卡顿_v1" --pause-seconds 2 --render
```

The helper creates `retake-plan.json`, `retake-plan.md`, `clean.srt`, and
`clean.mp4`. It never overwrites the source.

Before using the rough cut:

- Verify each automatic removal has a pause of at least two seconds, a repeated
  opening, high transcript similarity, and a later take that is at least as
  complete.
- Keep intentional repetition, semantic differences, and ambiguous pairs.
- Re-transcribe `clean.mp4` and verify the cleaned SRT against the new speech
  timing before captioning the finished timeline.
- Inspect lip sync and cut continuity. Report and repair drift rather than
  hiding it with cropping or speed changes.

The automatic plan is not approval to deliver. The cleaned result must still
pass any applicable keyframe review and the final validation.

## Production plan and storyboard gate

After resolving the usable template set for ordinary template-based work, or
the supplied storyboard for direct production, present a plan containing:

- For ordinary template-based work, every selected item's source library,
  template ID or style slug, title, version when available, and ratio.
- For every ordinary template-based scene, a template motion map that records
  the capability level of each animated slot or scene; the narrative action;
  primary and supporting movers; static anchors; camera motion versus internal
  object motion; start and end states; action order; timing and easing; layer
  order; transition; and the declared template feature or production medium
  used to implement it.
- For any template scene whose required internal action cannot be controlled,
  the exact blocked layer or capability and the compatible template, supplied
  layer or asset, or explicitly approved production change needed to resolve it.
- For script-and-storyboard direct production, every supplied storyboard scene,
  its order, framing, composition, camera intent, and the verified material
  libraries and IDs used to complete it. State explicitly that no template was
  selected or applied.
- For every script-and-storyboard scene, include the authored motion treatment:
  primary and supporting movers, static anchors, camera motion versus object
  motion, start and end states, action order, timing and easing, layer order,
  scene transition, selected production medium, and how any flat source will be
  layered. These details may be summarized in plain language, but must be
  concrete enough to reveal whether an internal action is actually being built.
- For multi-template ordinary work, a role and scene map showing which template
  owns each scene, the order, and the planned transitions.
- Scene structure or storyboard.
- Standalone-opening decision and, when used, every source type for its picture,
  motion, transitions, and sound, exact opening source text, source-segment IDs,
  consumed SRT range, planned 5-10 second duration, and the first source segment
  reserved for the body.
- Representative storyboard images when the selected template workflows support
  them, or directly from the supplied storyboard in direct production.
- For projects with a standalone opening, the timeline-keyframe plan: capture
  times, scene and visual-group coverage, transition moments, output ratio, and
  the intended review location. Storyboard images and example frames are not
  timeline keyframes.
- Estimated duration.
- Talking-head retake-cleanup summary when applicable, including automatic cut
  ranges, kept later takes, and any ambiguous pairs left unchanged.
- For talking-head A-ROLL after a standalone opening, the selected single
  layout mode, or the user-specified trajectory that overrides the default
  modes. Include every entry, exit, position change, scale or shape change,
  full-screen return, sentence boundary, B-ROLL occlusion check, and final
  A-ROLL state; state that the visible movement will be authored in HTML.
- Input-consistency result when more than one primary input was supplied.
- Source coverage map showing where every canonical segment appears.
- A statement of the current canonical text and any user-approved additions,
  omissions, rewrites, or reordering.
- Canonical output language and visible-text localization plan, including any
  preserved proper nouns or acronyms and any template localization when a
  template is used.
- Narration, mandatory subtitle, and sentence/visual-group timing plan,
  including source language, style, position, safe area, the serial visual-group
  map, the sentence count assigned to every visual group with no group exceeding
  three consecutive sentences, the one-to-three-cue split for every source
  sentence, and every sub-five-character fragment merged into adjacent content.
- BGM decision state for the final video. If the user already made an explicit
  choice, record `需要 BGM` or `不需要 BGM`. Otherwise mark the choice pending
  and state that it will be asked after keyframe confirmation and before final
  rendering. No answer will default to no BGM. If BGM is selected, include one
  exact track source and ID or URL, instrumental/no-vocal verification, fit to
  the canonical script, fixed gain, planned loudness measurement, and the
  `方案/BGM记录.json` path.
- Sound-effect cue plan with the selected source, actual asset IDs when a
  sound library is used, or a concrete sound treatment when the sound library
  is unavailable.
- Picture-transition plan for every boundary, including the selected HTML, SVG,
  Canvas, Three.js, Blender, WebGL, vertex-shader, or fragment-shader production
  medium, the Blender role when used, transition method, duration in seconds,
  standard or complex classification, matching SFX cue, coordinated easing
  treatment, fade pairing when a fade or crossfade is used, source ID or
  visual-reference adaptation status, and the complete-video `Q`, `C`, and
  `floor(Q × 10%)` result. Any missing picture source must show the
  user-material request and approval state.
- Visual asset matching and repetition audit for the sources actually used,
  including any material-library choice, compatibility result, template-fixed
  50% result when a template is used, editable `(T - D) / T` result, and
  picture-transition `(Q - U) / Q` result with each transition's easing
  treatment and fade-pair result.
- Photographic B-ROLL plan when Pexels is used: the source sentence and visual
  purpose, Pexels page URL and image ID, author or attribution as shown,
  download date, license check date and result, target scene or timecode,
  local asset path, crop or fit, subtitle and A-ROLL safe-area result, and
  selected production medium. If no suitable image is found, request user
  material under `Visual-content source resolution`; do not record a
  placeholder or self-generated image as the fallback.
- For each picture, record its source: an explicit user-selected asset, a
  verified template or material-library entry, a user-supplied source asset or
  supplied storyboard, or an AI-generated picture with its recorded user
  authorization. A scene pending user material may be listed as blocked in the
  plan but cannot move into keyframes or the final video. Never invent an ID.
- For each sound cue, record the verified sound-library source and ID, or the
  explicit sound treatment approved for an unavailable sound library.
- Do not pre-check unused libraries. When a step actually needs a template or
  material library, check only that library. If it is unavailable, ask the user
  to provide its local folder, package, accessible inventory, or source assets.
  For pictures, do not treat a description as a substitute for the requested
  user material. AI generation remains blocked until the user explicitly says
  no material will be provided or explicitly authorizes it.
- Assets still needed.
- Final output specification.

Wait for explicit approval before proceeding to the next required gate. Plan or
storyboard approval may authorize opening or timeline-keyframe work only; it
does not bypass a keyframe approval and never authorizes final MP4 rendering.

Before waiting, state:

> 确认方案请回复“确认方案”；需要修改请回复“需要修改方案”，并写明要修改的内容。

After presenting the plan and any storyboard images, proactively ask what needs
improvement. Tell the user they may provide a reference video or image plus a
simple description when text is not precise enough.

Revise and re-confirm after creative-direction changes.

## Standalone-opening gate

This gate applies whenever the user chooses `我来选开头` or `AI匹配开头`.
The required order is absolute:

1. Confirm the opening source passage, source-segment IDs, consumed SRT range,
   planned duration, and final-intent voice and caption treatment in the
   approved plan. Opening visual, motion, graphic, transition, and sound
   treatment may come from the selected template in ordinary template-based
   work, a verified material-library entry, or a user-supplied source asset.
   For script-and-storyboard direct production, use the supplied storyboard,
   user-supplied source assets, and the eleven material libraries. The
   canonical source supplies the words and speech. Resolve every opening
   picture through `Visual-content source resolution`; no placeholder or
   self-generated picture may pass this gate without recorded user
   authorization.
2. Build a real opening sample from the actual canonical content. It must show
   the actual motion, exact source words, subtitle treatment, and final output
   language. A still image, unrelated template demo, or invented title is not
   an opening sample.
3. Keep the opening sample free of background music. Do not present it as a
   preview or approval of the final BGM treatment.
4. Present the opening sample and wait for `确认开头`.
5. If the user replies `需要修改开头`, revise only the opening sample and wait
   again. Do not start or continue body production.
6. Only after `确认开头`, mark the opening source IDs and SRT cues as consumed
   and build the body from the first unconsumed source segment. Then generate
   timeline keyframes and stop at the timeline-keyframe gate.

Before waiting, state:

> 确认开头请回复“确认开头”；需要修改请回复“需要修改开头”，并写明要修改的内容。

The opening sample is normally 5-10 seconds. If the exact opening passage
cannot fit without changing its words, first use only the permitted minor
speed, breath, or silent-gap adjustments. If it still does not fit, propose
another continuous opening passage or ask for explicit approval of a different
duration. Never truncate, add, or rewrite the words.

Record the opening sample path and the user's `确认开头` response in the project
records. A material change to the approved opening after confirmation
invalidates the opening approval: revise the opening sample, obtain
`确认开头` again, and rebuild affected body content. Regenerate affected
timeline keyframes and obtain `确认关键帧` again whenever the change also
affects the body timeline or its visual treatment.

## Timeline-keyframe gate

This gate is mandatory for every project with a standalone opening. It follows
`确认开头` and authorizes the final-render phase after the BGM decision.

1. Build the body timeline from the first unconsumed source segment and update
   the combined opening-plus-body timing before creating keyframes.
2. Generate timeline keyframes from the actual approved timeline and source
   timing. Cover every scene or visual-group entrance, camera intent, visible
   text and subtitle placement, multi-stage B-ROLL reveal, material asset,
   transition start or peak, and other final treatment needed to judge the
   complete motion plan.
3. Use final-intent frames at the approved ratio and safe area, with the final
   language, layout, visual sources, camera framing, and transition behavior.
   A generic storyboard image, unrelated template demo, or still that reveals
   later sentence content early is not an acceptable timeline keyframe.
4. Present the keyframes in timeline order with their timecodes, scene or
   visual-group IDs, purpose, verified source IDs or user-supplied asset paths,
   and any recorded AI-generation authorization. A missing-source placeholder
   cannot appear in this review. Ask the user to approve the keyframes before
   final rendering.
5. Wait for `确认关键帧`. If the user replies `需要修改关键帧`, revise only the
   requested keyframes and timeline treatment, then present the revised
   keyframes and wait again. Do not render the final MP4 while the keyframe gate
   is open.
6. `确认关键帧` approves the keyframe set and authorizes the final-render phase
   after the BGM decision.
7. Any later material change to timing, scene structure, framing, camera,
   visible text, subtitle placement, visual assets, or transition treatment
   invalidates the affected keyframe approval. Regenerate and reconfirm the
   affected keyframes before rendering a revised final MP4.

Before waiting, state:

> 确认关键帧请回复“确认关键帧”；需要修改请回复“需要修改关键帧”，并写明时间码、场景或视觉组以及要修改的内容。

Record the keyframe files or contact sheet path, capture timecodes, covered
scenes and transitions, and the user's `确认关键帧` response in the project
records.

## Final-render authorization and optional BGM

The required order is absolute:

1. Approve the production plan.
2. Finish every requested storyboard or example-frame revision.
3. If a standalone opening is selected, build its real opening sample and wait
   for `确认开头`.
4. After `确认开头`, build the body from the first unconsumed source segment.
5. Generate timeline keyframes from the actual combined timeline and wait for
   `确认关键帧`.
6. After `确认关键帧`, read any existing BGM decision. If the user has not
   explicitly chosen, proactively ask whether the final video should include
   BGM. If no answer has been received when final rendering starts, use no BGM
   and record the unanswered default. Keep the standalone-opening sample free
   of BGM either way.
7. Render the complete final MP4 directly from the approved keyframe timeline
   and run final technical validation.

For a project without a standalone opening, ask the pending BGM decision after
the production plan and any storyboard review are approved, before final
rendering.

Use final-intent elements supported by the selected production workflow:

- Final voice.
- Final captions.
- Final background music only when selected by the user: one instrumental track
  at its single fixed gain.
- Transitions.
- Sound effects.
- Approved visual content.
- Recorded visual material matches from verified libraries that meet the
  selection and all repetition rules.
- Downloaded Pexels photos when used, with their final crop, motion treatment,
  subtitle safe area, A-ROLL visibility, and recorded source and license.

When the user selected BGM, the final video must contain exactly one
instrumental track at one fixed gain. Do not insert a second music layer, duck
the music under speech, add sidechain compression, use fades, or automate the
music level. After setting the one fixed level, keep integrated loudness near
`-14 LUFS` with true peak no higher than `-1 dBTP`. When the user chose no BGM
or did not answer, include no BGM in the final video.

Never render the final MP4 directly after plan, storyboard, opening, or
example-frame approval. `确认关键帧` is the required final-render authorization
for projects that use the timeline-keyframe gate.

## Production execution

Route execution by the confirmed input mode and, for ordinary template-based
work, the confirmed source library. Do not turn this routing into a new user
decision.

### Shared template motion completion

For every ordinary template-based project, before rendering:

1. Read [references/template-motion-direction.md](references/template-motion-direction.md).
2. Classify each scene and editable slot as native motion, editable slot,
   fixed overlay area, or sealed or unsupported capability.
3. Use a declared native motion first when it carries the required action.
4. When the native motion is insufficient and the slot is editable, author a
   complete element-level treatment inside the template. Animate the primary
   action, supporting reactions, static anchors, start and end states, action
   order, timing, easing, and layer order.
5. When only a permitted independent overlay can provide the action, preserve
   the template's fixed structure and add the smallest overlay that makes the
   action clear.
6. If the template is sealed or does not expose the required layer or action,
   report the exact scene, timecode, missing layer or capability, and a
   compatible alternative. Do not fake completion with whole-frame motion.
7. Select HTML, SVG, Canvas, Three.js, Blender, WebGL, a vertex shader, or a
   fragment shader only through the on-demand picture-capability gate and the
   rules in `template-motion-direction.md`.

This completion does not authorize changes to the template's protected
structure, branding, native ratio, fixed typography, approved scene ownership,
source order, or the confirmed template set.

### Script and storyboard direct execution

For a script-and-storyboard pair, build directly from the supplied storyboard:

1. Keep the supplied scene count, scene order, framing, composition, camera
   intent, and visual sequence.
2. Use the script unchanged for narration, spoken content, visible text, and
   subtitle timing.
3. Complete each scene with verified entries from the eleven material libraries
   in `Script and storyboard direct production`; fill animation, motion,
   picture elements, graphics, sound, transitions, and camera language without
   changing the storyboard's scene structure. For each missing or unsuitable
   picture source, follow `Visual-content source resolution` and request user
   material before generating a replacement.
4. Do not load, select, match, apply, or render a MOTION `.motion` template,
   Lemo-Opuscar style, or VIDEO-SHOTCRAFT template.
5. Record the actual library, ID, purpose, scene or timecode, compatibility,
   license status, user-supplied source paths, and any AI-generation request,
   user authorization, and generated-file paths.

The preflight, input-consistency, content-fidelity, subtitle, plan, opening,
keyframe, final-validation, and delivery gates still apply.

### MOTION execution

Before running a selected MOTION template or template combination:

1. Read `00-START-HERE.md` and `assistant/guide.json` from every selected
   `.motion` package when present.
2. Read the actual parameter and runtime instructions for every selected
   template.
3. Read only the scenes and text slots relevant to each template's approved
   role.
4. Verify each package's signature and hash through its declared entry.
5. Write generated parameters, previews, audio, and final artifacts outside
   every package.
6. Check template-specific optional dependencies at first use. Install them
   under the on-demand dependency rules when their reviewed project manifest
   declares them. Prefer:

   ```powershell
   node "<skill-dir>/scripts/cli.mjs" ensure-dependency template --project-root "<template-workspace>"
   ```
7. Build a localization map for every visible text slot in every selected
   template before rendering.
8. Disable or replace every selected template's default semantic text slot that
   is not in the canonical source. Do not add semantic text.
9. Before rendering the opening or final video, record
   the sentence, subtitle-clause, and visual-group map including the sentence
   count for every group and the three-sentence maximum, the one-to-three-cue
   subtitle split, and every sub-five-character fragment merged into adjacent
   content. A MOTION-controlled subtitle or text layer that cannot respect a
   required sentence or subtitle-cue boundary, the three-cue split limit, or the
   single-line subtitle rule is a blocker.
10. Classify every editable scene and slot with the shared template motion map.
    Use the package's declared native motion first. Author required internal
    motion through declared parameters, slots, or permitted overlays. Do not
    patch the sealed package or claim an inaccessible internal layer was
    animated.

### Lemo-Opuscar execution

When a confirmed template or style comes from Lemo-Opuscar:

1. Use the installed `lemo-opuscar` skill and its documented production
   workflow. Read the resolved library's `AGENTS.md`, the selected style's
   `STYLE.md`, and the director or technique guidance they require.
2. Use `styles/README.md` to resolve the selected display name to its exact
   slug. Do not guess or merge similarly named styles.
3. Build the user's film in an isolated project folder. Do not edit or build
   inside `styles/`.
4. Preserve the style's fixed visual grammar while directing all story, content,
   language, captions, and approved material from the canonical source.
5. This skill's input-consistency, content-fidelity, mandatory-subtitle,
   sentence/visual-group, plan, keyframe, final-validation, and delivery gates
   still apply. A lighter checkpoint in the native Lemo workflow does not
   replace them.
6. Use the selected style's native motion grammar first. Complete missing
   ordinary internal motion inside the style's declared editable project area;
   do not replace the style with a generic card deck or an unrelated
   whole-frame move.
7. If the style cannot expose a layer needed for a required action, report the
   exact limitation and follow the template motion blocker rule.
8. For a cross-library combination, use the confirmed role, scene ownership,
   order, and transitions. Do not silently rebuild one library's section with
   the other.

### VIDEO-SHOTCRAFT execution

1. Read [references/video-shotcraft.md](references/video-shotcraft.md) and the
   current `gallery/api/library.json` before selecting a card or style.
2. For `INK-PRESS`, read the complete
   `assets/vendor/video-shotcraft/template/TEMPLATE.md` before planning or
   execution. Preserve its paper-and-ink art direction, timing structure, and
   fixed production requirements.
3. For every shot card, read the exact card document named by the inventory and
   the demo source that document specifies. Never infer behavior from the card
   name alone.
4. Record the card name, style key, demo path, adaptation result, target scene,
   output ratio, and license for every selected VIDEO-SHOTCRAFT item.
5. Use reusable cards, components, textures, and audio only where the target
   template or production medium supports the adaptation. A preview is not
   proof that an asset can be inserted directly.
6. Keep the MOTION `CARD` namespace separate from VIDEO-SHOTCRAFT Cards. Never
   translate or reuse one system's ID as the other system's card name or style
   key.
7. For `INK-PRESS`, enforce native `16:9`. Do not crop, stretch, or convert it
   to another ratio.
8. Treat the internal research screenshots and demo copy as temporary examples.
   Replace them with screenshots, logos, and copy the user has permission to
   use before delivery.
9. Before commercial use, verify every selected audio file against the license
   boundary in [references/sfx-library.md](references/sfx-library.md). The six
   listed files with unverified commercial rights are prohibited until the
   rights are rechecked.
10. Use the selected card's declared motion and component capabilities first.
    When the card is an editable reference rather than a directly supported
    component, rebuild only the approved action in the supported template or
    production medium. Never treat a preview as proof that its internal layers
    can be inserted or animated.

### Execution prohibitions

Do not:

- Treat `.motion` as a playable video.
- Unpack the entire package without following its instructions.
- Scan every source file or text slot.
- Create a lookalike from screenshots.
- Expose, copy, or commit personal identifiers.
- Claim unverified package content is verified.
- Invoke undeclared production commands.

If dependencies, permissions, assets, or template capabilities are insufficient, report the exact blocked step. Do not fabricate success.

## MOTION CARD scene-reference workflow

Use the MOTION Card library only as visual reference for revising a scene.

The library contains 124 Cards and 150 variants across opening/branding,
text/title cards, transitions, UI showcases, camera/space, data/metrics,
interaction demos, pacing/montage, light/emphasis, and endings.

1. Tell the user to open `gallery/index.html` or the complete `CARD_LIST.md`.
2. Ask the user to send one or more mappings in this form:
   `target scene or timecode + usage part + Card ID`.
   Example usage parts are opening, title/text, transition, CTA, UI, data,
   camera movement, emphasis, or ending.
3. If only a Card ID is supplied and the target part is ambiguous, ask which
   scene or part it should modify.
4. Read `src/motion/motion-catalog.json` and check integration status and
   capability.
5. Actively adapt the Card's motion language to the requested scene where the
   selected template set supports the idea.
6. Do not claim a Card was inserted directly into the `.motion` package.
7. If the Card cannot be adapted, do not force it. Explain the exact blocker
   and recommend one or more alternative Cards that fit the same intended
   effect.
8. Regenerate the affected timeline keyframes using the changed visual
   treatment and wait for `确认关键帧`.
9. Re-render the final video only after the revised keyframes receive
   `确认关键帧`.

After the final MP4 finishes rendering, always run the post-render effects
review below before delivery.

The user does not need to install Remotion or edit code.

Developer-only checks:

```powershell
pnpm install
pnpm motion:verify
pnpm dev
```

Open `http://localhost:3000/MotionCardsShowcase`.

## VIDEO-SHOTCRAFT Cards workflow

Use VIDEO-SHOTCRAFT Cards only through the bundled third-library inventory.

1. Read [references/video-shotcraft.md](references/video-shotcraft.md), then
   verify the chosen card and style in `gallery/api/library.json`.
2. Let the user choose by exact card name or style key. Show the Chinese
   category, poster or official gallery entry, and a short effect summary.
3. Read the exact card document and every demo source it names before adapting
   the card. Do not infer the implementation from the card title.
4. Record `card name`, `style key`, `demo path`, target scene or timecode, ratio,
   compatibility result, and license.
5. Adapt the card only when the selected template or production medium supports
   the motion. Do not force it into another template.
6. Use `INK-PRESS` only as the complete template specified by its
   `template/TEMPLATE.md`; its cards do not turn it into an arbitrary-ratio
   template.
7. When the card is used inside another template, label it as a material
   capability, not as a replacement template.
8. Regenerate the affected timeline keyframes and wait for `确认关键帧` before
   rendering the final video.

## Output

Create this project workspace before the final validation:

```text
输出/项目名称_日期/
├── 素材/
│   ├── BGM/
│   └── 处理/
│       └── 口播去卡顿_v1/
├── 方案/
├── 预览/
│   └── 关键帧/
└── 成片/
```

Create `复盘.md` only after delivery, as required by the learning loop.

Suggested names:

```text
项目名称_日期_16x9_v1-with-audio.mp4
项目名称_日期_9x16_v1-with-audio.mp4
```

Keep generated assets and approved review artifacts in the isolated job folder. Never overwrite the original template or source media.

When a material-library-driven revision is used, keep the revised keyframes
under `预览/关键帧/` and the record under `方案/Card修改记录.md`.

Keep the visual asset mapping and repetition audit under
`方案/视觉元素匹配与重复率.md`.

Record the BGM decision in `方案/BGM记录.json`. When BGM is selected, also keep
the file under `素材/BGM/` and record its source, licence, fixed gain, loudness,
paths, and approval state.

When the selected production workflow supports it, output:

- MP4 H.264, `yuv420p`, SDR/BT.709.
- AAC audio, 48 kHz, stereo.
- A constant-level instrumental BGM in the final video when the user selected
  BGM. The final video contains no BGM when the user selected no BGM or did not
  answer. The standalone-opening review sample always contains no BGM.
- Approximately -14 LUFS integrated.
- True peak no higher than -1 dBTP.
- Burned-in subtitles in every final video.
- Matching SRT and ASS files delivered with every final video.

## Post-render effects review

After every complete final MP4 render and before delivery, proactively ask:

> 成片已经渲染完成。我可以按本次实际使用的模板和素材来源检查画面和声音。需要新增或替换画面时，我只检查当前场景对应的素材库；没有合适素材时，我会请你提供素材库或素材。只有你明确表示无法提供或明确同意我生成画面后，我才会自己生成。需要替换请回复“需要替换”，并按“目标场景或时间码 + 使用部位 + 素材库 + ID”或“目标场景 + 你提供的素材”写明，例如：`需要替换，00:08 + 转场 + motion-prompt #046`；不需要替换请回复“不需要替换”。

Do not mark the video as delivered until the user answers this question.

Along with the question, provide:

- Relevant visual references only from libraries already used or already
  resolved for this video. If none were used and the user asks for library
  options, resolve only the relevant source at that point.
- The source link for each material library that is actually used or offered.
- For every scene whose source is not a template or material library, identify
  the user-supplied asset. When a picture was AI-generated, record the request,
  explicit user authorization, target scene or timecode, and generated-file
  path. A placeholder cannot stand in for this source record.
- A reminder that a CARD preview, Kitbitz SVG, Tabler online icon, or
  motion-prompt demo is a visual reference or source asset, not automatically a
  directly insertable component.
- Instructions to reply `需要替换` with one or more mappings using
  `target scene or timecode + usage part + library + ID`, or to reply
  `不需要替换`.
- When the user cannot follow the format, accept a plain-language description
  of what looks wrong and what they want, infer the likely scene and usage
  part, and ask only if the target remains ambiguous.

Only `implemented` Cards may be described as directly supported by the Card
integration. `available` or pending Cards may be rebuilt as visual references
only when the selected template set's declared workflows support that change.

If the user replies `不需要替换`, continue final validation and delivery.

If the user selects a Card:

1. Confirm the target scene or timecode, usage part, and Card ID.
   If the user used plain language, restate the inferred mapping before editing.
2. Check the Card and selected-template-set capability.
3. Rebuild only the requested visual part where supported.
4. Preserve the approved audio, subtitles, language localization, and unaffected
   scenes.
5. Regenerate the affected timeline keyframes using the real content and show
   them to the user.
6. After the revised keyframes, proactively ask what needs improvement and
   offer the reference-video/image feedback path.
7. Wait for explicit `确认关键帧` before re-rendering the full final video.
8. Re-render a new complete final version after `确认关键帧` and preserve the
   previous version.
9. Revalidate the new final, then return to this review gate.

If any requested Card cannot be adapted, do not force it. Report the exact
capability or template limitation and propose one or more alternative Cards
that can achieve the same intent.

After five Card-revision rounds, ask whether to continue rather than starting
another round silently.

## Learning and preference updates

After the final MP4 passes validation and is delivered:

1. Create or update `复盘.md` in the project output folder using [references/learning-loop.md](references/learning-loop.md).
2. Record facts about every selected template or Lemo-Opuscar style, its source
   library, the combination structure when applicable, user revisions,
   reference media, visual effects changes, voice, captions, per-scene source
   types and per-step library checks, keyframe details, rhythm, visuals,
   source-text coverage, issues, and final result.
3. Update `创作偏好.md` only when:
   - The same preference appeared in at least two independently approved projects.
   - The user explicitly asks to remember it.
   - Newer evidence replaces an outdated preference.
4. Do not record one-off instructions as permanent preferences.
5. Run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/update-learning-state.ps1" -LibraryRoot "<library-root>"
```

When five new reviews have accumulated, create an upgrade proposal only after the user requests it:

```text
输出/_学习/Skill升级提案_YYYYMMDD.md
```

The proposal must cite review evidence and list rules to add, change, or remove. Do not modify `SKILL.md` without explicit approval.

After generating the proposal, reset the reminder threshold:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/update-learning-state.ps1" -LibraryRoot "<library-root>" -MarkProposalGenerated
```

An approved proposal becomes a new skill version. Preserve the old skill and distribution ZIP.

## Final validation

Before delivery, verify:

- The MP4 plays from beginning to end.
- Ratio and resolution match the approved specification.
- Text has no typos, clipping, overflow, or overlap.
- Burned-in subtitles are present for the complete video and are readable,
  correctly timed, and free from clipping, overflow, or overlap.
- Burned subtitles show one complete reading clause per cue, use one line per
  cue, and never show two source sentences at the same time. A long source
  sentence may use at most three sequential cues at semantic boundaries, either
  within one scene or across scenes.
- A segment below five visible characters, letters, or digits is not the only
  script-driven text in any scene or visual group.
- Burned subtitles and their SRT/ASS text contain no character-by-character
  reveal, typewriter, progressive masking, karaoke, or word-by-word highlight.
- No text, B-ROLL, title, subtitle, or emphasis word from a later sentence
  appears early.
- No visual group carries more than three consecutive canonical sentences. Each
  sentence's dedicated text and B-ROLL appear only when that sentence begins.
- A long sentence's visual groups remain strictly serial: the previous
  dedicated group must finish before the next group enters; a shared background
  may remain.
- The SRT and ASS files match the burned-in subtitle text and timing, with one
  complete reading clause and one line per subtitle cue.
- Subtitle text matches the canonical copy, SRT, or verified transcript selected
  during input-consistency review exactly; only cue segmentation and timing may
  differ.
- Every canonical source word occurrence is present exactly once in the final
  timeline, in source order, with no additions, deletions, rewrites, or
  reordering.
- No unapproved title, explanation, example, claim, CTA, conclusion, data, or
  outro copy was added.
- No added or removed semantic segment appears in the final timeline.
- For Chinese canonical input, all visible final-video text is Chinese except
  approved brand names, proper nouns, acronyms, units, URLs, and code.
- No default English template titles, labels, CTAs, badges, or outro copy remain
  in the final video.
- Narration and all picture-transition and other sound effects match the plan.
- The standalone-opening review sample contains no BGM.
- The BGM decision made before final rendering is recorded. If the user
  selected BGM, the final video contains exactly one instrumental track with no
  lyrics or vocals, fits the canonical copy, and uses one fixed gain with no
  track switch, second music layer, ducking, sidechain lowering, fades, rises,
  drops, or volume automation. The fixed gain keeps narration clearly dominant
  and intelligible without automatic ducking. The final master measures near
  `-14 LUFS` integrated with true peak no higher than `-1 dBTP`.
- If the user selected no BGM or did not answer, the final video contains no
  BGM.
- `方案/BGM记录.json` records the BGM decision and, when BGM is included, the
  track source, licence, constant gain, loudness measurements, and final path
  without invented metadata.
- Every picture transition has a recorded, verified SFX cue synchronized to its
  visible action or transition peak.
- Every storyboard-to-storyboard animation uses the approved HTML, SVG, Canvas,
  Three.js, Blender, WebGL, vertex-shader, or fragment-shader production medium
  selected for its picture. Three.js is used for the scenes that specifically
  require 3D or 2.5D treatment, and any Blender use records whether it rendered
  the complete transition or supplied materials, textures, stills, or assets to
  a downstream composition.
- Every action required by the script or storyboard is visibly authored in the
  DEMO and final video. Whole-frame zoom, pan, slide, fade, blur, or camera
  travel is not accepted as a substitute for an internal element action.
- Each script-and-storyboard scene has the approved primary and supporting
  movers, static anchors, start and end states, action order, timing, easing,
  layer order, transition, and production medium accounted for in the executed
  result.
- Missing internal motion was authored during production; the user was not
  required to write keyframes, code, or frame-by-frame element instructions. If
  the scene could not be faithfully layered or animated, the exact missing
  source, layer, asset, or capability is reported and the scene is not claimed
  as complete.
- Every template-based scene has a recorded motion capability level: native
  motion, editable slot, fixed overlay area, or sealed or unsupported.
- Every template-native action used by the plan is visibly present in the DEMO
  and final video, and every editable slot needed by the content has been
  authored with the required internal action.
- Any independent overlay stayed inside an area and role that the selected
  template permits, without changing its protected layout, branding, ratio, or
  scene ownership.
- Whole-frame zoom, pan, slide, fade, blur, or camera travel did not replace a
  required title, card, icon, path, chart, data, product-detail, person-, or
  object-level action.
- Every sealed or unsupported internal action is reported at its exact scene or
  timecode and remains blocked; it is not described as delivered.
- `.motion` packages remain unchanged: no internal file was unpacked, rewritten,
  patched, or bypassed to create motion that the package did not expose.
- A material-library item is described as direct use only when it is a
  compatible editable or importable component in the selected medium, or a
  declared directly executable template-native transition. A preview, GIF, MP4,
  or demo remains a reference, source texture, or asset unless the user
  explicitly authorises direct use or it is an approved direct Blender render.
- Every Pexels photo used in the final video matches the current sentence or
  visual group, remains complete and legible after cropping, does not cover the
  A-ROLL person, and does not reduce subtitle readability or safe-area
  compliance.
- Every Pexels photo is stored as a local project asset with its original file
  preserved. Its page URL, image ID, author or attribution as shown, download
  date, license check date and result, target scene or timecode, crop, local
  path, and selected production medium are recorded.
- Pexels is recorded as the source of photographic content, not as the
  production medium or a replacement for the approved HTML, SVG, Canvas,
  Three.js, Blender, WebGL, vertex-shader, or fragment-shader treatment.
- Every standard non-hard-cut transition is no longer than 0.5 seconds. Every
  complex transition is longer than 0.5 seconds, no longer than 0.8 seconds,
  and `C <= floor(Q × 10%)`.
- Every non-hard-cut transition is smooth and continuous with coordinated
  easing. Every fade or crossfade contains both its fade-out and fade-in; no
  fade is allowed to use only one half. Hard cuts are instantaneous and do not
  require transition easing or paired fades.
- When a standalone opening is used, the timeline-keyframe path, capture
  timecodes, covered scenes and transitions, and `确认关键帧` response are
  recorded before the final render.
- The final MP4 was rendered only after `确认关键帧`; later material visual
  changes invalidated and regenerated affected keyframes before rendering a
  revised final.
- For talking-head A-ROLL after a standalone opening, the final video uses
  exactly one approved default mode, or the approved user-specified trajectory,
  with no unapproved mode mixing.
- A-ROLL entry, exit, position, size, shape, full-screen return, and
  split-screen movement are visibly authored in HTML and remain synchronized
  with the speaker and captions.
- Mode 1 keeps the initial full-screen A-ROLL and each enlarged full-screen
  return for at least two spoken sentences, keeps B-ROLL from covering the
  person, and ends with A-ROLL filling the main picture.
- Mode 2 permits left-right side changes and resizing, and ends with A-ROLL
  filling the main picture.
- Mode 3 shows A-ROLL full-screen at least three times, assigns each appearance
  one complete spoken sentence or two short sentences or clauses, and does not
  require A-ROLL to fill the main picture at the end.
- Original speech contains every spoken word except filler words that the user
  separately approved deleting. Any speed change is minor and does not impair
  meaning or intelligibility. Removed audio is limited to breaths and silent
  gaps.
- When retake cleanup was used, every removed segment is a failed repeated take
  backed by the pause, repeated-opening, similarity, and completeness checks,
  with no unique semantic content removed.
- The original talking-head file is intact, and the cleaned media, plan, and
  regenerated SRT are stored as new derivative files.
- Cleaned speech and captions are synchronized, and lip sync has no unexplained
  drift.
- No black frames, corruption, missing media, or obvious frame jumps.
- The file is not a still image, preview image, or silent test render.
- When a template is used, every original selected template and all user assets
  are intact.
- When a template is used, every selected MOTION ID, Lemo-Opuscar style slug,
  or VIDEO-SHOTCRAFT template, card name, and style key resolved to an existing
  source item, and the executed source matches the approved selection.
- Every VIDEO-SHOTCRAFT item records its card name, style key, demo path,
  adaptation result, output ratio, and license.
- `INK-PRESS` uses native `16:9`; no silent crop, stretch, letterbox conversion,
  or `9:16` adaptation is present.
- When multiple templates were approved, every template role, scene boundary,
  and transition matches the approved plan, with no unapproved template swap,
  insertion, or removal.
- For script-and-storyboard direct production, every supplied scene is present
  in the supplied order with its approved framing, composition, and camera
  intent, with no template layout applied.
- Every opening, keyframe, final-video, and revised picture follows
  `Visual-content source resolution`.
- Only the material libraries relevant to each scene were checked at picture
  generation time; no all-library startup scan was used as a substitute.
- Every missing or unsuitable picture source has a recorded user-material
  request naming the scene or timecode and the needed source, plus the user's
  response.
- No verbal description, placeholder, or template-bundled example was used as
  the final picture source.
- Every AI-generated picture has explicit user authorization, the target scene
  or timecode, and generated-file paths recorded. Silence was not treated as
  authorization.
- Every user-selected or user-supplied picture asset was used as directed and
  its original file was preserved.
- The final file is inside `成片/`.
- The project `复盘.md` has been written.
- Feedback was requested after every storyboard, timeline-keyframe, and revised
  picture presentation.
- User-provided reference images or videos are stored under `素材/参考/` and
  recorded in `方案/反馈记录.md` when used.
- The approved feedback record matches the latest revised keyframes and final
  version.
- The post-render effects review was answered before delivery.
- The final MP4 was rendered only after `确认关键帧`; plan, storyboard, or
  opening approval was not treated as keyframe approval or final-render
  approval.
- When a revision from a material library was requested, its revised keyframes
  were approved with `确认关键帧` before a new final render was produced.
- The project record lists the selected library, ID, target scene, usage part,
  adaptation result, license or attribution status, approved keyframes, and
  resulting final version.
- The plan, keyframes, and final video were checked against
  `方案/视觉元素匹配与重复率.md`.
- The standalone-opening decision is recorded, and any opening that was used
  matches the approved source record without changing canonical
  speech, subtitles, source order, output language, or safe area. When a
  template is used, protected template structure must also remain intact.
- When a standalone opening was used, its real sample path, source segment IDs,
  consumed SRT range, target duration, and `确认开头` response are recorded.
- The opening was normally 5-10 seconds, or its duration exception was
  explicitly approved.
- The opening follows sentence and visual-group timing, uses single-line
  clause subtitles without character reveals, and uses no invented semantic
  text.
- The body begins at the first source segment not consumed by the opening, and
  the opening plus body contain no duplicate or omitted source text.
- Subtitle timing was rebuilt after the opening split, speed adjustment, breath
  removal, silent-gap removal, or retake cleanup and matches the final audio.
- When a template is used, template fixed visual repetition is no more than
  50%, or every unresolved protected limitation is explicitly reported.
- Editable visual repetition is no more than 30% by the recorded `(T - D) / T`
  calculation, with no invented IDs, counts, or pass result.
- Picture-transition repetition is no more than 20% by the recorded
  `(Q - U) / Q` calculation, and each transition key records its easing or fade
  treatment. Every fade or crossfade visibly contains both its fade-out and
  fade-in.
- Every material-library replacement preserves the approved meaning, output
  language, subtitles, safe area, and content fidelity. When a template is
  used, it also preserves the template's fixed format.
- Every Tabler Icons choice resolves to a verified icon name from the current
  local inventory or official gallery, appears only in editable B-ROLL where a
  clear object, action, or concept calls for it, and was actually imported,
  downloaded, or rebuilt before being claimed in the final video. Verify that
  it remains recognisable at final size and that fixed template graphics and
  branding remain intact.
- Every editable B-ROLL typeface comes from a verified material-library font or
  typography entry, or from Google Fonts. Its actual font file has verified free
  or open-source licensing and covers every required Chinese character, Latin
  letter, number, punctuation mark, and symbol at final size. Record the
  family; material-library root and relative locator or Google Fonts URL;
  license evidence; coverage result; target scenes; and final-size legibility
  result. Missing glyphs are a blocker, and fixed template typography remains
  intact.
- The final video uses no more than three distinct Color Hunt palettes in total.
  Every selected palette has its unique URL or ID, exact colors, assigned
  scenes, and final-size contrast result recorded. Template-fixed colors and
  branding remain intact.
- The project `sfx-cue-sheet.json` exists when external SFX were used.
- The bundled `THIRD-PARTY-NOTICES.md`, `LICENSE`, and audio attribution files
  remain present when VIDEO-SHOTCRAFT is shared or redistributed.

If any check fails, do not call the video complete. Fix it or report the exact unresolved issue.

Learning records are post-delivery work. After the user receives the validated
final files, write `复盘.md` and refresh `学习状态.json` as described in
[references/learning-loop.md](references/learning-loop.md). Those two records
do not gate the already validated MP4, SRT, and ASS delivery.

## Recovery and retry

- Persist the approved plan, standalone-opening source range and source types,
  opening sample path, `确认开头` state, first unconsumed body segment,
  timeline-keyframe path and capture timecodes, `确认关键帧` state,
  per-scene and per-step relevant-library check results, unavailable-library or
  unsuitable-entry requests, user replies, user-supplied source paths,
  AI-generation authorizations and generated-file paths,
  every template scene or slot's motion capability map, the required internal
  action and production medium, completed or blocked status, and each blocked
  action's reason,
  the final-render BGM request and response, the no-BGM default when unanswered,
  BGM source and licence record, fixed BGM gain,
  loudness measurements when BGM is included, and the opening-sample BGM
  exclusion,
  sentence/visual-group map with every group's sentence count,
  and job outputs.
- Resume from the last valid checkpoint after interruption.
- Reuse existing artifacts before repeating generation.
- Retry a failed operation at most three times.
- After the third failure, preserve logs and return control with the exact error.

## Sharing boundary

This skill contains instructions, maintenance scripts, tests, template
metadata, and the minimal Video Template Kit foundation files needed for
automatic installation.

It must not bundle:

- `.motion` packages containing personal identifiers.
- User footage, audio, logos, or private project data.
- The library's preview cache.
- Toolkit credentials, signatures, or account secrets.

The bundled VIDEO-SHOTCRAFT code and assets retain
`assets/vendor/video-shotcraft/THIRD-PARTY-NOTICES.md`,
`assets/vendor/video-shotcraft/LICENSE`, and
`assets/vendor/video-shotcraft/assets/audio/ATTRIBUTION.md`. Remotion's own
license still applies to Remotion usage; Apache-2.0 notices do not grant a
Remotion commercial license.

Colleagues install this skill separately and point it to their own authorized
external template library and toolkit.
