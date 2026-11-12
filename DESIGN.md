# Nhịp học — interface v3

This is an interactive, browser-local prototype. AI tutoring, document parsing and Telegram delivery remain simulated.

## Upstream design resources actually used

- Tabler Core 1.4.0: https://github.com/tabler/tabler. Vendored CSS in `dist/vendor/tabler.min.css`. Buttons, form fields, selects and badges use Tabler component classes. License in `dist/vendor/TABLER-LICENSE.txt`.
- Tabler Icons: https://github.com/tabler/tabler-icons. 31 outline icons vendored as an SVG sprite in `dist/vendor/icons.svg`; MIT license included.
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill. Read the skill and queried its design-system guidance. The first education query returned a children's style and was rejected as a poor fit. The narrower productivity workspace query returned Flat Design and a modern SaaS typography direction. Applied the hierarchy, restrained motion, shared component scale, focus and readable-contrast recommendations. The existing Vietnamese font is retained; the violet/slate palette is a project choice.

No external accounts or app connections were added. Existing site access is preserved.

## Validation

JavaScript syntax, rendered view structure, course-specific memory, shared source selection, source-based plan application, course creation and scheduling collision behavior are checked by the task's local verification script. Browser visual QA is unavailable because the managed environment does not expose its required cua_repl.js tool.

## v4: calendar and larger lessons

- FullCalendar 6.1.19: https://github.com/fullcalendar/fullcalendar. Vendored global build plus Vietnamese locale. Uses the standard MIT-licensed time grid and month views. No Google account connection or Google Calendar synchronization is implied.
- Split.js 1.6.5: https://github.com/nathancahill/split. Vendored MIT-licensed build provides the draggable reading/tutor divider on wide screens.
- Calendar events share the local schedule model with the Telegram simulation. Added sessions and changes persist in the browser. Both direct editing and drag/resize reject scheduling collisions. The calendar initially uses the prototype week of 9–15 November 2026, with day view on phones and week view on desktop.
- Lessons now collapse global navigation, use a 64/36 reading/tutor split, larger reading type, text-size controls, a reading-only mode and focus mode. Illustrations explain probability outcomes, Python loop output or a sample English conversation. All remain clearly marked as sample content.
- Color is strengthened across course covers, the hero, source panels, calendar events and lesson illustrations. Long-form content uses darker text on white or pale surfaces.

Validation includes the prior course/source tests plus calendar configuration, escaping, session creation/deletion, drag updates/conflicts, Telegram collisions with additional sessions, reader controls and focus mode. These checks simulate DOM/library boundaries; they are not browser visual or end-to-end tests. The required managed browser tool remains unavailable.
