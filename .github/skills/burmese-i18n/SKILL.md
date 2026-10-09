---
name: burmese-i18n
description: Build or review Burmese (Myanmar) localization in multilingual interfaces. Use when adding Burmese translations, language switching, typography, layout, or tests for Burmese text.
---

# Burmese i18n

Treat Burmese as a first-class script with its own typographic and layout rules. Do not apply English text styling indiscriminately to Burmese strings.

## Language-aware rendering

- Set the correct `lang` attribute on the document or the smallest containing region when the selected locale changes. Use `my` for Burmese and the correct locale tag for other languages.
- Use a font with Myanmar script coverage, with sensible Myanmar-capable system fallbacks. Check actual glyph coverage; a font-family declaration alone does not guarantee the chosen font contains the glyphs.
- Scope Burmese typography through language selectors or locale-specific component styles (for example, `:lang(my)`), rather than changing English styles globally.
- Let the font determine Burmese line height where possible. Do not force Burmese into a compact, fixed English line-height. If the layout needs an explicit rule, use a roomier Burmese-specific line height and verify wrapped paragraphs, controls, and mixed-script lines.
- Do not apply custom letter spacing to Burmese. Override inherited tracking with `letter-spacing: normal` for Burmese text and descendants where needed. Do not add tracking to compensate for font rendering.
- Keep layout dimensions flexible: allow controls and text blocks to grow vertically, avoid fixed heights around translated copy, and verify narrow screens, zoom, and multiline labels.

## Translation choices

- Translate for meaning and familiar usage, not word-for-word similarity.
- Keep established technical terms, product names, acronyms, units, code identifiers, and widely recognized UI terms in English when that is clearer to Burmese readers. Examples include `API`, `NASA`, `Earth Information Center`, `signal`, `dataset`, `Play`, and `Settings`; choose per audience and context rather than treating this list as mandatory.
- Avoid awkward transliteration of common technical vocabulary. Use Burmese explanatory text around an English technical term where that improves comprehension.
- Keep interpolation values, dates, units, and placeholders intact. Never translate keys, route names, IDs, or data payloads as display copy.
- Preserve concise, consistent terminology across menus, buttons, errors, help text, and accessible labels. Review mixed Burmese/English strings as rendered, not only in translation files.

## Accessibility and verification

- Localize accessible names, validation messages, announcements, tooltips, and document metadata, not only visible headings.
- Do not rely on line breaks, color, or fixed widths that only work for English. Check keyboard focus and clipping after text expands.
- Review Burmese copy with a fluent speaker for natural phrasing and audience-appropriate use of English terms.
- Test the language switch in both directions. Verify the active `lang`, Myanmar font fallback, line wrapping, comfortable vertical rhythm, no custom letter spacing, and responsive layouts at narrow and enlarged text sizes.
