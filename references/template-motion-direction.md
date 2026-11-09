# Template Motion Direction

Read this reference before planning or executing ordinary template-based work
with MOTION, Lemo-Opuscar, VIDEO-SHOTCRAFT, SHOWREEL-43, or any deliberate
combination of them.

This reference does not apply to script-and-storyboard direct production. That
input mode uses `storyboard-motion-direction.md` and must not apply a template.

## Purpose

A template is a visual framework and an execution capability, not a complete
animation treatment by itself. The canonical content supplies meaning and
timing. The production side is responsible for making the approved scene move
inside the template wherever the selected template's declared workflow allows
editable content or animation.

Do not treat a template as finished merely because it can place a whole scene,
photograph, card, or group of elements on screen. If the selected template can
animate its internal elements, author the missing internal action during
production. Do not ask the user to supply keyframes, code, HTML, SVG, Canvas,
Three.js, WebGL, shader code, or element-by-element instructions for ordinary
motion design.

## Authority and boundaries

Use this authority order:

1. The user's explicit instructions for the current video.
2. The canonical content and approved sentence/visual-group timing.
3. The selected template's fixed visual grammar, protected structure, ratio,
   branding, and declared workflow.
4. The motion treatment authored for each editable scene, slot, card, overlay,
   or transition.

The motion treatment must complete the scene without silently changing:

- the approved template identity or source item;
- the template's protected layout, branding, fixed graphics, or native ratio;
- the canonical text, narration, scene meaning, or source order;
- the approved scene count, ownership, or template-combination role;
- any user-supplied asset or factual claim.

Preserve intentional stillness. A stable face, product, background, title, or
key object can be the anchor that makes the meaningful movement readable.

## Template motion capability map

Before production, classify every selected template scene and every editable
slot into one of these capability levels. Record the level in the production
plan and in `方案/视觉元素匹配与重复率.md`.

| Level | Meaning | Required action |
| --- | --- | --- |
| Native motion | The template exposes a declared parameter, slot, card, or transition that can execute the required action. | Use the native motion first and preserve its timing grammar. |
| Editable slot | The template lets production place and animate approved text, image, card, icon, chart, path, layer, or other content. | Author the element-level motion needed by the content inside that slot. |
| Fixed overlay area | The template remains fixed, but its declared workflow permits an independent overlay in an allowed safe area. | Keep the protected template intact and add only the smallest independent overlay that makes the required action clear. |
| Sealed or unsupported | The required internal layer or action is inaccessible, or the package forbids the change. | Do not fake the action with a whole-frame push, pan, zoom, fade, or unrelated transition. Report the exact limitation and propose a compatible template or an explicitly approved production change. |

Never describe a lower capability level as though it delivered a higher one.
A material preview, GIF, MP4, demo, or screenshot is not proof that the
corresponding internal layers are editable or directly insertable.

## Build the animation inside the template

For every template scene whose content needs motion, define the following
before choosing the production medium:

- **Narrative action**: the visible event the audience must understand from the
  current sentence or visual group.
- **Template motion role**: native motion, editable slot, fixed overlay, or a
  declared template transition.
- **Primary mover**: the element that carries the action.
- **Supporting movers**: elements that react, explain, emphasize, or continue
  the primary action.
- **Static anchors**: elements that should remain still to preserve clarity and
  template identity.
- **Camera motion**: an approved push, pull, pan, orbit, parallax, or
  perspective change, if the template exposes it.
- **Object motion**: internal movement, scale, rotation, shape, opacity, mask,
  reveal, path draw, data change, or material change.
- **Start and end states**: the readable state before the action and the
  resolved state after it.
- **Order and timing**: what starts first, what follows, when the meaningful
  action aligns with the narration, and when it settles.
- **Easing and weight**: acceleration, deceleration, overshoot, impact, drag,
  follow-through, or restrained motion.
- **Layer order**: what moves in front of, behind, or independently from other
  elements inside the template.
- **Transition**: how the scene hands off without breaking the template's
  protected structure or approved scene order.

Animate different editable elements separately when the content establishes
separate subjects, actions, or stages. Stagger entrances, exits, and reactions.
Do not move every element as one block unless the template's native motion
genuinely represents one coordinated group action.

## What counts as completed motion

Whole-frame zoom, pan, slide, fade, blur, camera travel, or a decorative
transition is camera treatment. It does not satisfy an internal action required
by the script, voiceover, content beat, card, chart, or visual concept.

Examples of internal actions that must be authored when they are part of the
approved scene include:

- a title assembling from separate words or lines;
- a card opening, folding, stacking, or changing state;
- an icon drawing, snapping, rotating, or confirming;
- a chart growing, comparing, sorting, or updating;
- a path drawing, branching, or connecting two nodes;
- a product callout revealing one labeled detail at a time;
- a person or object moving independently from the background;
- a multi-layer 2.5D or 3D camera move that creates real spatial separation,
  rather than a flat image being pushed around.

If the selected template has no editable layer for an action, do not claim that
the action was delivered. First check whether the template supports an allowed
independent overlay. Otherwise report the limitation at the exact scene or
timecode and offer a compatible template or an approved production change.

## Production-medium selection

Use the template's native motion first. When the selected workflow permits
additional authored motion, choose the simplest capability that fully realizes
the approved result:

- **HTML**: simple layouts, typography, cards, photographs, layered UI, and
  ordinary two-dimensional motion.
- **SVG**: editable vectors, icons, lines, paths, masks, diagrams, charts, and
  precise shape or path animation.
- **Canvas**: pixel drawing, particles, procedural graphics, dense
  two-dimensional motion, and effects that would be impractical as individual
  DOM elements.
- **Three.js**: 2.5D depth, 3D scenes, perspective, parallax, camera travel,
  layer separation, spatial transitions, and controlled object motion in depth.
- **Blender**: material, lighting, texture, reflection, physical realism, and
  rendered assets or animation that web media cannot achieve convincingly.
- **WebGL**: custom graphics buffers, procedural rendering, and real-time GPU
  work that does not fit cleanly in ordinary HTML, SVG, Canvas 2D, or standard
  Three.js.
- **Vertex shader**: per-vertex deformation, waves, morphs, displacement,
  particle geometry, and camera-space effects.
- **Fragment shader**: per-pixel color, texture, mask, light, noise, dissolve,
  distortion, and procedural material effects.

Use Three.js only when the scene specifically needs 3D or 2.5D spatial
treatment, not merely because the scene is complex. Use WebGL directly only
when the picture needs a custom graphics pipeline. Use a shader only when the
approved motion or material genuinely needs shader work.

Media may be combined within one scene. A typical treatment can use HTML for
template layout, SVG for an editable path, and Three.js for depth or camera
travel. Record the actual medium and the role of any Blender render or shader.

## Template-specific execution

### MOTION `.motion`

- Read `00-START-HERE.md`, `assistant/guide.json`, and the selected package's
  declared parameter and runtime instructions.
- Use only parameters, slots, overlays, and transitions that the package
  declares.
- Treat `.motion` as immutable. Do not unpack, rewrite, patch, or bypass the
  sealed package to invent internal layers.
- If the required motion is not exposed by the package, record it as a sealed
  or unsupported capability and follow the blocker rule above.

### Lemo-Opuscar

- Follow the installed skill, the resolved style's `STYLE.md`, its
  `DIRECTOR.md`, and the technique guidance they require.
- Preserve the selected style's fixed visual grammar while authoring the
  missing internal motion in its approved editable project area.
- Do not turn the style into a generic card deck or replace its motion language
  with unrelated library effects.

### VIDEO-SHOTCRAFT and `INK-PRESS`

- Read the selected card document and every demo source it names before using
  or adapting it.
- Use a card as a directly supported component only when the selected template
  or medium declares that compatibility.
- A card preview is not a ready-made finished animation. If it is a reference,
  rebuild the needed motion inside the supported template or production
  medium.
- Preserve `INK-PRESS` native `16:9` and its fixed paper-and-ink structure.

### SHOWREEL-43

- Read the selected style document and verify its declared ratio, timing, and
  production route before planning.
- Use the style's native motion grammar first. If the style permits authored
  editable content, complete the necessary internal action inside that style.
- Do not use a 5-second preview as proof that the full production workflow
  supports every requested action or ratio.

### Cross-template combinations

- Give every template a role, scene ownership, order, and transition boundary
  in the plan.
- Keep the motion language coherent across the handoff. Do not silently rebuild
  one template's scene inside another unless the approved combination allows
  it.
- Verify that every component renders to the same approved final canvas.

## Flat or incomplete template scenes

A template may place a flat raster picture or a single precomposed scene where
the content needs separate elements. Before treating that scene as complete:

1. Check whether the template exposes independent layers, slots, cards, or
   masks for the required action.
2. Rebuild editable presentation layers when the declared workflow permits and
   the rebuild preserves the approved composition and source content.
3. Use independent approved assets for subjects or objects that cannot be
   reconstructed safely.
4. If the scene cannot be faithfully separated, request the layered source,
   project file, or independent assets from the user and state the exact scene
   or timecode and missing layer.

Do not use a whole-frame motion as a workaround and then claim that the
template's internal action was delivered. A template's fixed picture does not
become editable merely because it can be pushed, panned, or scaled.

## Review and verification

During the plan and keyframe or DEMO review, show the authored action in plain
language for every template scene:

- the template's fixed structure and protected content;
- the capability level of each animated slot;
- what element carries the primary action and what it does from start to finish;
- what supporting elements react;
- what remains still;
- when the action aligns with narration;
- how the scene transitions;
- which declared template feature or production medium implements it;
- whether any limitation prevented an action and what alternative is required.

Before final delivery, verify in the rendered result that:

- every template-native motion used by the plan is actually visible;
- every required internal action is visibly authored inside the scene;
- a whole-frame camera move, generic fade, or unrelated transition was not used
  as a substitute for an internal action;
- the template's protected layout, branding, ratio, and scene role remain
  intact;
- any unsupported action is reported as blocked, not falsely marked complete.

If an action cannot be authored faithfully, keep the affected scene blocked
until the user chooses a compatible template, supplies the missing layers, or
explicitly approves a different production treatment.
