# Visual Feedback and Reference Media

## Trigger

Run this feedback gate after presenting:

- Storyboard images or example frames.
- Timeline keyframes generated from the actual approved timeline.
- Revised timeline keyframes after a Card or scene change.

Do not treat silence as approval.

Storyboard approval permits the next required visual step only. For a project
with a standalone opening, `确认开头` permits body-timeline and keyframe work;
`确认关键帧` authorizes the final-render phase after the BGM decision.

Every reviewed keyframe and the final video must preserve one complete reading
clause per single-line burned subtitle, at most three sequential cues when a
source sentence is split, no later cue appearing early, no subtitle character
reveal or karaoke effect, strictly serial visual groups for long sentences, and
no visual group carrying more than three consecutive canonical sentences. A
scene or visual group must not contain only a script fragment below five visible
characters.
Within the current canonical sentence, multi-stage B-ROLL graphic text may enter
one semantic line or phrase at a time instead of appearing all at once; later
wording and later sentences must not appear early.
Do not treat a still frame with the complete text visible as evidence that
these rules were met.

## Required prompt

Ask directly:

> 请指出哪些场景或时间码需要改进。需要修改请回复“需要修改”，并写明要修改的内容；不需要修改请回复“不需要修改”。如果文字描述不清楚，可以提供参考视频或图片，并简单说明想参考其中的构图、动效、节奏、颜色或文字排版。

Keep the question concise and actionable.

## Accepted feedback

Accept any of these forms:

- Scene number or timecode plus a text description.
- A requested change to visible text, subtitle copy, narration, voice, sound,
  pacing, duration, or editing.
- Reference image plus a simple description of the desired aspect.
- Reference video plus a time range and a simple description.
- CARD ID plus the target scene or timecode and usage part.
- VIDEO-SHOTCRAFT card name and style key plus the target scene or timecode and
  usage part. These identifiers are separate from MOTION Card IDs.
- Kitbitz asset ID or file plus the target scene or timecode and usage part.
- motion-prompt number from `#001-#192` plus the target scene or timecode and
  usage part.
- Meta Open Sound or UI SFX ID, pack, cue, or filename plus the target visible
  event or timecode.
- React Video Editor component or editor interaction plus the target scene or
  timecode and usage part.
- Remotion Scenes category, scene name, or source path plus the target scene or
  timecode and usage part.
- Curvable Motion component name plus the target scene or timecode and usage
  part.
- Remotion Playground Composition ID from `src/Root.jsx` plus the target scene
  or timecode and usage part.
- Tabler Icons icon name plus the target scene or timecode and editable B-ROLL
  usage part.
- A plain-language description of what looks wrong and what should change; the
   agent should infer the likely scene, usage part, and material mapping and
   confirm it if ambiguity remains.
- A combination of the above.

Ask for the target scene or timecode only when it cannot be inferred. Do not
require a highly technical description. Accept an unambiguous natural-language
equivalent even when the user does not use the suggested reply words.

## Reference media handling

- Preserve user-provided reference files under `素材/参考/`.
- Do not overwrite, alter, or reuse them outside the current project.
- Inspect only the relevant moments or visual qualities.
- Use the reference for the requested aspect such as composition, motion,
  pacing, color, typography, or transition behavior.
- Do not copy unrelated text, claims, logos, watermarks, faces, or protected
  content from a reference.
- Reference media does not authorize adding semantic content. Content-fidelity
  rules still apply.
- If the reference contains content the project does not have rights to use,
  treat it as a visual reference rather than an asset to embed.

## Feedback processing

1. Restate each requested change in concrete terms.
2. Link it to the target scene or timecode.
3. Note any reference file and the specific aspect to follow.
4. Separate user-authorized content or voice revisions from unsupported facts,
   evidence, or claims.
5. If the change needs a new or replacement picture, search only the material
   libraries relevant to that scene. If no suitable source exists, request the
   missing user-supplied library or source asset. Do not treat a description,
   placeholder, template example, or self-generated picture as a substitute.
   AI generation requires the user's explicit statement that no material will be
   provided or explicit authorization for that scene.
6. Report any selected-template limitation before making the change.
   For VIDEO-SHOTCRAFT, report the exact card name, style key, demo path,
   requested ratio, and license status. If `INK-PRESS` is selected, reject a
   requested ratio other than native 16:9 instead of silently converting it.
7. If a change alters text, narration, voice, motion, audio timing, or scene
   timing, record the approved revision as the new canonical source for affected
   segments and rebuild the affected subtitle cues, voice timing, sentence and
   visual-group boundaries, and whole-video validation. Keep each burned
   subtitle clause on one line with no character reveal or karaoke.
8. Check the selected material and non-library source record against
   `方案/视觉元素匹配与重复率.md`. Recalculate template-fixed and editable
   repetition when a visual slot changed, and recalculate picture-transition
   repetition when any transition, entrance, or exit treatment changed.
9. Update only the requested areas and keep unaffected scenes locked.
10. If a revision changes timing, scene structure, framing, camera, visible text,
   subtitle placement, visual assets, or transition treatment, regenerate the
   affected timeline keyframes and ask:

> 确认关键帧请回复“确认关键帧”；需要修改请回复“需要修改关键帧”，并写明时间码、场景或视觉组以及要修改的内容。

11. After `确认关键帧`, verify single-line clause subtitles without character
   reveals, at most three cues per source sentence, serial visual groups, the
   three-sentence maximum per group, and no scene or visual group containing
   only a sub-five-visible-character script fragment throughout the affected
   and locked scenes before final rendering.
12. Render the final MP4 only after `确认关键帧` and the recorded BGM decision.

If a later revision changes the approved visual style, subtitles, transitions,
sound, materials, or timing, regenerate the affected keyframes and obtain
`确认关键帧` again before rendering a revised final.

If feedback changes copy or narration, treat the user's approved revision as
the amended canonical source. Ask before continuing when the requested wording
or target is ambiguous. Do not invent facts, evidence, or claims beyond the
request.

## Project record

Save the project record to `方案/反馈记录.md` containing:

- Reviewed keyframe version.
- Timeline-keyframe version, capture timecodes, covered scenes and
  transitions, and `确认关键帧` result when a standalone opening is used.
- User feedback.
- Target scene or timecode.
- VIDEO-SHOTCRAFT card name, style key, demo path, output ratio, and license
  status when that library was used.
- Reference file paths and SHA-256 hashes when supplied.
- Requested reference aspects.
- Changes made.
- Relevant libraries checked, actual matching IDs or no-match results,
  user-material requests and responses, and any AI-generation authorization.
- Revised keyframe path.
- Approval status.
- Sentence and visual-group timing result, subtitle single-line and non-reveal
  result, every source sentence's one-to-three-cue result, every group's sentence
  count and three-sentence maximum result, and the sub-five-visible-character
  merge result.
- Updated visual asset mapping and repetition result when a visual was changed.
- When a transition changed, the latest transition keys plus the
  `Q / U / (Q - U) / Q` result, complex-transition `C`, allowed
  `floor(Q × 10%)`, and pass or fail. For every changed transition, record its
  duration, standard or complex classification, matching SFX cue, coordinated
  easing treatment, and fade-out/fade-in pairing when applicable. A fade or
  crossfade with only one half fails. Hard cuts still need the sound cue unless
  the user requested silence.

