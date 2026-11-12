# Nhịp học — interface v3

This is an interactive, browser-local prototype. AI tutoring, document parsing and Telegram delivery remain simulated.

## Upstream design resources actually used

- Tabler Core 1.4.0: https://github.com/tabler/tabler. Vendored CSS in `dist/vendor/tabler.min.css`. Buttons, form fields, selects and badges use Tabler component classes. License in `dist/vendor/TABLER-LICENSE.txt`.
- Tabler Icons: https://github.com/tabler/tabler-icons. 31 outline icons vendored as an SVG sprite in `dist/vendor/icons.svg`; MIT license included.
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill. Read the skill and queried its design-system guidance. The first education query returned a children's style and was rejected as a poor fit. The narrower productivity workspace query returned Flat Design and a modern SaaS typography direction. Applied the hierarchy, restrained motion, shared component scale, focus and readable-contrast recommendations. The existing Vietnamese font is retained; the violet/slate palette is a project choice.

No external accounts or app connections were added. Existing site access is preserved.

## Validation

JavaScript syntax, rendered view structure, course-specific memory, shared source selection, source-based plan application, course creation and scheduling collision behavior are checked by the task's local verification script. Browser visual QA is unavailable because the managed environment does not expose its required cua_repl.js tool.
