# Automata - דף נחיתה

דף הנחיתה לקמפיין של Automata: **פגישת אפיון AI** ("מפת השעות השרופות").
עברית, RTL, דארק נייבי. חי בפרודקשן: **https://automata-site.vercel.app/landing**

> 🤖 **עובדים עם Claude Code?** כל ההקשר, החוקים והמוקשים ב-[CLAUDE.md](./CLAUDE.md) - נטען אוטומטית.
> בדיקות מובנות: `npm run qa:flow` / `qa:widths` / `qa:assets` (פרטים שם).

## 🚀 איך עובדים על זה (עידו + מאור)

```bash
git clone https://github.com/Idoreem/automata-landing.git
cd automata-landing
npm install
npm run dev        # http://localhost:3000
```

**כל push ל-`main` נפרס אוטומטית לפרודקשן תוך ~20 שניות.** בלי CLI, בלי טוקנים.
עובדים על שינוי גדול? פותחים branch - כל branch מקבל Preview URL משלו אוטומטית.

## 📁 איפה מה

| קובץ | מה יש בו |
|---|---|
| `lib/copy.ts` | **כל הטקסטים של הדף** - כל שינוי קופי עושים כאן בלבד |
| `lib/site.ts` | כתובת האתר (לעדכן כשעוברים לדומיין אמיתי) |
| `assets/mockup.png` | תמונת הנושא (הירו + דף תודה) - להחלפה: דורסים את הקובץ |
| `components/SocialProof.tsx` | סקשן עדויות - **מוסתר עד שמוסיפים מדיה אמיתית** למערכים `VIDEOS`/`PHOTOS` |
| `components/LeadForm.tsx` | הטופס (שם/אימייל/טלפון + honeypot) |
| `app/api/lead/route.ts` | קליטת לידים: ולידציה, הגבלת קצב, העברה ל-webhook |
| `app/thanks/page.tsx` | דף התודה (קונפטי + בלוק הכנה) |
| `app/privacy/page.tsx` | מדיניות פרטיות |

## ⚙️ משתני סביבה (Vercel → Settings → Environment Variables)

| משתנה | סטטוס | תפקיד |
|---|---|---|
| `LEAD_WEBHOOK_URL` | ⚠️ **חסר - לידים לא נשמרים!** | לאן נשלח כל ליד (Webhook של Make/CRM) |
| `NEXT_PUBLIC_META_PIXEL_ID` | ⏳ חסר | פיקסל מטא - PageView + אירוע Lead בדף התודה |

## ✅ לפני שמשנים ומעלים

- קופי משנים רק ב-`lib/copy.ts` - לא בתוך קומפוננטות.
- אסור להוסיף עדויות/מספרים/לקוחות מומצאים. רק תוכן אמיתי.
- אחרי push: לבדוק את הדף החי בסלולר אמיתי (הקהל מגיע ממודעות פייסבוק = 90% מובייל).
- Lighthouse נוכחי: ביצועים 96 / נגישות 100 / Best Practices 100 / SEO 100 - לשמור על זה.
