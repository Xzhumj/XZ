# Sound Effect Selection

Use this reference when a video needs sound effects, transitions, UI accents,
impact sounds, or foley.

## Primary sources

Resolve the Codex skills root as `$CODEX_HOME/skills`, or `~/.codex/skills`
when `CODEX_HOME` is unset. Use these relative paths under that root:

```text
meta-open-sound/SKILL.md
meta-open-sound/scripts/find-meta-sfx.ps1
meta-open-sound/scripts/download-meta-sfx.ps1
uisfx/SKILL.md
```

The online inventories are
<https://github.com/facebookincubator/Meta-open-sound> and
<https://github.com/romainsimon/uisfx>. For UI SFX, read the installed
package's `uisfx/manifest.json` when present, or the
[online manifest](https://raw.githubusercontent.com/romainsimon/uisfx/main/packages/uisfx/manifest.json).
The per-scene source and path rules are in
[visual-asset-selection.md](visual-asset-selection.md).

VIDEO-SHOTCRAFT's bundled audio library is an additional material source. Read
its provenance and attribution files before selecting a file:

```text
assets/vendor/video-shotcraft/assets/audio/ATTRIBUTION.md
assets/vendor/video-shotcraft/THIRD-PARTY-NOTICES.md
assets/vendor/video-shotcraft/LICENSE
```

- Meta Open Sound: realistic recorded foley, ambience, materials, objects,
  vehicles, weather, and action sounds.
- UI SFX: designed clicks, switches, successes, warnings, loading states,
  transitions, and other interface cues.
- VIDEO-SHOTCRAFT: its bundled SFX and music only after the selected file passes
  the license checks below.

Read the source skill before use. Search actual entries and never guess a pack,
cue, filename, or asset ID. For Meta Open Sound, retain
`META_OPEN_SOUND_ATTRIBUTION.txt` and carry its CC BY 4.0 credit into the
project. UI SFX audio is CC0; preserve the MIT license only when its runtime code
is copied.

## Supplemental local library

Resolve the toolkit root with:

```bash
node "<skill-dir>/scripts/cli.mjs" paths --json
```

Use the returned `toolkitRoot` and join `sfx/`. An explicit
`MOTION_SFX_LIBRARY_ROOT` takes precedence after its existence is verified.

The curated library may contain:

```text
sfx/
├── ui/
├── transition/
├── impact/
├── text/
├── camera/
├── effects/
├── glitch/
├── film/
├── foley/
├── crowd/
├── riser/
└── _meta/
    ├── sound-index.csv
    ├── sound-index.json
    ├── LIBRARY.md
    ├── excluded-license-uncertain.csv
    └── licenses/
```

If `_meta/sound-index.csv` is missing, continue with Meta Open Sound and UI SFX.
Do not invent local sound entries.

## Selection

1. Inspect the template's native sound effects first.
2. Search Meta Open Sound by the concrete visible action and material.
3. Search the current UI SFX manifest for interface events and transitions.
4. Check VIDEO-SHOTCRAFT's bundled audio and exact attribution record when its
   shot language already supplies a fitting cue.
5. Use the supplemental local index only when the primary sources do not cover
   the event:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/find-sfx.ps1" -Query "whoosh transition" -Limit 10
```

Optional category filter:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/find-sfx.ps1" -Query "click success error" -Category ui -Limit 10
```

6. Review the returned usage, duration, source URL, license, and actual ID.
7. Reject entries listed in `excluded-license-uncertain.csv`.
8. Copy selected audio into the project's own `成片/sfx/` directory.
9. Never make the final project depend on the shared library path.

Use only sounds that have a concrete visual event:

- Button, selection, toggle, or state change.
- Text or number entrance.
- Transition peak.
- Impact or reveal.
- Camera shutter or zoom.
- Paper, typing, or physical object action.
- Countdown, notification, success, or error.

Do not add a sound merely to fill silence.

## Transition cues

Every picture transition needs one verified SFX cue synchronized to its visible
entrance, exit, or transition peak. Use the template's native SFX, Meta Open
Sound, UI SFX, or the supplemental local index according to the action and
style. A hard cut still needs a matching short cue unless the user explicitly
requests silence.

- Standard non-hard-cut transitions must not exceed 0.5 seconds in total.
- Complex transitions may exceed 0.5 seconds only when the visual treatment
  requires it, with a maximum total duration of 0.8 seconds.
- Complex transitions must not exceed `floor(Q × 10%)`, where `Q` is the total
  number of picture-transition slots in the complete video.
- Match the sound peak to the visual contact point. Let a natural tail continue
  only when it does not run across narration or the following key sound.
- If no verified sound fits the transition, report the missing cue and resolve
  it before final rendering; do not reuse an unrelated sound merely to satisfy
  the rule.

## Mix

- Keep one primary sound event per visual action.
- Use roughly 1-3 SFX per 10 seconds as an upper guide, not a quota.
- Keep UI accents short and quiet.
- Duck or lower SFX under speech.
- Avoid stacking multiple whooshes or impacts on the same beat unless the composition explicitly needs a layered hit.
- Check the timeline keyframes and final render for synchronization, masking,
  harshness, and tails that run into the next shot.

## Cue record

Create `sfx-cue-sheet.json` in the output project:

```json
{
  "project": "Project name",
  "license": "Mixed verified licenses",
  "cues": [
    {
      "time_s": 1.25,
      "library": "ui-sfx",
      "asset_id": "soft/click",
      "asset": "click.mp3",
      "volume": 0.18,
      "purpose": "Label appears",
      "source": "https://github.com/romainsimon/uisfx",
      "license": "CC0",
      "local_path": "成片/sfx/click.mp3"
    }
  ]
}
```

Also retain the relevant manifest rows and any required attribution file so the
delivered project can be audited after the shared libraries change.

## Licensing

- Meta Open Sound effects use CC BY 4.0 and require the downloaded attribution
  file. Its instrument samples are CC0.
- UI SFX audio is CC0.
- Supplemental Pixabay entries use the Pixabay Content License.
- Supplemental Mixkit entries use the Mixkit Sound Effects Free License.
- VIDEO-SHOTCRAFT's bundled audio may carry different terms. Verify each selected
  file against the retained attribution and third-party notices. Do not assume
  that the Apache-2.0 code license covers audio.
- Keep the source URL, author if known, license, local path, and SHA-256 in the index.
- Do not redistribute the shared library itself as a raw asset pack.
- Check brand, logo, likeness, and third-party rights when an effect contains recognisable content.

The following six VIDEO-SHOTCRAFT files have unresolved source or commercial
rights. They are prohibited for commercial use until the rights are rechecked:

```text
assets/audio/sfx/text/keyboard.mp3
assets/audio/sfx/ui/pop.mp3
assets/audio/sfx/riser/riser-cine.mp3
assets/audio/sfx/light/sparkle.mp3
assets/audio/sfx/transition/whoosh-big.mp3
assets/audio/bgm/bgm-tech-house.mp3
```
