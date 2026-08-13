# Automata — דף נחיתה

דף סקוויז לקמפיין הוולידציה של Automata: שיחת מיפוי ("מפת השעות השרופות") עם עידו ראם ומאור.
ממודל על דף הרפרנס של יהב רובין. עברית, RTL, דארק נייבי.

## סטאק

Next.js (App Router) · framer-motion (LazyMotion) · canvas-confetti · פונט Assistant

## הרצה

```bash
npm install
npm run dev      # פיתוח
npm run build && npm start   # פרודקשן מקומי
```

## משתני סביבה (Vercel → Settings → Environment Variables)

| משתנה | חובה | תפקיד |
|---|---|---|
| `LEAD_WEBHOOK_URL` | ✅ לפני טראפיק | לאן נשלח כל ליד (Webhook של Make). בלעדיו לידים לא נשמרים! |
| `NEXT_PUBLIC_META_PIXEL_ID` | ✅ לפני קמפיין | מזהה פיקסל מטא. מדליק PageView + אירוע Lead בדף התודה |

## מבנה

- `lib/copy.ts` — כל הקופי והמחרוזות. עריכה כאן משנה את הדף
- `lib/site.ts` — כתובת האתר (לעדכן במעבר לדומיין קבוע)
- `components/MockupSlot.tsx` — שטח שמור למוקאפ בהירו (קבוע `MOCKUP_SRC`)
- `components/ThanksImageSlot.tsx` — שטח שמור לתמונת דף התודה (`THANKS_SRC`)
- `components/SocialProof.tsx` — סקשן עדויות. מוסתר עד שיש מדיה אמיתית במערכים `VIDEOS`/`PHOTOS`
- `app/api/lead/route.ts` — קליטת לידים: ולידציה, הגבלת קצב, honeypot, העברה ל-webhook

## פריסה

```bash
npx vercel deploy --prod --yes
```
