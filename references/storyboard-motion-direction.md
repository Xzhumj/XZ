# Storyboard Motion Direction

Read this reference before planning or building any script-and-storyboard direct
production.

## Authority and responsibility

The script and storyboard express creative intent; they are not an execution
timeline. The user is responsible for supplying the content, visual direction,
and any action that is essential to the meaning. The production side is
responsible for translating that intent into complete, timed motion.

Use this authority order:

1. The user's explicit instructions for the current video.
2. The script for narration, spoken content, visible text, wording, and order.
3. The storyboard for scene count, scene order, framing, composition, camera
   intent, visual emphasis, and visual sequence.
4. The motion treatment authored for the approved scene.

Do not require the user to write keyframes, code, HTML, SVG, Canvas, Three.js,
shader code, element-by-element instructions, or a complete animation timeline.
Ordinary motion design is part of production work.

The motion treatment may add internal action that makes the approved scene feel
complete. It may not change the approved scene count, order, framing,
composition, subject, narrative meaning, source assets, or continuity without
user approval.

Ask the user only when missing information would materially change the result:

- the action changes what the narration means;
- the action changes the subject, source material, or story continuity;
- the scene needs a layered source or independent assets that the user must
  provide;
- the requested action would make subtitles or essential content unreadable;
- the choice would require AI generation or another new source asset.

Do not ask the user to resolve ordinary staging choices that can be inferred
from the script, storyboard, and approved visual direction.

## Build the scene motion treatment

For every scene, define the following before choosing the production medium:

- **Narrative action**: the one visible event the audience must understand.
- **Primary mover**: the element that carries that action.
- **Supporting movers**: elements that explain, react, emphasize, or continue
  the primary action.
- **Static anchors**: important elements that should remain still so the scene
  does not become visual noise.
- **Camera motion**: any approved push, pull, pan, orbit, parallax, or
  perspective change.
- **Object motion**: movement, scale, rotation, shape, opacity, mask, reveal, or
  material change inside the frame.
- **Start and end states**: a legible state before the action and a resolved
  state after it.
- **Order and timing**: what starts first, what follows, when the action begins,
  how long it lasts, and when it settles.
- **Easing and weight**: acceleration, deceleration, overshoot, impact, drag,
  follow-through, and any restrained motion that should remain calm.
- **Layer order**: what moves in front of, behind, or independently from other
  elements.
- **Transition**: how this scene hands off to the next without losing the
  storyboard's composition or visual sequence.

The motion treatment must connect to the narration. Start the meaningful action
on the relevant phrase or semantic beat, let the result remain long enough to
read, and avoid animating later visual information early.

Use staggered entrances, exits, and reactions when the scene contains multiple
elements. Do not move every element as one block unless the storyboard
explicitly calls for a coordinated group action.

Keep intentional stillness. A stable background, face, product, or key sentence
may be the anchor that makes the primary movement legible.

## Required internal motion

A whole-frame zoom, pan, slide, fade, blur, or camera push is camera treatment.
It is not a substitute for an internal action required by the storyboard.

For example, when the approved meaning is that a card opens, a line draws, a
check mark confirms, a crack spreads, a person moves, or data changes, those
events must be visibly authored inside the frame. A slow push on the entire
picture does not satisfy that requirement.

Use separate element motion when the storyboard or narration establishes
separate subjects, actions, or stages. Use a single coordinated motion only when
the approved visual idea is genuinely one object or one group action.

## Production-medium selection

Choose the simplest medium that fully realizes the approved motion:

- **HTML**: simple layouts, typography, cards, photographs, layered UI,
  readable reveals, and ordinary two-dimensional motion.
- **SVG**: editable vectors, icons, lines, paths, masks, diagrams, charts, and
  precise shape or path animation.
- **Canvas**: pixel drawing, particles, procedural graphics, dense
  two-dimensional motion, and effects that would be impractical as individual
  DOM elements.
- **Three.js**: 2.5D depth, 3D scenes, perspective, parallax, camera travel,
  layer separation, spatial transitions, and controlled object motion in depth.
- **Blender**: material, lighting, texture, reflection, physical realism, and
  rendered assets or animation that the web media cannot achieve convincingly.
- **WebGL**: custom graphics buffers, procedural rendering, and real-time GPU
  work that does not fit cleanly in ordinary HTML, SVG, Canvas 2D, or standard
  Three.js.
- **Vertex shader**: per-vertex deformation, waves, morphs, displacement,
  particle geometry, and camera-space effects.
- **Fragment shader**: per-pixel color, texture, mask, light, noise, dissolve,
  distortion, and procedural material effects.

Use Three.js when the scene specifically needs 3D or 2.5D spatial treatment, not
merely because the scene is complex. Use WebGL directly only when the picture
needs a custom graphics pipeline. Use a shader only when the approved motion or
material genuinely needs shader work.

Media may be combined within one scene. A typical combination can use HTML for
layout and typography, SVG for a precise path, and Three.js for depth or camera
travel. Record the actual medium for each visual treatment and the role of any
Blender render or shader.

Material libraries provide content, references, and assets. They do not decide
the production medium. A preview, GIF, MP4, or demo is not automatically an
editable element; use it directly only when the selected workflow supports that
use or the user explicitly approves it.

## Flat or incomplete storyboard pictures

A single flat raster image has no independently movable internal objects. When
the required motion needs separate elements, first determine whether the
approved storyboard can be faithfully rebuilt as a layered presentation without
changing its content.

- Rebuild editable typography, cards, shapes, arrows, paths, diagrams, masking,
  and other presentation layers when that preserves the approved composition.
- Keep the original source image and record which layers were rebuilt.
- Use independent source assets for subjects or objects that must remain
  faithful and cannot be reconstructed safely.
- If the scene cannot be faithfully separated, request the layered source,
  project file, or independent assets from the user. State the exact scene or
  timecode and the missing layer or object.

Do not use whole-frame motion as a workaround and then claim that the internal
storyboard action was delivered. Do not treat permission to add motion as
permission to replace the approved subject or generate a new scene artwork.
New subject artwork still follows the skill's visual-source and authorization
rules.

## Review before rendering

During the production plan and keyframe or DEMO review, show the authored action
in plain language:

- which element carries the primary action;
- what the element does from start to finish;
- what supporting elements respond;
- what remains still;
- when the action aligns with narration;
- how the scene transitions;
- which medium implements it;
- how a flat source will be layered or why user-provided layers are required.

Before final delivery, verify that every required internal action is visible in
the rendered result. A still image with a whole-frame camera move, a generic
fade, or a decorative transition does not pass. If an action cannot be authored
faithfully, report the exact missing layer, asset, or capability and keep the
scene blocked instead of claiming completion.
