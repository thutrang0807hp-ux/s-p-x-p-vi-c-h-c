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

## v5: owned records and ChatGPT handoff

- IndexedDB stores the current workspace and original uploaded files, with a synchronous localStorage mirror for small state changes. Startup migrates the previous local data, chooses the newer valid snapshot, and preserves existing courses and notes. If IndexedDB is unavailable the interface explicitly reports fallback storage.
- The profile page supports editable learner preferences, a versioned JSON backup including original files, checked restore preview, explicit replacement confirmation and a previous-workspace snapshot for undo. Individual originals are limited to 20 MB and total originals to 50 MB. Documents, notes and backups remain local and are not encrypted by the app. There is no account-based or cross-device synchronization.
- Uploads commit original blobs and workspace metadata in one IndexedDB transaction. TXT/MD contents can seed editable excerpts; PDF/DOCX/PPTX parsing is not implemented. Legacy source names are not treated as uploaded originals.
- Each course has a “Học với ChatGPT” page. A generated packet includes learner preferences, relevant course memory, recent notes, selected source excerpts and stable course/session identifiers. Users explicitly copy/download it and open ChatGPT themselves. No subscription is used programmatically; no API keys, cookies or session tokens are requested.
- The returned summary schema is `nhiphoc-session`, version 1. Import validates IDs, course ownership, duplicate sessions and quiz bounds, then shows a review before updating memory, history and optional notes. Suggested percentage progress requires a separate user checkbox. Unverified generated teaching and quizzes elsewhere remain marked as sample content.
- Backup schema: `nhiphoc-backup`, version 1. Restore rejects malformed envelopes, bad identifiers/dates, duplicate course/packet/session IDs and invalid attachment bytes. Stored file names, source excerpts and imported descriptions are escaped in the interface.

Validation: Node syntax checks; existing course/calendar behavior checks; linkedom DOM interaction tests; and fake-indexeddb transaction/persistence tests cover source-scoped packet creation, reviewed summary submission, wrong-course/duplicate protection, uploads, reload/reopen, backup roundtrip, restore confirmation, previous snapshot, malformed inputs and storage fallback. These tests emulate browser APIs, not rendering. The managed environment still does not expose its required browser preview tool.
