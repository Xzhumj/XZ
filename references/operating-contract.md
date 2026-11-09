# Operating Contract

This reference captures production decisions that must survive chat context
loss. The toolkit's `config/defaults.json` is the machine-readable source; this
file explains the expected behavior.

## User direction

The user's explicit instructions for the current video govern every requested
change to picture, source material, motion, transitions, text, subtitles,
narration, voice, sound, pacing, duration, editing, and output treatment.
The defaults in this reference apply only where the user has not specified a
different treatment.

- Follow the requested scope even when it differs from template defaults,
  automatic matching, material recommendations, or saved preferences.
- Treat an approved content, narration, voice, or timing revision as the new
  canonical source, then rebuild affected captions, audio edits, scene mapping,
  and validation.
- Do not invent facts, evidence, or claims beyond the request. If the request
  is ambiguous or conflicts with supplied inputs, ask which version is
  authoritative before changing the video.
- Record each requested change, affected scene or timecode, and approval in the
  project records.

## Inputs and task isolation

- Accept any one of these primary inputs as sufficient to start: copy, SRT,
  speech audio, or talking-head video. A video-production script supplied
  together with storyboard images is also a complete input bundle.
- Multiple inputs are allowed when they express the same content. Treat them as
  one input bundle, not as separate projects.
- Do not batch unrelated topics or different scripts into one task.
- Additional images, video clips, logos, or other supporting media may be
  supplied after the primary input. Ordinary template-based work also waits for
  template selection; script-and-storyboard direct production does not.
- For a talking-head video, preserve the original audio and every spoken word
  unless the user explicitly requests a different narration or voice treatment.
  Otherwise, use only minor speed, breath, and silent-gap adjustments.
- For a pure SRT, preserve its words and order. Timing may be regenerated only
  for the approved scene structure or synchronized final audio. Narration is
  optional unless the approved direction requires it.
- For pure copy, default to a text-motion video. Narration is optional, but
  subtitles are mandatory.
- For speech audio, preserve the supplied voice and every spoken word unless
  the user explicitly requests a different narration or voice treatment, and
  transcribe the approved audio for subtitles.
- Keep all generated files in an isolated job directory.

## Input consistency

- Before template matching or planning, compare copy, SRT text, ASR transcript,
  and spoken content.
- Ignore presentation-only differences such as punctuation, whitespace, line
  breaks, and subtitle segmentation.
- Stop on material differences in words, names, numbers, units, dates, order,
  negation, calls to action, or factual claims.
- Present the exact differences and ask which input is authoritative.
- Do not silently merge, rewrite, choose one input, or continue with a
  mismatched recommendation.
- ASR recognition errors may be resolved against clear supplied text, but
  actual spoken differences require user confirmation.
- A language change is a material difference unless the inputs are explicitly
  approved as translations of each other.
- Record the canonical text source in the production plan.

## Script and storyboard direct production

- When a video-production script and storyboard images are supplied together,
  use them as the production plan and direct-production source.
- The script controls narration, spoken content, visible text, wording, and
  order.
- The storyboard controls scene count, scene order, framing, composition, camera
  intent, and visual sequence.
- Read `references/storyboard-motion-direction.md` before planning or building
  script-and-storyboard direct production.
- Treat the script and storyboard as creative intent, not an execution
  timeline. The user does not need to supply keyframes, code, or frame-by-frame
  element instructions.
- When scene motion is absent, vague, or incomplete, author a complete
  element-level motion treatment from the narration, storyboard, visual
  emphasis, emotion, rhythm, and adjacent-scene continuity.
- Whole-frame zoom, pan, slide, fade, blur, or camera travel alone does not
  satisfy an internal action required by the storyboard.
- Motion completion may not change the supplied scene count, order, framing,
  composition, subject, narrative meaning, or source assets without explicit
  user approval.
- Do not select, recommend, match, or apply any MOTION `.motion` template,
  Lemo-Opuscar style, or VIDEO-SHOTCRAFT template. Do not replace a supplied
  storyboard scene with a template layout or use a template-bundled example.
- If the script and storyboard conflict on wording, order, scene ownership, or
  visible claims, stop and ask which supplied version is authoritative.
- Build the supplied storyboard directly. Use CARD, Kitbitz, Meta Open Sound,
  UI SFX, motion-prompt, React Video Editor, Remotion Scenes, Curvable Motion,
  Remotion Playground, Tabler Icons, and VIDEO-SHOTCRAFT cards and styles to
  supply animation, motion, picture elements, graphics, sound, transitions, and
  camera language.
- In direct production, any verified transition reference from these libraries
  may be used when it fits the supplied storyboard and supported execution
  path. Template matching is not required. A rebuilt reference must be recorded
  as an adaptation, never as a directly inserted template.
- Do not run a separate all-library material-selection gate before the plan.
  Record each scene as an explicit user source, a verified material-library
  entry, a pending user-material request, or an authorized AI-generated source.
- When a scene actually needs a new picture, checking and searching the material
  libraries relevant to that scene is mandatory. Include each verified ID,
  purpose, scene or timecode, and compatibility result. If the relevant library
  is unavailable or no suitable entry exists, ask the user to provide its local
  folder, package, accessible inventory, or source assets. Do not use a
  description, placeholder, template example, or self-generated picture to skip
  that request. For a sound cue, a concrete sound treatment may be accepted when
  no sound library is available. Never invent an entry or substitute a template.
- AI generation for a picture is allowed only after the user explicitly says
  they cannot provide the material or explicitly authorizes generation for that
  scene. Silence is not approval.
- If the storyboard already defines an opening, treat it as supplied direction
  and do not ask the separate standalone-opening question.

## Content fidelity

- The canonical source controls all semantic content.
- Default to zero additions and zero deletions.
- Do not invent titles, explanations, examples, claims, transitions, CTAs,
  conclusions, data, testimonials, or outro copy.
- Do not insert, delete, summarize, paraphrase, shorten, expand, replace, or
  reorder source text or spoken words unless the user explicitly requests that
  revision.
- Presentation-only changes such as sentence- or clause-level subtitle cue
  boundaries, scene splitting, typography, layout, and motion are allowed.
  Burned subtitle text remains one complete reading clause per single-line cue.
- Allow only minor speed adjustments that preserve meaning and
  intelligibility, plus removal of breaths and silent gaps. Removing audible
  speech tokens such as filler words requires separate explicit confirmation.
- Template-default semantic text must be disabled or replaced with source text.
- If text does not fit, extend duration, split the scene, or change layout.
  Never condense, trim, or rewrite source text.
- Every canonical word occurrence must appear exactly once in source order
  across the opening and body.
- Burned subtitles show one complete reading clause per cue on one line. A cue
  may end at a comma or sentence-ending punctuation. One canonical sentence may
  use at most three sequential cues. The cues may remain in one scene or
  continue across scenes. Two source sentences must not be visible together, a
  later cue must not appear early, and no cue may contain a line break.
- A segment with fewer than five visible characters, letters, or digits, after
  excluding punctuation and whitespace, must not be the only script-driven text
  in a scene or visual group. Merge it into adjacent visual content.
- Burned subtitles and their SRT and ASS text must not use
  character-by-character reveal, typewriter, progressive masking, karaoke, or
  word-by-word highlighting.
- No text, title, emphasis word, or B-ROLL from a later source sentence may
  appear before that sentence begins.
- One visual group may carry a continuous passage of 1-3 canonical sentences
  when one complete picture or scene must be preserved. Never exceed three; a
  fourth consecutive sentence requires a new visual group. A shared background
  may continue, but every sentence's dedicated text and B-ROLL enter only when
  that sentence begins.
- Within the current canonical sentence, do not show all B-ROLL graphic text at
  once when it has multiple semantic stages. Reveal one semantic line or phrase
  at a time in exact source order. Earlier lines may remain, weaken, or exit;
  later semantic lines and later sentences stay hidden until their own timing.
  Burned subtitles, SRT, and ASS remain complete single-line cues and never use
  this line-by-line treatment.
- A long sentence may use multiple visual groups, but the groups must be
  strictly serial: the previous dedicated group must finish before the next
  group enters; a shared background may remain.
- Rebuild subtitle timing after any speed adjustment, breath removal, silent-gap
  removal, retake cleanup, or standalone-opening split. Rebuild the affected
  sentence and visual-group timing in the same pass.

## Standalone opening

- After source checks pass, proactively offer a standalone opening once unless
  the user or a resumed project already decided.
- For a talking-head video, recommend it more strongly because a short
  visual-led opening commonly improves first impression and retention. Do not
  describe it as mandatory or alter the source without permission.
- Use the exact choices `我来选开头`, `AI匹配开头`, and `不加独立开头`.
- A standalone opening is normally 5-10 seconds and uses one continuous passage
  from the beginning of the canonical source.
- The selected template in ordinary template-based work, a verified
  material-library entry, or a user-supplied source asset may supply the
  opening's visual, motion, graphic, transition, and sound treatment. For
  script-and-storyboard direct production, use only the supplied storyboard,
  user-supplied source assets, and the eleven material libraries. At picture
  generation time, checking and searching the material libraries the opening
  actually needs is mandatory.
- Keep burned subtitles to one complete reading clause per single-line cue.
  Never apply character reveals or karaoke to subtitles. The material libraries
  supply the visual and sound treatment; they never change the canonical words.
- For `我来选开头`, provide the gallery, list, or manifest for sources the user
  asks to browse. Do not pre-check every material library. Accept a library ID,
  scene name, or user-supplied source asset. A plain-language description may
  refine an approved source but does not replace a required missing picture
  source.
- For `AI匹配开头`, give a concrete source-by-source treatment. Include real IDs
  and compatibility results for any library entries. If a required picture has
  no usable source, request user material instead of proposing a placeholder or
  self-generated replacement.
- Do not add, remove, rewrite, or reorder opening words.
- Produce a real opening sample before building the body. A still image,
  unrelated template demo, or invented title is not an opening sample.
- Wait for explicit `确认开头` before body production. Use
  `需要修改开头` to keep the gate closed and revise the sample.
- If the exact passage cannot fit, use only the allowed minor speed, breath, or
  silent-gap adjustments. Then propose another continuous source passage or
  request explicit approval of a different duration. Never truncate or rewrite
  the words.
- After `确认开头`, mark every source segment ID and SRT cue used by the opening
  as consumed. The body starts at the first unconsumed segment and must not
  repeat the opening text.
- Rebuild the combined SRT timing against the final audio after the split or
  any permitted timing adjustment.
- Record the decision in `方案/制作选项.md`. Record opening visual material,
  source IDs, consumed SRT range, duration, sample path, confirmation result,
  and first body segment in the project records. Include the decision in the
  production plan.
- Count every added or replaced opening visual as an editable visual slot in
  the whole-video 30% repetition calculation.
- Count every picture transition used by the standalone opening in the separate
  whole-video `Q / U` transition audit with the 20% limit.

## Output language

- The canonical input determines the final video language.
- Chinese canonical input requires Chinese visible text in the timeline
  keyframes and final video, regardless of the template's demo language.
- Localize all template-default titles, labels, captions, CTAs, data labels,
  callouts, transition text, and outro copy.
- Localization must not create new semantic content; use exact source text
  without changing any words.
- Preserve user-supplied brands, product names, model numbers, URLs, code,
  acronyms, units, and proper nouns unless a replacement is supplied.
- Preserve the input's Simplified or Traditional Chinese variant unless
  conversion is explicitly requested.
- Non-editable English text may block any selected template. Report the exact
  blocker and do not deliver a mixed-language final video.
- Do not silently switch templates or use an improvised cover-up that is not
  supported by the template workflow.

## ASR

- Default talking-head ASR is the local VideoToNo faster-whisper service.
- Use the same reviewed ASR path for speech-only audio.
- Prefer a stronger multilingual Whisper model when needed.
- Permit a HyperFrames Whisper second pass for quality comparison.
- For SRT-only input, preserve the supplied words, punctuation, and order.
  Timing may change only for the approved scene structure or synchronized
  final audio.
- For SRT plus audio or talking-head input, first verify that the texts agree.
  When they agree, keep the approved SRT wording and use the real speech timing
  for burned subtitles and delivered subtitle files.
- Record any timing differences between the supplied SRT and the real speech in
  the production plan. Do not silently discard the supplied timing.
- If the SRT text and spoken meaning differ materially, stop under the
  input-consistency rules before choosing a timing basis.
- If a talking-head video has no SRT, create subtitles automatically. Do not ask
  whether subtitles are needed.
- For long-pause retakes, use word-level ASR and the retake-cleanup helper only
  after the pause, repeated-opening, similarity, and later-take completeness
  checks pass.
- Keep ambiguous retakes unchanged and record them for review.
- Regenerate subtitle timing after the cut; never reuse full-recording SRT
  timing on cleaned media.
- Regenerate combined SRT timing when a standalone opening consumes the first
  source passage; do not include the consumed cue in the body.

## Subtitles

- Every final video must contain readable, time-synchronized subtitles burned
  into the picture.
- Always deliver matching SRT and ASS files with the final MP4.
- Preserve the source language unless translation is explicitly requested.
- Template titles, decorative words, and body copy do not count as subtitles
  unless they form a complete, readable, timed caption sequence.
- For SRT-only input, preserve the approved text; timing may be rebuilt only to
  match the approved final audio and scene structure.
- For SRT plus audio or talking-head input with consistent text, preserve the
  approved SRT wording while using verified speech timing.
- For speech-audio input, use the verified transcript as the subtitle source.
- For talking-head input without SRT, use the reviewed local ASR path and
  present the transcription in the plan and sample.
- For copy input, create timed captions from the approved copy even when no
  narration is used.
- Do not rewrite, insert, delete, merge two sentences, or reorder subtitle text
  without explicit user approval. After approval, use the revised text as the
  canonical subtitle source and rebuild one complete reading clause per
  single-line cue and its timing.
- Burned subtitles show one complete reading clause per cue on one line. A
  source sentence may use at most three sequential cues at natural semantic
  boundaries, within one scene or across scenes. Do not display two source
  sentences together, show a later cue early, cut inside an inseparable semantic
  unit, or insert a line break. Merge any sub-five-visible-character fragment
  into adjacent visual content instead of giving it a scene of its own.
- Do not show text, titles, subtitles, emphasis words, or B-ROLL from a later
  source sentence before that sentence begins.
- B-ROLL graphic text may enter semantic lines sequentially within its current
  sentence, but it must preserve exact source wording and order and must not
  reveal a later semantic line or sentence early.
- Keep every visual group within three consecutive canonical sentences. Shared
  picture elements may continue across sentences, while sentence-specific text
  and B-ROLL remain gated by their own sentence cue.
- For a long sentence, keep its visual groups strictly serial. The previous
  dedicated group must finish before the next group enters; a shared background
  may remain.
- Never use character-by-character reveal, typewriter, progressive masking,
  karaoke, or word-by-word highlighting on burned subtitles or their SRT and
  ASS text.
- Keep canonical subtitle text and cue timing in SRT and ASS. Each cue contains
  one complete reading clause on one line with no `\n` or `\N`; the subtitle
  files must match the burned-in subtitles.
- When a standalone opening is used, opening cues are consumed and must not
  reappear in the body. The combined SRT must cover every source word occurrence
  exactly once in source order.
- Keep captions inside the template's safe area and avoid collision with
  faces, UI, logos, and critical graphics.
- If ASR fails or confidence is too low, repair the dependency or request a
  corrected SRT. Never omit subtitles to unblock delivery.

## Matching

- Skip template selection and semantic template matching when the
  script-and-storyboard direct-production rules apply. Do not use a template as
  an execution source, even when it could be adapted to the supplied scenes and
  order.
- Use the template-selection mode already stated or clearly implied by the user.
  Ask only when the mode is still unknown.
- For automatic matching, use this ordered fallback instead of a four-library
  pool:
  1. Compare Lemo-Opuscar and VIDEO-SHOTCRAFT first as equal-priority sources.
  2. Search SHOWREEL-43 only when neither first-tier source has a genuinely
     suitable executable match.
  3. Search MOTION only when none of Lemo-Opuscar, VIDEO-SHOTCRAFT, or
     SHOWREEL-43 has a genuinely suitable executable match.
- A usable higher-tier match blocks all lower tiers. Do not search or recommend a
  lower-priority library merely to fill the candidate count. If AI matching is
  selected, recommend 3-5 candidates from the first successful tier, or only
  the suitable candidates actually found there when fewer than three exist.
  Explain the fit for each candidate, but do not produce four separate
  shortlists or append all complete catalogs during matching.
- Do not explain to the user that the libraries use different underlying
  production methods. Show source labels, names, previews, fit reasons, and
  compatibility results only; execution routing is internal.
- If self-selection is selected, provide the complete MOTION template list, the
  Lemo-Opuscar official gallery, and the VIDEO-SHOTCRAFT complete template,
  card, and style gallery, plus the SHOWREEL-43 complete style list and local
  gallery in the same response:
  https://lemomo-ai.github.io/lemo-opuscar/
  https://vincentwei1021.github.io/video-shotcraft/
  `references/showreel-43.md`
- Treat a direct MOTION template ID or name, a direct Lemo-Opuscar style name
  or slug, or a direct VIDEO-SHOTCRAFT template, card name, or style key as a
  completed self-selection. A direct SHOWREEL-43 slug or Chinese style name is
  also complete. An explicit selection overrides the automatic priority order.
  Do not ask the selection-mode question again or override the explicit choice
  with a score.
- Hard filters: orientation, output-language support, usable source slots,
  stable version, signature, hash, package integrity when applicable, and
  workflow compatibility.
- Weighted dimensions: content type 25, visual style 20, material form 15,
  rhythm 15, duration fit 15, subtitle density 10.
- A score below 60 requires human input before forcing the closest template.
- For each recommendation, include the source library, template ID or style
  slug, VIDEO-SHOTCRAFT card name and style key when applicable, name, ratio,
  fit reason, preview, and output-language compatibility. SHOWREEL-43 uses its
  catalog slug and local 5-second preview.
- A direct selection overrides the recommendations. Use only the specified
  templates after checking every ratio and source item.
- The user may confirm one template or a deliberate combination of multiple
  templates.
- Prefer no more than three templates in one video. If the user requests more,
  explain the added review, rendering, and continuity risk and obtain explicit
  confirmation.
- For a multi-template combination, record every template's role, scene
  ownership, order, and transition before planning.
- Do not silently add, remove, replace, reorder, or split work across templates
  that the user did not approve.
- Every template used in one delivery must render to the same approved final
  canvas. Do not combine conflicting native ratios through cropping or
  stretching.
- New MOTION tasks use the latest signed stable version and then pin it.

## Templates

- Treat `.motion` packages as immutable.
- Invoke only through the declared `assistant/motion.mjs` and `guide.json`.
- Write `params.json`, rendered data, previews, captions, voice assets, and
  keyframes outside the package.
- Validate the official signature and SHA-256 of protected package content
  before and after execution.
- Prefer native parameters to disable CTA, outro, and branding; otherwise trim
  the assembled master timeline.

## Template motion completion

- Ordinary template-based work reads
  `references/template-motion-direction.md` before planning or execution. It
  does not apply to script-and-storyboard direct production, which must not use
  a template.
- A template is a visual framework and execution capability, not proof that the
  required internal animation is already complete.
- Classify every selected template scene and editable slot as `Native motion`,
  `Editable slot`, `Fixed overlay area`, or `Sealed or unsupported`.
- Use template-native motion first. When the content needs more motion and the
  template exposes an editable slot, author the missing text, card, icon, path,
  chart, data, person, object, background, or layer action inside that slot.
- When the declared workflow permits an independent overlay in a safe area,
  add only the smallest overlay needed to complete the required action while
  preserving protected structure.
- When the internal layer or action is inaccessible, report the exact scene or
  timecode and block that action. Do not use whole-frame push, pan, zoom, fade,
  blur, or an unrelated transition as a substitute.
- Preserve the selected template identity, fixed layout, branding, native ratio,
  approved scene ownership, source text, source order, and user assets.
- Treat `.motion` as sealed. Do not unpack, rewrite, patch, or bypass it to
  invent internal layers. A material preview, GIF, MP4, or demo proves only the
  visible reference, not that its internal layers are editable.

## Visual asset selection and repetition

- Apply this section to every video with visual making, including graphics,
  objects, icons, cards, UI treatments, text components, standalone openings,
  transitions, camera effects, emphasis, and endings.
- Before building or revising editable visuals, identify each scene's approved
  source type. When that scene calls for library material, match it against only
  the relevant material library.
- Use CARD for motion, transition, UI, data, camera, typography, images, and
  effect ideas. Use Kitbitz for object and scene illustrations. Use
  motion-prompt `#001-#192` for motion, animation, entrance, exit, transition,
  camera language, UI, web effects, images, lighting, and photo-look references.
- Use Meta Open Sound for realistic recorded foley, ambience, material actions,
  and object sounds. Use UI SFX for clicks, switches, successes, warnings,
  loading, transitions, and other interface cues. The local SFX index is a
  supplemental source.
- Use React Video Editor only for editor UI, timeline, panel, control, and
  editing-interaction references. Use Remotion Scenes for scene, layout, camera,
  transition, text, UI, data, particle, background, and motion references. Use
  Curvable Motion's 14 components for text, background, and composite-scene
  references. Use Remotion Playground's current `src/Root.jsx` Composition IDs
  for text, transition, data, 3D, audio-reactive, particle, loading, media, and
  promotional scene references.
- Use Tabler Icons only for editable B-ROLL that explicitly names a clear
  object, action, or concept. Verify the exact icon name in the current local
  inventory or official gallery, and preserve fixed template graphics and
  branding. Never invent an icon name or claim an online icon was inserted
  before it was imported, downloaded, or rebuilt.
- Treat [Pexels](https://www.pexels.com/zh-cn/) as an optional source of real
  photographic B-ROLL, not as one of the eleven animation and material
  libraries. Use a photo only
  when it makes the current canonical sentence or visual group more accurate
  and concrete. Do not add a merely related decorative photo.
- Derive the Pexels search intent from the current sentence's people, action,
  object, place, scene, emotion, orientation, crop, and required framing. Check
  the candidate's factual fit, resolution, subject completeness after cropping,
  subtitle safe area, and A-ROLL visibility.
- Re-check the current Pexels license and the image page's author or attribution
  requirement before use. Never infer rights, an author, an image ID, or visual
  content from a thumbnail, search result, cached summary, or memory.
- Download every selected Pexels photo to the project's local asset folder and
  preserve the original file. Do not leave rendering dependent on a remote URL.
- Record the Pexels page URL, image ID, author or attribution as shown, download
  date, license check date and result, target scene or timecode, source sentence
  and visual purpose, crop or fit, subtitle and A-ROLL safe-area result, local
  asset path, and selected production medium in
  `方案/视觉元素匹配与重复率.md`.
- A Pexels photo supplies photographic content only. It does not determine the
  HTML, SVG, Canvas, Three.js, Blender, WebGL, vertex-shader, or fragment-shader
  production medium and does not replace required graphics, icons, motion
  references, transitions, or sound cues.
- User-supplied photos, a supplied storyboard, a user-specified A-ROLL
  trajectory, and template-protected graphics take precedence over an automatic
  Pexels choice.
- If no suitable image exists, the source is inaccessible, or the license or
  attribution requirement cannot be verified, search only another material
  source that the current scene actually needs. If none has a usable entry,
  request a user-supplied library or source asset. Do not substitute a
  placeholder, description, or self-generated image without explicit user
  authorization. Do not guess.
- For script-and-storyboard direct production, do not pre-resolve unused
  material libraries. For each scene that actually needs one, resolve only the
  relevant library. Keep the supplied scene structure. If no usable source
  exists, request the missing user-supplied library or source asset, and never
  substitute a template, description, placeholder, or unauthorized generated
  picture.
- When a library entry is selected, state its actual ID, purpose, time range,
  and compatibility result. Never invent an ID.
- For a VIDEO-SHOTCRAFT item, also state the exact card name, style key, demo
  path, output ratio, and license. Keep these identifiers separate from MOTION
  Card IDs.
- `INK-PRESS` is native 16:9 only. Never crop, stretch, or convert it to 9:16.
- When a template is used, preserve its fixed format, protected structure,
  branding, and required slots.
- Choose a treatment from any verified material library only when it improves
  semantic clarity or visual quality without breaking the approved direction.
- Record the scene, source meaning, selected source and ID, checked relevant
  libraries and no-match results, user-material request and response,
  AI-generation authorization, adaptation status, visual combination key,
  picture-transition key and treatments, and repetition audits in
  `方案/视觉元素匹配与重复率.md`.
- Record every selected sound ID, cue time, purpose, source, license, attribution
  requirement, and local project path in `sfx-cue-sheet.json` or the copied
  source manifest.
- When a template is used, its fixed visual content may repeat up to 50%. This
  is separate from the editable-visual limit and cannot be used to relax it.
- Added, replaced, or otherwise editable visual slots must have an overall
  repetition rate no greater than 30% across the complete video.
- Calculate editable repetition as `(T - D) / T`, where `T` is the total
  editable visual slots and `D` is the number of distinct visual combinations.
- Do not apply the 30% limit separately to each combination. The limit is the
  aggregate result for the complete video.
- A visual combination key includes source library, asset or Card ID, visual
  style, and animation method. Picture-transition method is excluded and
  audited separately.
- Picture transitions have their own aggregate repetition limit of 20%.
  Calculate it as `(Q - U) / Q`, where `Q` is the total number of
  picture-transition slots and `U` is the number of distinct transition keys.
- A picture-transition key includes transition source library, asset or Card ID
  when applicable, production medium, transition method, and easing or fade
  treatment. A hard cut uses its own `hard cut` key.
- Storyboard-to-storyboard animation uses HTML, SVG, Canvas, Three.js, Blender,
  WebGL, a vertex shader, or a fragment shader according to the approved
  picture. Prefer SVG or Canvas for suitable two-dimensional work, use HTML for
  simple pictures, use Three.js when 3D or 2.5D is required, and use Blender
  when material or physical quality requires it. WebGL and shaders are used only
  when the approved motion or material needs their capability. Blender may
  render the transition directly or supply assets to a downstream composition.
- Material libraries supply content and references without dictating the
  production medium. Direct use requires a compatible editable or importable
  component, a declared template-native transition, or an approved direct
  Blender render. Previews, GIFs, MP4s, and demos remain references or
  composited assets unless the user explicitly authorises direct use.
- Resolve every picture transition in this order: use an existing directly
  compatible transition first; if none is suitable and the picture supports
  depth, perspective, parallax, camera travel, or layered-space motion, build a
  2.5D transition with Three.js; only when those options cannot meet the
  approved visual or technical requirement, use visual replication by rebuilding
  a verified reference in a supported medium. Record Three.js work as an
  authored transition and replication as an adaptation, never as a direct
  insertion.
- Count hard cuts in `Q` and `U`, but do not require transition easing or paired
  fades for them. Every non-hard-cut transition must be smooth and continuous
  with coordinated easing. A fade or crossfade must include both its fade-out
  and fade-in; never accept only one half.
- Every picture transition must use a verified SFX cue matched to the visible
  action and transition peak. Record the sound library, actual asset ID, cue
  time, purpose, license, and local path. A hard cut still requires a matching
  SFX cue unless the user explicitly requests silence.
- Standard non-hard-cut transitions must not exceed 0.5 seconds in total.
  Complex transitions may run longer than 0.5 seconds only when required by the
  visual treatment, with a maximum total duration of 0.8 seconds.
- Let `C` be the number of complex-transition slots and `Q` the total number of
  picture-transition slots, including hard cuts. Require
  `C <= floor(Q × 10%)`. This is a separate frequency limit, not part of the
  20% repetition calculation.
- Non-hard-cut transitions must use coordinated easing without a jump or
  endpoint artifact. Every fade or crossfade must visibly contain both its
  fade-out and fade-in; a half fade fails.
- Do not combine picture-transition slots with editable-visual or
  template-fixed repetition calculations.
- If template-fixed repetition exceeds 50% and an editable overlay may change,
  replace only the excess occurrence. If the repeated structure is protected,
  report the exact blocker and do not claim compliance. Script-and-storyboard
  direct production has no template-fixed 50% calculation.
- Recalculate after any approved change to the plan, keyframes, or final
  version.

## Review gates

- At every choice or approval gate, state the exact reply words and what each
  choice does. Do not leave the user to guess.
- When asking whether content, effects, transitions, text, or another visual
  part should be replaced, require `需要替换` for replacement and
  `不需要替换` to keep the current version.
- Use similarly explicit reply pairs for other gates, such as
  `确认方案` / `需要修改方案`, `确认开头` / `需要修改开头`,
  and `确认关键帧` / `需要修改关键帧`.
- Accept an unambiguous natural-language answer when the user does not use the
  suggested words. Restate the inferred choice when ambiguity remains.
- Show storyboard images directly in the Codex conversation.
- After storyboard images, ask which scenes need improvement and allow a
  reference video or image plus a simple description.
- One SRT, copy, or verified transcript sentence maps to one shot; split a long
  sentence into multiple shots.
- Wait for storyboard approval before opening and timeline-keyframe work.
- For talking-head retake cleanup, include the automatic cut plan and any
  ambiguous pairs in the production plan.
- When a standalone opening is selected, generate the real opening sample
  before body production and wait for `确认开头`.
- Keep the standalone-opening sample free of BGM. Opening approval does not
  preview or approve the final BGM treatment.
- Before `确认开头`, do not build body scenes, body voice edits, body captions,
  or the body timeline keyframes.
- After `确认开头`, build the body from the first unconsumed source segment and
  record the consumed source IDs and SRT cues. Generate timeline keyframes from
  the actual combined timeline.
- Show the timeline keyframes in timeline order with timecodes, scene or visual
  group IDs, final framing, visible text and subtitle placement, material
  sources, and transition moments.
- Wait for explicit `确认关键帧` before final rendering. Opening approval does
  not count as keyframe approval.
- After `确认关键帧`, check whether the user already explicitly chose whether
  the final video should include BGM. If not, proactively ask before final
  rendering. No answer when rendering starts means no BGM; record the
  unanswered default.
- Render the complete final MP4 only after `确认关键帧` and the BGM decision.
- Never skip from approved storyboard images or opening approval directly to
  the final MP4.
- After the final render, ask which scenes need improvement and allow reference
  media plus a simple description.
- Allow at most five automatic storyboard or keyframe rebuild rounds.
- When a storyboard is rejected, rematch templates. When keyframes are rejected,
  keep the confirmed template locked and revise the requested keyframes.
- Any material change after `确认关键帧` to timing, scene structure, framing,
  camera, visible text, subtitle placement, visual assets, or transition
  treatment requires rebuilt affected timeline keyframes and a new
  `确认关键帧` before rendering a revised final.
- After every complete final render and before delivery, ask whether the user
  wants to replace an effect, transition, text, CTA, UI treatment, data
  animation, camera move, emphasis, or ending.
- Require `需要替换` for a revision and `不需要替换` to continue without one.
- Provide 5-8 relevant visual references from verified material libraries with
  links to their complete local or online lists and galleries.
- Provide the current Meta Open Sound and UI SFX list, index, or manifest links.
- Provide the resolved local-root or online entries for React Video Editor,
  Remotion Scenes, Curvable Motion, Remotion Playground, and Tabler Icons.
- Accept replacement requests as
  `target scene or timecode + usage part + library + ID`.
- For requested revisions, check and adapt only the template or material source
  they actually call for; do not pre-check unrelated libraries.
- If a selected library cannot supply a compatible entry or its source is not
  verified, do not force it. Explain the blocker and suggest alternatives.
- If a material revision is requested, render revised affected keyframes and
  wait for approval before re-rendering the complete final video.
- Present the revised keyframes and require `确认关键帧` before re-rendering the
  final video.
- After a revised Card keyframe review, repeat the visual-feedback gate before
  full rerendering.
- Preserve previous final versions and return to the same review gate after a
  new final render.

## Audio

- Do not use template-provided voice.
- BGM is optional. After `确认关键帧`, ask whether the final video should include
  BGM. If no answer is received when final rendering starts, treat the answer
  as no BGM. The standalone-opening review sample contains no BGM regardless of
  the answer.
- When BGM is selected, use exactly one BGM track in the final video. Source it
  from a verified material library or
  [Pixabay Music](https://pixabay.com/music/), and verify the actual file and
  licence.
- When BGM is selected, use instrumental music only. Do not use lyrics,
  singing, rapping, spoken
  word, vocal chops that carry words, or any other vocal content. Verify by
  listening to the file, not only by title, tags, or metadata.
- When BGM is selected, match the track to the canonical copy's theme, emotion,
  pace, and duration.
- When BGM is selected, use the same single track throughout the complete
  final video. Set one fixed gain and do not use ducking, sidechain lowering,
  fades, rises, drops, or volume automation.
- When BGM is selected, set the fixed gain so narration remains clearly
  dominant and intelligible.
- When the user selects no BGM or does not answer, do not include BGM in the
  final video.
- Use Meta Open Sound for realistic recorded actions, ambience, materials, and
  object sounds. Use UI SFX for designed interface cues and the local indexed
  library only as a supplemental source.
- Do not guess pack names, cue names, or asset IDs. Search the current manifests
  and use only entries that exist.
- Match each selected sound to a concrete visible event or shot boundary.
- Create a timecoded cue sheet and verify the sound treatment before final
  rendering.
- Keep narration intelligible and use one clear primary sound event per action.
- Preserve the talking-head original audio and every spoken word unless the
  user explicitly requests a voice, narration, or edit change. Otherwise, use
  only minor speed, breath, and silent-gap adjustments.
- Preserve supplied speech audio and every spoken word when it is approved as
  final narration unless the user explicitly requests a different treatment.
  Otherwise, use only the same minor adjustments.

## Output

- Landscape: 1920x1080.
- Portrait: 1080x1920.
- Frame rate follows the template.
- MP4 H.264, yuv420p, SDR/BT.709.
- AAC audio, 48 kHz, stereo, about -14 LUFS, true peak no higher than -1 dBTP.
- Record the BGM decision in `方案/BGM记录.json`. When BGM is selected, keep the
  file under `素材/BGM/` and record its title, creator when available, source
  library or URL/ID, licence and attribution, duration, fixed gain, measured
  loudness and true peak, and final path.
- Burn subtitles and retain matching SRT and ASS files.
- Keep burned subtitles to one complete reading clause per single-line cue
  with no character reveal or karaoke, keep long-sentence visual groups strictly
  serial, and keep every visual group within three consecutive canonical
  sentences.
- Localize all visible template text to the canonical output language.
- Generate a cover from an approved representative frame and overlay an
  approved title.
- Keep final outputs and approved review artifacts permanently.
- Keep MP4, SRT, ASS, voice, manifests, logs, state, cover, and checksums.
- Keep the Card revision record and approved revised keyframes when effects are
  replaced.
- Keep `方案/视觉元素匹配与重复率.md` and its latest pass or fail result.
- Keep the approved content coverage map and change list.
- Keep the approved timeline-keyframe path and `确认关键帧` record.
- Keep the actual SFX cue sheet and source/license records.
- Keep every downloaded Pexels original and its page, image ID, author or
  attribution, download date, license check, crop, target scene, and local path
  record.
- Keep user reference media under `素材/参考/`, and keep the feedback record at
  `方案/反馈记录.md` when feedback or references are used.

## Recovery and retry

- Persist state after every step.
- Resume from the last valid checkpoint after a conversation close or restart.
- Persist per-scene source types, the relevant libraries checked, actual
  matching IDs or no-match results, user-material requests and responses,
  AI-generation authorization, and generated-file paths,
  keyframe approval, the sentence and visual-group map, emphasized
  character-reveal selections and budget, every group's sentence count, and the
  current approved file paths. Also persist the final-render BGM request and
  response, the unanswered no-BGM default, BGM source and licence, fixed gain,
  loudness measurements when BGM is included, and opening-sample exclusion.
- Persist every selected Pexels image ID, source page, local asset path, crop,
  license check, target scene, and the recorded user-material request when no
  suitable Pexels image is used.
- Use idempotency keys and existing-artifact checks to prevent duplicate voice,
  renders, uploads, or charges.
- Retry each step at most three times.
- Stop after the third failure, save logs and screenshots, and return control.

## Security and external services

- Never upload `.motion` packages, `release.bin`, internal template assets,
  signatures, credentials, or login tokens.
- SRT, copy, audio, video, frames, voice, and prompts may be sent to required
  providers.
- Open login screens for the current operator to authenticate manually.
- Never read, store, or transmit credentials.
- The public Skill repository contains no protected template content.

