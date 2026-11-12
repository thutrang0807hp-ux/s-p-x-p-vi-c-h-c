# Development notes

- This is a local-first static app. `dist/` contains authored source, not disposable build output.
- Read README.md and docs/ARCHITECTURE.md before changing persistence or the ChatGPT handoff.
- Run `npm run check` and `npm test` after functional changes. There is no real browser-rendering coverage yet.
- Keep original user files and exported learning backups out of Git. No API keys, login tokens, Telegram credentials or Notion credentials belong in source.
- Preserve existing IndexedDB/localStorage data and backup compatibility. Introduce a migration if changing persisted schemas; test old-data import and reload.
- Preserve returned course/packet IDs. A summary must be reviewed before committing and must reject wrong-course or duplicate packets. Never claim the model has read a document when only its name is present.
- Chat inside the sample lesson, sample quizzes, multi-book roadmap generation and Telegram are still simulations. Do not present them as live integrations.
- `.openai/hosting.json` identifies the existing Sites project. Do not replace the ID or change the site's audience as a routine implementation step.
- Third-party distributions in dist/vendor retain their licenses and versions. Do not format or rewrite minified vendor code.
