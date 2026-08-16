# AGENTS.md

כל ההקשר, חוקי הברזל, מפת הקוד, המוקשים ופרוטוקול הבדיקות - ב-**[CLAUDE.md](./CLAUDE.md)**.
קרא אותו במלואו לפני כל שינוי. תקציר החוקים הקריטיים:

1. קופי עורכים רק ב-`lib/copy.ts`, ובלי לשנות ניסוחים מאושרים בלי בקשה מפורשת.
2. אסור להמציא עדויות/מספרים/סקרסיטי. טרמינולוגיה: "פגישת אפיון AI", "מקימי Automata".
3. לפני סיום: `npm run build` + `npm run qa:flow` + `npm run qa:widths` + `npm run qa:assets`.
4. push ל-main = פריסה לפרודקשן. לאמת מול האתר החי אחרי כל push.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
