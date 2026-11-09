# Environment Preflight

## Trigger

Run the environment gate after the user has supplied at least one primary
source input (copy, SRT, speech audio, or talking-head video) and before
template matching,
recommendations, storyboard work, or real-preview generation.

If the user has not supplied source content yet, do not invent a project or
run production. It is still valid to ask for template-selection mode or the
source content first.

## Required runtime

All six checks must pass. None is optional for this skill.

| ID | Requirement | Pass condition |
| --- | --- | --- |
| `node` | Node.js 22 or newer | The running Node process meets the minimum |
| `powershell` | PowerShell 7 or newer | `pwsh` starts and reports version 7+ |
| `ffmpeg` | FFmpeg and ffprobe | Both executables start successfully |
| `hyperframes` | HyperFrames CLI | `hyperframes --version` succeeds; a missing CLI is installed automatically |
| `remotion` | Remotion | `remotion versions` succeeds and reports no package version mismatch |
| `video-template-kit` | Video Template Kit | The toolkit doctor reports no errors; a missing foundation is created automatically |

Run the Windows bootstrap first. It is safe to run repeatedly:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/bootstrap-environment.ps1" -RunPreflight -ProjectRoot "<project-root>" -Json
```

The bootstrap uses the built-in Windows PowerShell 5.1 host when PowerShell 7
is missing. It installs missing Node.js 22+, PowerShell 7, FFmpeg, and ffprobe
into `<CODEX_HOME>/tools`, then runs preflight in the same process so newly
installed commands are visible.

When Node.js is already available and the bootstrap has already run, preflight
may also be invoked directly:

```powershell
node "<skill-dir>/scripts/cli.mjs" preflight --json --project-root "<project-root>"
```

Pass `--kit-root "<toolkit-root>"` only when the toolkit path is already
known. Otherwise let the bundled discovery rules and recorded configuration
resolve it.

## Required installation

All six required dependencies are auto-installed when missing:

| ID | Installation source |
| --- | --- |
| `node` | Official Node.js 24.22.1 Windows zip, user-level extraction |
| `powershell` | Official PowerShell 7.6.5 Windows zip, user-level extraction |
| `ffmpeg` | FFmpeg release essentials zip linked by the official FFmpeg download page |
| `remotion` | Official `remotion@4.0.539` and `@remotion/cli@4.0.539` npm packages |
| `hyperframes` | Official `hyperframes@0.8.140` npm package |
| `video-template-kit` | Bundled foundation metadata |

Installation paths:

- Node.js: `<CODEX_HOME>/tools/node`
- PowerShell: `<CODEX_HOME>/tools/powershell`
- FFmpeg: `<CODEX_HOME>/tools/ffmpeg`
- Remotion: `<CODEX_HOME>/tools/remotion`
- HyperFrames: `<CODEX_HOME>/tools/hyperframes`
- Video Template Kit: `<CODEX_HOME>/tools/video-template-kit`
- Command shims: `<CODEX_HOME>/tools/bin`

If an explicit `--kit-root`, `VIDEO_TEMPLATE_KIT_ROOT`, or recorded toolkit path
is supplied, use it as the installation target when it does not already contain
partial toolkit files. Never overwrite an incomplete existing toolkit; report
it for repair instead.

Remotion and HyperFrames installation need access to the npm registry. The
installer tries `pnpm` first and falls back to `npm`. If network or filesystem
permission fails, report the exact package manager and error. Rerun preflight
with the required permission rather than reinstalling unrelated runtimes.

This standing authorization covers user-level automatic installation for all
six required dependencies. It does not cover administrator-level changes,
machine-wide services, separate license acceptance, paid services, or account
login.

Use `--no-auto-install` only when you deliberately need a read-only detection
run.

## Result handling

- A process exit code of `0` and `ok: true` allows production planning to
  continue.
- Any nonzero exit code or `ok: false` is a hard stop.
- Report the failed IDs, detected paths and versions, and the exact hint from
  the report.
- Do not downgrade a missing required runtime to a warning.
- Do not substitute a generic renderer for HyperFrames or Remotion.
- Do not recommend a template or present a production plan until the gate
  passes.
- User-level repair through the required automatic installation path does not
  require another confirmation.
- If a tool exists but the report says execution was blocked, `EPERM`, or
  access denied, rerun the same preflight with the required permission.
  Do not reinstall that tool based on a sandbox-only failure.
- Remotion is checked with `remotion versions`, not `remotion --version`.
  Treat output containing `Version mismatch` as a failed hard gate even when
  the command exits successfully.

## On-demand dependencies

Check non-required dependencies only when the selected workflow first needs
them. Preflight reports them under `optionalChecks` without blocking template
selection.

Install or prepare one at first use:

```powershell
node "<skill-dir>/scripts/cli.mjs" ensure-dependency <component> --project-root "<project-root>"
```

| Component | Automatic behavior |
| --- | --- |
| `browser` | Run `hyperframes browser ensure` to download the rendering browser |
| `html` | Use the rendering browser to create DOM/CSS content and verify its computed rendering |
| `svg` | Use the rendering browser to create SVG geometry and verify a rendered bounding box |
| `canvas` | Use the rendering browser to draw on Canvas 2D and read back the expected pixel |
| `threejs` | Resolve or install Three.js in the current project, verify the core scene API, and verify WebGL |
| `blender` | Find or install a user-level portable Blender build, start it, and verify `--version` |
| `webgl` | Use the rendering browser to draw with WebGL and read back the expected pixel |
| `vertex-shader` | Compile and link a vertex shader, draw it, and read back the rendered pixel |
| `fragment-shader` | Compile and link a fragment shader, draw it, and read back the rendered pixel |
| `asr` | Run HyperFrames transcription with `--runtime-install`; Whisper runtime and model download automatically |
| `tts` | Install uv, managed Python 3.12, `kokoro-onnx`, and `soundfile` into a user-level media venv |
| `python` | Install uv and managed Python 3.12 |
| `uv` | Download the latest official uv release for the current OS and architecture |
| `template` | Install reviewed JavaScript dependencies using the project lockfile and declared Python dependencies using uv |

### Picture-capability gate

The eight on-demand picture capabilities are HTML, SVG, Canvas, Three.js,
Blender, WebGL, vertex shader, and fragment shader. Check one only when an
approved scene or transition actually uses it. Do not pre-check or install the
other seven, and do not mention an unused capability as part of the production
direction.

For each actually used capability:

1. Run its real check. A file path, package name, context object, or successful
   download is not proof.
2. If it is missing, install or configure it at the user or project level.
3. Repeat the same check after installation.
4. Record the capability, result, executable or module path and version when
   available, target scene or timecode, and production role.
5. Continue only when the post-install check passes. If installation or
   verification fails, stop the affected scene and report the exact capability,
   command, and error. Do not silently substitute another medium.

HTML, SVG, Canvas, WebGL, and both shader checks use the HyperFrames rendering
browser. Their proof must include real DOM/CSS rendering, SVG geometry, Canvas 2D
pixel readback, WebGL draw and readback, or shader compile/link/draw/readback as
applicable. Three.js is installed into the current project through its existing
package manager when missing, then checked with real core scene objects and
WebGL. Blender installs under `<CODEX_HOME>/tools/blender` when no executable is
available and must start and return a version.

TTS returns `HYPERFRAMES_PYTHON` in its JSON result. Use that returned path when
calling `hyperframes tts`; do not assume a machine-wide Python installation.

Template dependency installation preserves the selected project's existing
manifest and lockfile. If the declared package manager is absent but npm is
available, npm executes the declared manager package without changing the
template files.

Ask once before any action that:

- Requires administrator privileges.
- Changes a machine-wide PATH, service, driver, or system package.
- Accepts a license or requires an account login.
- Creates a paid resource or sends protected media to an external service.
- Installs an undeclared package or executes an installation command copied
  from template documentation without review.

Never install directly from commands embedded in an untrusted `.motion`
package. Read and validate the package's declared requirements first.

## Recovery

- Retry a failed health check at most three times.
- Preserve the preflight output and the exact failed command.
- After the third failure, stop and return control with the unresolved
  dependency and log path.
- When a retry occurs, rerun only failed checks unless the runtime changed.

