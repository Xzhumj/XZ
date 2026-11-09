# Post-render Effects Review

## Trigger

Run this gate after every complete final MP4 render and before delivery. Run it
again after any material-library-driven revision produces a new complete final
render.

The video is a rendered candidate, not yet a delivered final, until the user
answers whether effects or transitions should be replaced.

## Required prompt

Ask directly:

> 成片已经渲染完成。我可以按本次实际使用的模板和素材来源检查画面和声音。需要新增或替换画面时，我只检查当前场景真正需要的素材库；没有合适素材时，我会请你提供素材库或素材。只有你明确表示无法提供或明确同意我生成画面后，我才会自己生成。需要替换请回复“需要替换”，并按“目标场景或时间码 + 使用部位 + 素材库 + ID”或“目标场景 + 你提供的素材”写明，例如：`需要替换，00:08 + 转场 + motion-prompt #046`；不需要替换请回复“不需要替换”。

Provide the answer path in the same response:

- Reply `需要替换` with one or more mappings in this form:
  `target scene or timecode + usage part + library + ID`.
- If the user cannot use the format, accept a plain-language description,
  infer the likely mapping, and confirm it when ambiguity remains.
- Usage parts include opening, title/text, transition, CTA, UI, data, camera
  movement, emphasis, or ending.
- Reply `不需要替换` to continue delivery.

## Material references

If the user asks for library alternatives, show only relevant visual references
from libraries already used or already resolved for this video. Do not pre-check
every material library. For each library reference include:

- Library and ID.
- For VIDEO-SHOTCRAFT, the exact card name, style key, and demo path instead of
  a MOTION Card ID.
- Chinese category.
- Implementation status.
- Short effect summary.
- Local preview link.
- Why it may fit the target scene.

Also provide:

- The source link for each material library that is actually used or offered.
- The libraries checked for the current scene and their actual IDs or no-match
  results.
- A source record for every scene or sound cue that is not from a material
  library: an explicit user source, a user-material request and response, or an
  AI-generated picture with recorded authorization. A description, placeholder,
  or template-bundled example is not a valid bypass.
- A statement that previews from CARD, Kitbitz, motion-prompt, Remotion Scenes,
  React Video Editor, Curvable Motion, Remotion Playground, and Tabler Icons
  are visual references or source assets, not automatically direct insertable
  assets.
- Keep the MOTION 124-Card system and VIDEO-SHOTCRAFT's 124-card system
  separate. Their IDs, card names, and style keys are not interchangeable.
- A statement that Codex will actively check and adapt the selected asset, but
  will not force an incompatible effect.

Prefer `implemented` Cards for direct application. An `available` or pending
Card, a motion-prompt reference, or a Remotion Scenes example may be rebuilt
only when the selected template supports the motion idea. Never claim a
reference was inserted directly into the `.motion` package.

## If no revision is requested

- Treat `不需要替换` as the canonical answer and record that the user declined
  effects replacement. Accept an unambiguous natural-language equivalent too.
- Continue final validation and delivery.
- Do not ask again for the same final version.

## If a revision is requested

1. Record the target scene or timecode, requested usage part, and selected
   library and ID.
   If the user used plain language, restate the inferred mapping before
   changing anything.
2. Read `src/motion/motion-catalog.json` for a CARD, the Kitbitz manifest and
   SVG for a Kitbitz asset, the current motion-prompt catalog and numbered entry
   for motion-prompt, the current manifest for Meta Open Sound or UI SFX, and
   `src/Root.tsx` plus the selected `src/scenes/<Category>/` entry for Remotion
   Scenes, `src/index.ts` and the selected component under
   `src/components/` for Curvable Motion, and `src/Root.jsx` plus the selected
   file under `src/compositions/` for Remotion Playground. For Tabler Icons,
   verify the exact icon name in the local inventory or official gallery. For
   React Video Editor, read only the editor UI component and app page. Confirm
   availability, license, and adaptation status before use.
   For VIDEO-SHOTCRAFT, read `gallery/api/library.json`, the exact card document,
   and the demo source named by that document. For `INK-PRESS`, also read
   `template/TEMPLATE.md`.
3. Check whether the selected template can support the requested change.
4. Keep the selected template and unaffected scenes locked.
5. If the revision needs a new or replacement picture, search only the material
   libraries relevant to that scene. If no suitable entry exists, stop that
   picture and ask the user for the missing library or source assets. Do not use
   a description, placeholder, template example, or self-generated picture
   unless the user explicitly says no material will be provided or explicitly
   authorizes generation.
6. Rebuild only the requested visual part.
7. Keep approved narration, subtitles, output language, and timing unless the
   requested effect necessarily changes them. Burned subtitles remain one
   complete reading clause per single-line cue with no character reveal or
   karaoke; comma-delimited sequential cues are allowed.
    If any text, audio, or scene timing changes, rebuild the affected sentence
    and visual-group boundaries, recheck that every source sentence uses at most
    three subtitle cues and every group stays within three consecutive canonical
    sentences.
8. Regenerate the affected timeline keyframes and wait for `确认关键帧`.
9. Run the feedback gate from `visual-feedback.md`, including the option to
   provide a reference video or image plus a simple description.
10. Re-render the complete final MP4 as a new version after `确认关键帧`.
11. Preserve the previous final render.
12. Re-run final validation and this post-render review gate.
13. Update `方案/视觉元素匹配与重复率.md` and verify the latest template-fixed
    result is still no more than 50%, the editable `(T - D) / T` result is still
    no more than 30%, and the picture-transition `Q / U / (Q - U) / Q` result is
    still no more than 20%. Also verify complex-transition `C` is no more than
    `floor(Q × 10%)`, every standard non-hard-cut transition is no longer than
    0.5 seconds, every complex transition is no longer than 0.8 seconds, and
    every transition has a matched SFX cue. Confirm every non-hard-cut
    transition is smooth with coordinated easing. Confirm every fade or
    crossfade contains both its fade-out and fade-in.
14. Verify burned subtitles show one complete reading clause per single-line cue
    with no character reveal or karaoke, no later cue appears early, each source
    sentence uses at most three subtitle cues, long-sentence visual groups remain
    strictly serial, and no visual group exceeds three consecutive canonical
    sentences. No scene or visual group may contain only a script fragment below
    five visible characters. Multi-stage B-ROLL graphic text enters one semantic
    line or phrase at a time in source order, without showing later wording early.

If the selected library entry or template cannot support the request, do not
force the asset. Report the exact blocker and recommend one or more actual
alternatives that fit the requested intent. Ask:

> 需要替换请回复“需要替换”，并写明替代素材库和 ID；不需要替换请回复“不需要替换”。

Do not fake the effect or silently change templates.

## Review limits

- Show and obtain `确认关键帧` for the revised keyframes before each full
  rerender.
- Never overwrite the previously approved final version.
- Allow at most five effects-revision rounds.
- Before a sixth round, ask the user whether to continue.

## Project record

When a material revision is used, save the project record to
`方案/Card修改记录.md` containing:

- Original final version.
- Target scene and timecode.
- Requested usage part.
- Selected library, ID, cue, or motion-prompt number and implementation status.
- Relevant libraries checked, actual matching IDs or no-match results, the
  user-material request and response, and any AI-generation authorization.
- For VIDEO-SHOTCRAFT, the card name, style key, demo path, target ratio, and
  license status. `INK-PRESS` is valid only at native 16:9.
- For Tabler Icons, the verified icon name, target scene, editable B-ROLL usage,
  license, and final-size legibility.
- Adaptation result and alternative suggestions when incompatible.
- What was rebuilt.
- Revised timeline-keyframe path and `确认关键帧` response.
- User feedback and reference media paths.
- User approval.
- Re-rendered final path.
- Unchanged audio, subtitle, and language checks.
- Sentence and visual-group timing result, subtitle single-line and non-reveal
  result, every source sentence's one-to-three-cue result, every group's sentence
  count and three-sentence maximum result, and the sub-five-visible-character
  merge result.
- Updated visual asset mapping, template-fixed repetition result, editable
  `T / D / (T - D) / T` result, and picture-transition
  `Q / U / (Q - U) / Q` result, each with pass or fail.
- For every changed or added transition: source library, asset or Card ID when
  applicable, transition method, duration, standard/complex classification,
  SFX cue, coordinated easing treatment, and fade-out/fade-in pairing when
  applicable. A fade or crossfade with only one half is invalid. Hard cuts
  still need the sound cue unless the user requested silence.
- Updated `Q`, `U`, `C`, `floor(Q × 10%)`, and pass or fail results for the
  transition repetition and complex-transition limits.

