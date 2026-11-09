# Visual Asset Selection and Repetition

Use this reference whenever a video contains visual making: scene graphics,
objects, icons, cards, UI treatments, text components, transitions, camera
effects, emphasis, or endings.

## Asset roots and relative locators

All paths in this reference are relative to a named root. Resolve the root for
the current machine, then open or quote only the relative locator. Do not copy a
machine-specific absolute path into the skill or a project plan.

Resolve roots in this order:

1. CARD: the valid Motion template library root selected by `SKILL.md`.
2. Kitbitz: `KITBITZ_ASSET_ROOT`; otherwise the asset root recorded in
   `创作偏好.md`; otherwise ask once for the Kitbitz folder.
3. Meta Open Sound and UI SFX: the Codex skills root, `$CODEX_HOME/skills`, or
   `~/.codex/skills` when `CODEX_HOME` is unset.
4. motion-prompt: the source root or cache directory reported by the installed
   `motion-prompt` helper. Run its `info` command before resolving the root.
   A source root contains `catalog.json`, `en/e/<NNN>.txt`, `ja/e/<NNN>.txt`,
   and `kit/<pack>.js`. A cache root is `$MOTION_PROMPT_CACHE`, or
   `~/.cache/motion-prompt` when the variable is unset. Use whichever source
   the helper reports as active.
5. React Video Editor: `REACT_VIDEO_EDITOR_ROOT`, then the source root recorded
   in `创作偏好.md`, then ask once for the local source folder. Verify
   `README.md`, `package.json`, `components/react-video-editor.tsx`, and
   `app/page.tsx` before using it.
6. Remotion Scenes: `REMOTION_SCENES_ROOT`, then the source root recorded in
   `创作偏好.md`, then ask once for a local source clone. Verify
   `src/Root.tsx` and `src/scenes/` before using it.
7. Curvable Motion: `CURVABLE_MOTION_ROOT`, then the source root recorded in
   `创作偏好.md`, then ask once for the local source folder. Verify
   `src/index.ts`, `src/components/`, and `previews/` before using it.
8. Remotion Playground: `REMOTION_PLAYGROUND_ROOT`, then the source root
   recorded in `创作偏好.md`, then ask once for the local source folder.
   Verify `src/Root.jsx` and `src/compositions/` before using it.
9. Tabler Icons: `TABLER_ICONS_ROOT`, then the local icon root recorded in
   `创作偏好.md`. If neither exists, use the official online gallery and verify
   the exact icon name before selection. Never invent or guess an icon name.
10. VIDEO-SHOTCRAFT: the skill-relative root
    `assets/vendor/video-shotcraft`. Read `gallery/api/library.json` as the
    current inventory and `template/TEMPLATE.md` for INK-PRESS. Do not infer a
    card implementation from its name.
11. SHOWREEL-43: the skill-relative root `assets/showreel-43/preview`. Read
    `data/catalog.json` as the inventory and `references/showreel-43/` for each
    selected style's production rules.

| Library | Relative local locator | Current online list or gallery |
| --- | --- | --- |
| CARD | `CARD_LIST.md`; `gallery/index.html`; `src/motion/motion-catalog.json` | The Motion library's own local gallery is the inventory source. |
| Kitbitz | `Kitbitz画廊.html`; `Kitbitz清单.md`; `manifest.csv` | The resolved Kitbitz folder's local gallery and manifest are the inventory source. |
| Meta Open Sound | `meta-open-sound/SKILL.md`; `meta-open-sound/scripts/find-meta-sfx.ps1`; `meta-open-sound/scripts/download-meta-sfx.ps1` | <https://github.com/facebookincubator/Meta-open-sound> |
| UI SFX | `uisfx/SKILL.md`; `uisfx/manifest.json` under the project's installed package when present | <https://github.com/romainsimon/uisfx> and <https://raw.githubusercontent.com/romainsimon/uisfx/main/packages/uisfx/manifest.json> |
| motion-prompt | source or cache root `catalog.json`; `en/e/<NNN>.txt` or `ja/e/<NNN>.txt`; `kit/<pack>.js`; installed helper `motion-prompt/scripts/motion-prompt.mjs` | <https://showheyohtaki.github.io/motion-prompt/> and <https://showheyohtaki.github.io/motion-prompt/api/v1/> |
| React Video Editor | `README.md`; `package.json`; `components/react-video-editor.tsx`; `types/types.ts`; `app/page.tsx` | <https://github.com/reactvideoeditor/free-react-video-editor> and <https://www.reactvideoeditor.com/open-source> |
| Remotion Scenes | `src/Root.tsx`; `src/scenes/<Category>/` | <https://lifeprompt-team.github.io/remotion-scenes/> and <https://github.com/lifeprompt-team/remotion-scenes> |
| Curvable Motion | `src/index.ts`; `src/components/<component>.tsx`; `previews/<component>.gif` | <https://curvable.ai/library> and <https://github.com/Curvable/motion> |
| Remotion Playground | `README.md`; `src/Root.jsx`; `src/compositions/<Category>/<File>` | <https://github.com/jessai2026/remotion-playground>. No public gallery is verified; read the local `src/Root.jsx` for the actual Composition IDs. |
| Tabler Icons | Local SVG icon files plus the current manifest or generated inventory | <https://tabler.io/icons> and <https://github.com/tabler/tabler-icons> |
| VIDEO-SHOTCRAFT | `references/video-shotcraft.md`; `gallery/library.html`; `gallery/api/library.json`; `template/TEMPLATE.md`; exact card document and demo path | <https://vincentwei1021.github.io/video-shotcraft/> |
| SHOWREEL-43 | `references/showreel-43.md`; `references/showreel-43/INDEX.md`; `assets/showreel-43/preview/data/catalog.json`; `gallery.html`; exact style document and 5-second preview | The local gallery is the verified inventory and preview source. |
| Pexels B-ROLL photos | Project-local downloaded image files plus the source record in `方案/视觉元素匹配与重复率.md` | <https://www.pexels.com/zh-cn/> |

The Kitbitz `manifest.csv` is the source of truth for its current inventory.
The motion-prompt `catalog.json` is the source of truth for its current
inventory and version. Do not assume an item exists only because an older count
or category list says so.

Use the current local Tabler inventory or official gallery as the source of
truth for icon names. The official gallery and repository currently identify
the icon set as MIT-licensed; re-check the license and icon name before use.
Do not treat an older count, version, or remembered icon name as permanent.

The additional sources have distinct roles and limits:

- React Video Editor is an editor application, not a drop-in animation
  catalog. Use it only as a visual reference for editor UI, timelines, panels,
  controls, and editing interactions. Its README names the RVE Pro license and
  says commercial use also requires a Remotion license, while its root
  [`LICENSE.md`](https://github.com/reactvideoeditor/free-react-video-editor/blob/main/LICENSE.md)
  is an MIT template with a placeholder copyright holder. Treat the license as
  unresolved: do not copy or redistribute its code or assets for commercial
  work until the user confirms permission. Do not claim it can be inserted
  directly into a `.motion` package.
- Remotion Scenes is an MIT-licensed Remotion scene collection. Its README says
  201+ scenes, but `src/Root.tsx` and `src/scenes/` are the current inventory.
  Use it for scene, layout, camera, transition, text, UI, data, particle, and
  branding references; rebuild the selected idea in a Remotion-capable
  workspace.
- Curvable Motion is the MIT-licensed `@curvable/motion` package with 14
  Remotion components. Use `src/index.ts`, `src/components/`, and `previews/`
  as the inventory for text, background, and composite-scene references. Some
  components have optional `ogl`, Google Fonts, or CanvasKit requirements.
  Integrate or rebuild it in a Remotion-capable workspace.
- Remotion Playground is a Remotion study project. Use `src/Root.jsx` as the
  actual Composition ID list and `src/compositions/` as the source. The README
  count may be stale: the local project can register more compositions than the
  README describes. Its `LICENSE` is MIT but `package.json` says ISC, so treat
  the license metadata as conflicting and require rights confirmation before
  commercial redistribution or code reuse.
- VIDEO-SHOTCRAFT is the bundled third template and material library. It
  contains one complete template (`INK-PRESS`), 124 cards, 150 styles, and 10
  categories. Read the exact card document and its specified demo source before
  adaptation. Record card name, style key, demo path, ratio, and license.
  `INK-PRESS` is native 16:9 only.
- SHOWREEL-43 is the bundled fourth template library. It contains 43
  independently selectable styles. Read the selected style document before
  adaptation. Its local 5-second previews use code-rendered visual equivalents;
  they verify visual direction and motion, not final production fidelity. Do
  not claim p5.js, PixiJS, or Manim are installed. When a selected style's
  preferred renderer is unavailable, use the equivalent route declared in its
  style document or ask before installing a new runtime.

None of these additional sources is a direct `.motion` package asset. Any
insertion must happen through the selected template's declared workflow or a
rebuild in a supported workspace.

Tabler Icons is an SVG icon source for editable B-ROLL. Use it only when the
source text explicitly names a clear object, action, or concept and a matching
icon improves comprehension. Verify the exact icon name, style consistency,
license, and final-size legibility. Preserve fixed template graphics and
branding. An online icon is a source asset, not an already-inserted project
asset; use it only after a supported workflow imports, downloads, or rebuilds
it.

Pexels is a separate optional source of real photographic B-ROLL. It is not one
of the eleven animation and material libraries and does not determine the HTML,
SVG, Canvas, Three.js, Blender, WebGL, vertex-shader, or fragment-shader
production medium.

Do not discover or validate every material library before production. Whenever
a scene first needs a new picture, however, checking and searching the material
libraries relevant to that scene is mandatory. Search the relevant libraries
for a verified asset that can complete the required picture. A scene may need
more than one relevant library, for example a scene illustration, a motion
reference, and a transition reference.

Resolve picture sources in this order:

1. Follow an explicit user-selected asset, source, or treatment for the scene.
2. Search only the material libraries that the scene actually needs and use a
   verified directly compatible or adaptable entry that completes the picture.
3. If no relevant library is available or no suitable entry exists, stop that
   picture and ask the user to provide the missing library or source assets.
4. Only after the user explicitly says they cannot provide the material or
   explicitly authorizes AI generation for that scene may Codex generate the
   picture. Silence is not approval.

Do not use a verbal description, placeholder, template-bundled example, or a
self-generated picture to bypass step 2 or step 3. For a sound cue, resolve only
its relevant sound library. If that sound library is unavailable, ask the user
for a local sound folder, package, accessible inventory, or concrete sound
treatment. The visual-source approval rule does not change this audio rule.
Never invent an ID, scene, preview, or license status.

For each scene or cue, record one main source type: explicit user-selected
asset, verified template library, verified material library, user-supplied
source asset or storyboard, or AI-generated picture with recorded authorization.
A scene may also use a downloaded Pexels photo as photographic B-ROLL content
when that verified real photo is the appropriate existing source and improves
the current sentence's visual accuracy. The available material sources are:

- CARD: motion, transitions, UI behavior, data displays, camera, typography,
  images, entrances, exits, and effect ideas.
- Kitbitz: object, icon, and scene illustrations that explain the script.
- Meta Open Sound: realistic recorded foley, ambience, materials, objects,
  actions, entrances, and transitions.
- UI SFX: designed clicks, switches, successes, warnings, loading states,
  interface transitions, entrances, and exits.
- motion-prompt: the numbered `#001-#192` catalog for motion, animation,
  entrances, exits, transitions, camera language, UI behavior, web effects,
  images, lighting, and photo-look references. This is an asset catalog, not a
  skill dependency.
- React Video Editor: editor-interface, timeline, panel, control, and editing
  interaction references only.
- Remotion Scenes: scene, layout, entrance, exit, transition, camera, text, UI,
  data, particle, background, and editorial-pacing references.
- Curvable Motion: text, background, and composite-scene references from the 14
  components listed by `src/index.ts` and `previews/`.
- Remotion Playground: Composition-level references from the current
  `src/Root.jsx`, including text, transitions, data visualization, 3D,
  audio-reactive, particle, loading, text-effect, media, and promotional scenes.
- Tabler Icons: verified SVG icons for clear objects, actions, and concepts in
  editable B-ROLL. Do not use vague decorative icons or guess icon names.
- VIDEO-SHOTCRAFT: exact cards, styles, components, textures, and audio for
  reusable shot language, transitions, typography, UI, data, camera, effects,
  rhythm, opening, and ending treatments. Keep its card names and style keys
  separate from MOTION Card IDs.

The motion-prompt catalog currently has eight packs of 24 entries:

```text
motion    #001-#024
camera    #025-#048
ui        #049-#072
lp        #073-#096
photo     #097-#120
motion2   #121-#144
lp2       #145-#168
camera2   #169-#192
```

Read the current catalog before selecting an entry. The catalog may contain all
192 entries while individual element text files are cached on demand; fetch a
missing element from the current API or GitHub fallback and verify its ID.

For Meta Open Sound and UI SFX, read the installed source and current manifest
before selecting an entry. Do not guess pack names, cue names, filenames, or
asset IDs. The local supplemental SFX index may be used after the same
verification.

## Script and storyboard direct production

When a video-production script and storyboard images are supplied together:

1. Use the script for narration, spoken content, visible text, wording, and
   order.
2. Use the storyboard for scene count, scene order, framing, composition, camera
   intent, and visual sequence.
3. Do not select, recommend, match, or apply a MOTION `.motion` template,
   Lemo-Opuscar style, or VIDEO-SHOTCRAFT template. Do not replace a supplied
   scene with a template layout.
4. Stop and ask which version is authoritative if script and storyboard
   conflict on wording, order, scene ownership, or visible claims.
5. Build each supplied scene with relevant verified entries from CARD, Kitbitz,
   Meta Open Sound, UI SFX, motion-prompt, React Video Editor, Remotion Scenes,
   Curvable Motion, Remotion Playground, Tabler Icons, and VIDEO-SHOTCRAFT.
   These libraries supply animation, motion, picture elements, graphics, icons,
   sound, transitions, and camera language; they do not replace the storyboard
   structure.
6. Do not run a separate all-library material-selection gate before the
   production plan. For a material-library entry, state its ID, visible image or
   animation, entrance, exit, camera language, sound purpose, time range, and
   compatibility result. If no compatible entry exists, keep the required
   storyboard scene, record the exact missing picture, and request the relevant
   user-supplied library or source asset. Do not substitute a template,
   description, or placeholder.
7. When a step actually needs a material library, check only that library. If it
   is unavailable, ask the user to provide its local folder, package,
   accessible inventory, or source asset. For a sound cue, a concrete sound
   treatment may be accepted when no sound library is available. For a picture,
   AI generation remains blocked until the user explicitly says no material
   will be provided or explicitly authorizes generation.
- Do not force incompatibly shaped motion, text, or sound into a supplied
  storyboard. Report the blocker and propose an actual alternative.

## Standalone opening

When the user chooses `我来选开头` or `AI匹配开头`, the selected template, a
verified material-library entry, or a user-supplied source asset may supply the
opening's visual, motion, graphic, transition, and sound treatment. The
canonical source supplies the words, not the opening's audiovisual design.

For script-and-storyboard direct production, the selected template is not
available. Use the supplied storyboard and the eleven material libraries, and
keep the supplied opening structure when the storyboard defines one.

- For `我来选开头`, provide the gallery, list, or manifest for sources the user
  asks to browse. Do not pre-check every material library. Accept a library ID,
  scene name, or user-supplied asset. A plain-language description may refine an
  approved source but does not replace a required missing picture source.
- For `AI匹配开头`, give a concrete source-by-source treatment based on the
  title, opening source line, theme, tone, ratio, and selected template. Include
  real IDs and compatibility results for library entries, make non-library
  sources explicit, and include the exact source range and planned 5-10 second
  duration. If a required picture has no usable source, request user material
  instead of proposing a placeholder or self-generated replacement.
- Use a continuous passage from the beginning of the canonical source. Keep
  burned subtitles to one complete reading clause per single-line cue with no
  character reveal or karaoke. Do not invent, rewrite, delete, or reorder
  narration, titles, claims, labels, or other semantic copy.
- Build a real opening sample before body production. Show the actual selected
  visual treatment, sound accents, source words, subtitle treatment, and output
  language. Label every library entry or user-supplied source asset by its
  source type. Record any AI-generated opening picture with its explicit user
  authorization, target scene or timecode, and generated-file path.
  A still image, unrelated template demo, or invented title is not an opening
  sample.
- Wait for `确认开头` before building the body. If the user replies
  `需要修改开头`, revise the opening sample and wait again.
- After `确认开头`, mark the opening source segment IDs and SRT cues as
  consumed. The body begins at the first unconsumed source segment and must not
  repeat the opening words or captions.
- If the exact passage cannot fit in 5-10 seconds, use only the permitted minor
  speed, breath, or silent-gap adjustments. Then propose another continuous
  source passage or request explicit approval of a different duration. Never
  truncate or rewrite the words.
- Rebuild combined subtitle timing after the opening split or any permitted
  timing adjustment.
- Preserve the template's fixed structure, safe area, subtitles, source order,
  and output language. If either source cannot be adapted, say which part is
  blocked and propose a compatible alternative.

Every opening treatment from CARD, Kitbitz, motion-prompt, Remotion Scenes,
React Video Editor, Curvable Motion, Remotion Playground, or Tabler Icons that
is added or replaced counts as an editable visual slot in the whole-video
repetition audit.
Picture transitions use the separate transition audit below instead of the
visual-slot calculation.
Sound selections do not count as visual slots.

## B-ROLL color

Apply this section only to editable B-ROLL color, including backgrounds,
surfaces, graphic fills, borders, and accents. Burned subtitles, fixed template
colors, and branding keep their existing rules.

1. [Color Hunt](https://colorhunt.co/) is an approved direct-use source for free
   color palettes. Match a palette to the approved scene's meaning, tone,
   contrast requirements, and visual style.
2. The complete video may use at most three distinct Color Hunt palettes in
   total. This is a whole-video limit, not three palettes per scene.
3. Identify a palette by its unique Color Hunt URL or ID and exact color set.
   Reusing that same palette in multiple assigned scenes counts as one palette.
   Do not create near-duplicate variants merely to avoid the three-palette cap.
4. Preserve readable contrast between text, graphics, surfaces, and backgrounds
   at final output size. Do not apply a palette when it reduces legibility.
5. Preserve fixed template colors, protected structure, branding, and required
   slots. Use Color Hunt only where the workflow marks the B-ROLL color as
   editable.
6. A color-palette choice does not create a new visual asset and does not
   override the editable-visual repetition audit. Record the palette in the
   affected scenes' visual combination records.
7. Record each palette's Color Hunt URL or ID, exact color values, assigned
   scenes, and final-size contrast result in
   `方案/视觉元素匹配与重复率.md`. Also record the whole-video palette count;
   more than three fails the plan.

## B-ROLL typography

Apply this section only to editable B-ROLL text, including titles, emphasis
words, and key phrases. Burned subtitles, SRT, and ASS follow the subtitle rules
in `SKILL.md`.

1. Derive the type treatment from the approved scene's meaning, tone, visual
   style, and reading priority. Do not accept a template default when the
   B-ROLL typography is editable.
2. Select a font only from a verified material-library font or typography
   entry, or from [Google Fonts](https://fonts.google.com/). Compare candidates
   against the approved content, tone, and visual style.
3. Accept a candidate only when its actual font file is free or open-source for
   the intended use and the production path can load that file. Do not infer
   licensing from appearance, a gallery screenshot, or the font name.
4. Verify coverage against the exact text that will be rendered, including
   Chinese characters, Latin letters, numbers, punctuation, and symbols. Check
   the actual font file or a rendered sample, not only the gallery preview.
5. Select a typeface that is appropriate, attractive, and legible at the final
   screen size. Decorative faces may be used only where readability and the
   approved visual direction remain intact.
6. If neither source provides a suitable free font with complete coverage, stop
   and report the coverage gap. Never render tofu, missing glyphs, or silently
   substitute a different font while claiming it is the approved choice.
7. Record the font family; material-library root and relative locator or Google
   Fonts URL; license evidence; coverage result; target scenes; and final-size
   legibility result in `方案/视觉元素匹配与重复率.md`.
8. Preserve fixed template typography, branding, required text slots, canonical
   wording, and the sentence and visual-group timing. Font selection changes
   appearance only where the workflow marks the B-ROLL typography as editable.

## Pexels B-ROLL photos

Use [Pexels Chinese site](https://www.pexels.com/zh-cn/) when a real photograph
can make the current canonical sentence or visual group more accurate and
concrete. Do not add a photo only because it looks attractive or broadly
related. It must explain the current people, action, object, place, scene, or
emotion without adding a new claim.

Before searching, derive the photographic intent from the current canonical
text and approved visual direction. Record the required subject, action,
object, setting, mood, orientation, crop, and framing.

For each candidate, check:

- factual and semantic fit to the exact sentence or visual group;
- subject clarity, anatomy, and completeness after the planned crop;
- resolution and image quality at the final output size;
- landscape or portrait suitability for the approved frame;
- subtitle safe area and A-ROLL visibility;
- whether the photo would cover the A-ROLL person in the selected layout mode;
- the current Pexels license and the image page's author or attribution
  requirements.

Do not infer the license, author, image ID, or visual content from a thumbnail,
search result, cached summary, or memory. The current image page and Pexels
license are the sources to verify.

After selection:

1. Download the image to the project's local asset folder and preserve the
   original file. Never make the final render depend on a remote image URL.
2. Record the Pexels page URL, image ID, author or attribution as shown,
   download date, license check date and result, target scene or timecode,
   source sentence and visual purpose, crop or fit, subtitle and A-ROLL
   safe-area result, local asset path, and selected production medium in
   `方案/视觉元素匹配与重复率.md`.
3. Use the downloaded photo as content within the production medium selected for
   the picture. A Pexels photo may remain static or receive an approved camera
   move, mask, compositing treatment, or other animation, but the image source
   does not decide that medium.
4. Re-check the final-size crop, subtitle legibility, and A-ROLL visibility in
   timeline keyframes and final validation.

User-supplied photos, a supplied storyboard, a user-specified A-ROLL
trajectory, and template-protected graphics take precedence over an automatic
Pexels choice. Pexels fills only an editable photographic B-ROLL need; it does
not replace required graphics, icons, motion references, or sound cues from
their verified sources.

If Pexels has no suitable image, the page is inaccessible, or the license or
attribution requirement cannot be verified, search only another material source
that the current scene actually needs. If none has a usable entry, request a
user-supplied library or source asset. Do not substitute a placeholder,
description, or self-generated image without explicit user authorization. Never
guess an image's identity, author, license, or content.

## Selection workflow

1. Split the approved source copy into scenes and identify the main visual
   idea of each scene.
2. For script-and-storyboard production, preserve the supplied scene structure
   and record each scene's explicit user source, verified material-library
   source, pending user-material request, or authorized AI-generated source
   before presenting the production plan. Do not use a template.
3. Only for scenes that call for library material, search the relevant source:
   CARD, motion-prompt, Remotion Scenes, Curvable Motion, or Remotion Playground
   by motion or layout intent; Kitbitz by scene object, setting, or metaphor;
   Meta Open Sound by concrete action or material; UI SFX by interface event or
   transition; Tabler Icons only by an explicit object, action, or concept; and
   React Video Editor only for editor UI, timeline, panel, control, or
   editing-interaction references. When a real photo improves the current
   semantic visual, search Pexels with the recorded photographic intent. If no
   usable source exists, request the relevant user-supplied library or source
   asset before creating the picture. Do not use a description, placeholder,
   template example, or self-generated picture to skip that request.
4. Compare candidates for semantic fit, visual quality, legibility, safe area,
   storyboard compatibility, and license status.
5. For ordinary template-based work, preserve the template's fixed format,
   protected structure, branding, and required content slots.
6. For editable visual slots, prefer the candidate that communicates the text
   more clearly and looks better. In script-and-storyboard direct production,
   prefer candidates that complete the supplied picture without changing its
   framing, composition, or order.
7. Use a CARD, motion-prompt, Remotion Scenes, React Video Editor, Curvable
   Motion, or Remotion Playground reference only when its motion idea can be
   adapted without breaking the template. Use a Kitbitz SVG when it can be
   imported or rebuilt without changing the approved meaning. Use a Tabler
   icon only when its verified name, meaning, style, and size fit the editable
   B-ROLL slot, and only import, download, or rebuild it through a supported
   workflow.
8. Reject any visual treatment that introduces a later source sentence or
   subtitle cue before it begins, splits a source sentence into more than three
   subtitle cues, makes a long sentence's visual groups overlap, puts more than
   three consecutive canonical sentences in one visual group, or gives a scene
   or visual group only a sub-five-visible-character script fragment. Burned
   subtitles show one complete reading clause per single-line cue and never use
   character reveals or karaoke. Sequential semantic-line entrance is allowed
   for multi-stage B-ROLL graphic text within the current sentence when the exact
   source wording and order are preserved and later wording does not appear early.
9. Record the semantic reason and the selected source in
   `方案/视觉元素匹配与重复率.md`.

Do not replace template fixed structure merely to increase a score. Do not add
new claims, labels, logos, or explanatory text through a visual asset. When a
desired asset cannot be adapted, keep a compatible template treatment and
report the blocker instead of forcing the asset.

## Repetition rules

The 30% rule applies to the whole video's added, replaced, or otherwise
editable visual slots. It is an overall aggregate, not a cap that allows one
combination to occupy 30% independently.

Define the audit values:

- `T`: total editable visual slots in the complete video.
- `D`: number of distinct visual combination keys.
- Visual combination key: source library + asset or Card ID + visual style +
  animation method. Picture-transition method is excluded and audited
  separately.

Calculate:

```text
repeatRate = (T - D) / T
```

Require:

```text
repeatRate <= 30%
```

Repeated occurrences are the occurrences after the first occurrence of each
combination. Count slots once even when one slot contains several decorations.

Examples:

- 10 editable slots with 7 distinct combinations: 30% repeated, pass.
- 10 editable slots with 6 distinct combinations: 40% repeated, fail.
- 12 editable slots with 8 distinct combinations: 33.3% repeated, fail; at
  least 9 distinct combinations are required.

When a template is used, its fixed visual content has a separate upper limit of
50%. Apply the same aggregate method to the fixed visual slots that the template
exposes for auditing. This 50% allowance does not relax the 30%
editable-visual limit. Script-and-storyboard direct production has no
template-fixed 50% calculation. Do not combine template-fixed slots and
editable slots into one numerator or denominator.

Sound reuse is not a visual slot. Keep sound cues in the audio cue sheet and do
not add them to the visual `T` or `D` counts.

When fixed-content repetition exceeds 50% and the template allows an editable
overlay to be changed, replace only the excess occurrence with a better
treatment from a verified material library. If the repeated item is protected
fixed structure, report the exact scene and blocker and do not claim that the
visual audit passed.

## Template motion completion

Read `template-motion-direction.md` before planning or executing ordinary
template-based work. The selected template supplies a visual framework and an
execution capability; it does not automatically prove that its titles, cards,
icons, paths, charts, data, people, objects, or layers already have all the
motion required by the content.

For every template scene and editable slot:

1. Record the capability level: `Native motion`, `Editable slot`, `Fixed overlay
   area`, or `Sealed or unsupported`.
2. Use the template's declared native action first.
3. Complete missing internal action inside an editable slot when the selected
   workflow permits it.
4. Use a fixed overlay only when the declared workflow allows that area and the
   protected template remains intact.
5. Report a sealed or unsupported action as blocked instead of simulating it
   with whole-frame movement or a generic transition.

Choose the production medium from the approved picture, not from the easiest
preview. Template-native motion remains first. When the template permits
additional authored content, HTML, SVG, Canvas, Three.js, Blender, WebGL,
vertex shaders, and fragment shaders may complete the action within the
declared boundary. Three.js is for genuine 3D or 2.5D work, WebGL for a custom
graphics pipeline, and shaders only when the motion or material needs them.

Record each scene's capability level, production medium, native-versus-authored
relationship, overlay permission, required internal action, and completion or
blocker status in `方案/视觉元素匹配与重复率.md`. Do not alter the template's
protected layout, branding, native ratio, source wording, scene order, or user
assets. Do not unpack, rewrite, patch, or bypass a sealed `.motion` package.
A preview, GIF, MP4, or demo is a reference or asset unless the selected
template or production medium explicitly declares it directly usable.

## Storyboard-animation production medium

Read `storyboard-motion-direction.md` before planning a script-and-storyboard
scene. The script and storyboard express creative intent; missing ordinary
internal motion is authored by production rather than requested from the user
as keyframes or code.

Choose the medium from the approved picture, not from whichever library item is
easiest to preview:

- HTML for simple layouts, text, cards, images, layers, and basic two-dimensional
  motion.
- SVG for editable vectors, lines, masks, diagrams, charts, icons, and precise
  two-dimensional shape or path animation.
- Canvas for pixel drawing, particles, procedural graphics, and dense complex
  two-dimensional effects.
- Three.js for 3D and 2.5D depth, perspective, parallax, camera travel, and
  spatial transitions.
- Blender for material, lighting, texture, reflection, and physical realism that
  the web media cannot achieve convincingly.
- WebGL for custom graphics buffers, procedural rendering, and real-time GPU
  work beyond ordinary HTML, SVG, Canvas 2D, or standard Three.js use.
- Vertex shader for per-vertex geometry deformation, waves, morphs,
  displacement, particles, or camera-space effects.
- Fragment shader for per-pixel color, texture, mask, light, noise, dissolve,
  distortion, or procedural material effects.

Prefer SVG or Canvas for suitable two-dimensional work. Use HTML when the
picture is simple enough that Canvas or Three.js would add unnecessary
complexity. Use Three.js only when the picture needs 3D or 2.5D treatment.
Use WebGL directly only when the picture needs a custom graphics pipeline. Use a
shader only when the approved motion or material genuinely needs shader work.

Blender may render the complete storyboard-to-storyboard animation or produce
materials, textures, stills, and assets for an HTML, SVG, Canvas, Three.js,
WebGL, vertex-shader, or fragment-shader composition. Record which role it
serves.

A camera move on the whole frame is not a substitute for an internal element
action required by the storyboard. When a flat picture cannot expose the
required separate elements, rebuild editable presentation layers when faithful
or request the missing layered source or independent assets.

Material libraries provide content and references; they do not override the
selected production medium. A library item may be used directly only when it is
already a compatible editable or importable component in the selected medium,
or a declared template-native transition. A preview, GIF, MP4, or demo is a
reference or a possible texture and asset for the selected medium, not
automatically the finished storyboard-to-storyboard animation. An exception is
an approved direct Blender render. Sound libraries remain governed by the sound
selection rules.

Record the production medium, Blender role, source library, asset or Card ID,
and whether the item was directly reused, imported, adapted, rebuilt, or
supplied as an asset.

## Picture-transition design and repetition

A picture transition is the visual change between clips, scenes, or visual
groups. Subtitle changes and element entrance or exit inside one visual group
are not picture transitions.

Every picture transition must have a verified SFX cue matched to the visible
action and transition peak. The cue may use template-native SFX, Meta Open
Sound, UI SFX, or the verified supplemental local index. Record the sound
library, asset ID, cue time, purpose, license, and local path. Do not invent an
asset or add a generic whoosh without a matching visual action.

Every non-hard-cut transition must be smooth and continuous, with coordinated
easing. A fade or crossfade must include both its fade-out and fade-in; never
accept only one half.

- A standard non-hard-cut transition must not exceed 0.5 seconds in total.
- A complex transition may exceed 0.5 seconds only when its visual treatment
  requires it, with a maximum total duration of 0.8 seconds.
- Let `Q` be the total number of picture-transition slots in the complete video,
  including hard cuts. For `C` complex-transition slots, require
  `C <= floor(Q × 10%)`.
- The complex-transition limit is a frequency limit, not part of the 20%
  repetition calculation.

Track picture transitions in their own audit:

- `Q`: total picture-transition slots in the complete video. Count hard cuts as
  transition slots.
- `U`: number of distinct picture-transition keys.
- `C`: number of complex-transition slots.
- Picture-transition key: transition source library + asset or Card ID when
  applicable + production medium + transition method + easing or fade
  treatment. A hard cut uses its own `hard cut` key.

Calculate:

```text
transitionRepeatRate = (Q - U) / Q
```

Require:

```text
transitionRepeatRate <= 20%
C <= floor(Q × 10%)
```

When `Q` is 0, record that the video has no picture transitions and mark the
transition repetition limit as not applicable.

Repeated occurrences are the occurrences after the first occurrence of each
transition key. Count each transition slot once. Do not mix picture-transition
slots into editable-visual `T` or `D`, and do not mix editable-visual slots into
transition `Q` or `U`.

Every non-hard-cut picture transition must be smooth and continuous with
coordinated easing. A fade or crossfade must visually contain both a fade-out
and a fade-in. Do not claim the transition rule passed when only one half of a
fade is present. Hard cuts are instantaneous and do not require transition
easing or paired fades.

Hard cuts still require a matched SFX cue unless the user explicitly requests
silence. Treat the absence of the required transition SFX as an unresolved
blocker rather than an implicit silent default.

Resolve a picture transition in this priority order:

1. Use an existing transition that is already directly compatible with the
   selected medium or the current template.
2. If no suitable transition can be used directly and the approved picture can
   support depth, perspective, parallax, camera travel, or layered-space motion,
   make a 2.5D transition with Three.js.
3. Only when the first two options cannot satisfy the approved visual or
   technical requirement, use visual replication by rebuilding a verified
   reference in the appropriate supported medium.

A direct transition is valid only when its component is compatible with the
selected medium or the current template declares it as a directly executable
native transition. A Three.js 2.5D construction is an authored transition, not
a direct insertion. Record a visual replication as a reproduction, not as a
directly inserted template. In script-and-storyboard direct production,
verified references from any of the eleven material libraries may be used when
they preserve the supplied storyboard's scene count, order, framing,
composition, and visual sequence.

## Required project record

Before plan approval, create `方案/视觉元素匹配与重复率.md` containing:

- The scene map, time range, source meaning, and visual intent.
- The standalone-opening decision and every source type used for its picture,
  motion, transitions, and sound.
- The material libraries checked for every scene, their actual asset IDs when
  found, the no-match result when none was found, and why those libraries were
  relevant.
- Every missing-library or missing-source request, the exact user response, and
  any AI-generation authorization.
- When an opening is used: exact source words, source segment IDs, consumed SRT
  range, target duration, real sample path, `确认开头` result, and the first
  source segment reserved for the body.
- The selected source. Script-and-storyboard direct production uses only the
  supplied storyboard, user-supplied assets, and verified entries from `CARD`,
  `Kitbitz`, `Meta Open Sound`, `UI SFX`, `motion-prompt`,
  `React Video Editor`, `Remotion Scenes`, `Curvable Motion`,
  `Remotion Playground`, `Tabler Icons`, and `VIDEO-SHOTCRAFT`. Ordinary
  template-based work may also use `template`.
- The selected asset, Card, cue, motion-prompt ID, component name, scene name,
  Composition ID, verified Tabler icon name, or VIDEO-SHOTCRAFT card name and
  style key, and whether it is directly supported, imported, downloaded, or
  rebuilt as a visual reference.
- The source project, license or attribution status, and any unresolved
  commercial-use restriction, especially for React Video Editor and Remotion
  Playground.
- For every VIDEO-SHOTCRAFT card or style, its exact card name, style key, demo
  path, target scene, output ratio, and license. `INK-PRESS` must remain 16:9.
- For every Pexels photo, its page URL, image ID, author or attribution as
  shown, download date, license check date and result, target scene or
  timecode, source sentence and visual purpose, crop or fit, subtitle and
  A-ROLL safe-area result, local asset path, and selected production medium.
- The selected sound source, actual pack/cue/asset ID, cue time, visible event,
  license, attribution requirement, and local project path.
- The visual combination key for each editable slot.
- The picture-transition key, target boundary, selected production medium,
  Blender role when applicable, duration, standard or complex classification,
  easing treatment, fade-out/fade-in pairing when applicable, matching SFX cue,
  source ID, and visual-reference adaptation status for every picture
  transition.
- The sentence and visual-group map, including the strict serial order for long
  sentences, the sentence count for every group with no group exceeding three
  consecutive canonical sentences, the one-to-three-cue subtitle split for every
  source sentence, and every sub-five-visible-character fragment merged into
  adjacent content.
- The single-line clause-subtitle check, including confirmation that no
  subtitle uses character reveal or karaoke and that comma-delimited cues are
  sequential.
- Template-fixed repetition values and the 50% result when a template is used.
- Editable-visual `T`, `D`, `repeatRate`, and pass or fail result.
- Picture-transition `Q`, `U`, `transitionRepeatRate`, `C`,
  `floor(Q × 10%)`, and pass or fail result for both the repetition and
  complex-transition limits.
- Any incompatible asset, user-material request and response, authorized AI
  generation, or unresolved blocker.

Update the record when the plan, keyframes, or final version changes.

## Gates

- Plan gate: show the proposed asset matching and repetition result.
- Opening gate: when an opening is selected, present the real opening sample
  and wait for `确认开头`; do not build the body before approval.
- Keyframe gate: confirm that the approved timeline keyframes use the recorded
  assets from the plan, show every final visual treatment, and still meet all
  three repetition limits, including every
  standalone-opening visual slot and every standalone-opening picture-transition
  slot. Confirm every transition duration, transition SFX cue, smooth
  coordinated easing, complete fade-out plus fade-in for every fade or
  crossfade, and the `C <= floor(Q × 10%)` result. Confirm that an opening
  followed by body content does not duplicate source words or SRT cues. When
  Pexels is used, confirm the downloaded photo, final crop, subtitle
  readability, A-ROLL visibility, license record, and selected production
  medium. `确认关键帧` authorizes final rendering after the BGM decision.
- Final gate: recheck the final video against the latest record. If a visual
  or sound change invalidates the keyframes, rebuild the affected keyframes and
  obtain `确认关键帧` before rendering the final video.

Never invent asset IDs, counts, or pass results. The audit must describe the
actual video.
