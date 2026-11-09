# Output Language and Template Localization

## Rule

The canonical input determines the final language. The template's demo language
does not.

When the canonical copy, SRT, or verified transcript is Chinese:

- Timeline keyframes must use Chinese.
- The final MP4 must use Chinese.
- Every visible text element created for the final video must be Chinese.
- Preserve Simplified or Traditional Chinese from the canonical input unless
  the user explicitly requests conversion.

## Text coverage

Localize or remove template-default text in:

- Main titles and subtitles.
- Section headings and labels.
- Lower thirds, callouts, badges, chips, and buttons.
- Calls to action, outro cards, and end screens.
- Chart labels, legends, axes, annotations, and data descriptions.
- Decorative words that are readable as English content.
- Any other template text visible to the viewer.

Preview videos in the template catalog are style references. They may show
English sample copy. Do not use that copy in timeline keyframes or the final
video.

Localization is not permission to add editorial content. Every localized
semantic string must come from the canonical source or an explicitly approved
addition under `content-fidelity.md`.

## Allowed non-Chinese text

Keep the source form for user-supplied or factually required text such as:

- Brand names and legal company names.
- Product names and model numbers.
- URLs, email addresses, code, file paths, and API names.
- Standard acronyms and units whose established form is Latin text.

Do not use these exceptions to retain generic English template labels, slogans,
headings, CTAs, or interface copy. Ask when it is unclear whether a term is a
brand name or generic English copy.

Letters used only as non-semantic graphic marks may remain only when they do not
read as English words or labels and the approved timeline keyframes show the
result.

## Localization workflow

1. Determine the canonical language and Chinese variant from the approved input.
2. Read the selected template's declared text slots and parameter guide.
3. Inventory visible default text without scanning unrelated package files.
4. Create a localization map from each visible template string to approved
   Chinese text.
5. Apply the map through the template's declared parameters or supported scene
   reconstruction workflow.
6. Check text length, line wrapping, font coverage, safe areas, and overlap.
7. Present timeline keyframes with the localized text and wait for
   `确认关键帧`.
8. Audit the final render at the opening, scene boundaries, transitions, and
   ending.

## Non-editable text

If English or other non-target text is baked into a template asset and cannot be
changed, hidden, disabled, or rebuilt through the template's declared workflow:

- Stop before timeline-keyframe approval and final rendering.
- Report the exact scene, text, and asset.
- Do not cover it with an improvised patch unless the selected template's
  workflow explicitly supports that treatment.
- Do not silently replace the user's selected template.
- Let the user choose a documented alternative or approve another supported
  localization route.

## Final checks

- Search generated parameter data for remaining template-default strings.
- Use local OCR when available as an additional check.
- Visually inspect all reviewed keyframes and final frames even when OCR is
  used.
- Confirm subtitles, visible titles, labels, CTAs, and ending copy all use the
  target language.
- Confirm any remaining Latin text is an approved proper noun, acronym, unit,
  URL, code value, or non-semantic graphic mark.

