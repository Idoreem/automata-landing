import { after } from "next/server";

// יעדי הלידים:
//
// 1. ה-CRM של מאור. יעד ברירת המחדל, מוגדר מראש - עובד בלי משתני סביבה.
//    אותה נקודת קצה ואותו טוקן ציבורי שהאתר הראשי משתמש בהם (js/lead-crm.js),
//    ולכן הליד נוחת באותו מקום בדיוק כמו לידים מעמוד הקמפיינר.
//    לשינוי: LEAD_CRM_URL / LEAD_CRM_TOKEN. לכיבוי: LEAD_CRM_URL=off
// 2. Webhook נוסף (Make/CRM אחר), אופציונלי, דרך LEAD_WEBHOOK_URL.
//
// הליד נחשב שנשלח אם לפחות יעד אחד קלט אותו. כישלון מלא מוחזר כ-502
// והלקוח מנסה שוב פעם אחת. כל כישלון נרשם ללוג עם הליד המלא לשחזור.

// טוקן ציבורי של ה-webhook, מיועד מלכתחילה לצד-לקוח (מופיע גלוי ב-js/lead-crm.js
// של האתר). לא סוד, ולכן ברירת מחדל בקוד ולא משתנה סביבה חובה.
const CRM_URL =
  process.env.LEAD_CRM_URL ?? "https://maor-s-crm.vercel.app/api/webhooks/leads";
const CRM_TOKEN =
  process.env.LEAD_CRM_TOKEN ??
  "lead_6df41e0f263e591c83811638cc8e55a95ad551ea793d9c10";

// הגבלת קצב בסיסית לכל אינסטנס (סרברלס - מתאפס בין אינסטנסים; שכבת הגנה ראשונה בלבד).
// התקרה נדיבה בכוונה: גולשי מובייל מקמפיין חולקים IP דרך CGNAT של המפעיל.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const MAP_CLEAN_THRESHOLD = 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // ניקוי המפה כשהיא תופחת - מונע דליפת זיכרון באינסטנס חם
  if (hits.size > MAP_CLEAN_THRESHOLD) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true; // בקשה שנדחתה לא נספרת - ניסיון חוזר לא מאריך את הנעילה
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// נטרול תו פותח שמסוכן בגיליונות (הזרקת נוסחאות ב-Google Sheets וכד')
const defuse = (s: string): string => s.replace(/^[=+@\t\r]+/, "");

// מיסוך PII ללוגים - מספיק לזיהוי, לא מספיק לזליגה
const mask = (email: string, phone: string) => ({
  email: email.replace(/^(.).*(@.*)$/, "$1***$2"),
  phone: `***${phone.replace(/\D/g, "").slice(-3)}`,
});

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  // הגבלת קצב קודם לכל - גם בוטים שנתפסים בפיתיון כפופים לה
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "too many requests" }, { status: 429 });
  }

  const suspectedSpam = Boolean(str(data.notes_hp, 10));

  const name = defuse(str(data.name, 120));
  const email = str(data.email, 200);
  const phoneRaw = str(data.phone, 30);
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  const consented = data.consent === true || data.consent === "on";

  if (name.length < 2) {
    return Response.json({ ok: false, error: "invalid name" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ ok: false, error: "invalid email" }, { status: 400 });
  }
  // רשימת תווים סגורה לטלפון - חוסמת גם הזרקות נוסחה וגם זבל
  if (
    phoneDigits.length < 8 ||
    phoneDigits.length > 15 ||
    !/^[0-9+\-\s()]+$/.test(phoneRaw)
  ) {
    return Response.json({ ok: false, error: "invalid phone" }, { status: 400 });
  }
  if (!consented) {
    return Response.json({ ok: false, error: "consent required" }, { status: 400 });
  }

  // ?ref= מהכתובת מאפשר לתייג ליד לפי מודעה. אותה מוסכמה כמו באתר הראשי.
  const ref = defuse(str(data.ref, 120)) || "automata-landing";

  const payload = {
    name,
    email,
    phone: phoneRaw,
    consent: true,
    // ליד שנתפס בפיתיון לא נזרק - עובר עם דגל, ומסוננים ביעד.
    // ככה מילוי אוטומטי שהפעיל את הפיתיון בטעות לא מעלים ליד אמיתי.
    suspected_spam: suspectedSpam,
    source: "automata-landing",
    ref,
    submittedAt: new Date().toISOString(),
  };

  // מבנה הפיילוד של ה-CRM שונה מהפיילוד הגנרי: firstName במקום name, וטוקן.
  const crmPayload = {
    token: CRM_TOKEN,
    firstName: name.slice(0, 100),
    phone: phoneRaw.slice(0, 40),
    email: email.slice(0, 200),
    ref,
    note: suspectedSpam
      ? "מקור: דף נחיתה /landing. חשוד כספאם (נתפס בפיתיון) - לבדוק לפני יצירת קשר."
      : "מקור: דף נחיתה /landing (פגישת אפיון AI).",
  };

  /**
   * שלושה ניסיונות עם השהיה עולה. זה רץ בשרת, אחרי שהתשובה כבר יצאה,
   * ולכן הוא לא מעכב את הגולש ולא תלוי בכך שהדפדפן שלו יישאר פתוח.
   */
  async function deliver(target: string, url: string, body: unknown): Promise<boolean> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) return true;
        console.error(`lead delivery to ${target} failed (attempt ${attempt}):`, res.status);
      } catch (err) {
        console.error(`lead delivery to ${target} errored (attempt ${attempt}):`, err);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
    // ליד אמיתי שאבד - נשמר בלוג במלואו לשחזור (מומלץ להגדיר Log Drain)
    console.error(`lead delivery to ${target} gave up, LEAD AT RISK:`, payload);
    return false;
  }

  // המסירה ליעדים רצה אחרי שהתשובה כבר נשלחה לדפדפן. הגולש מקבל אישור
  // תוך עשרות אלפיות ועובר מיד לדף התודה, בעוד הפלטפורמה שומרת את
  // הפונקציה חיה עד שהמסירה נגמרת. זה המקום היחיד שבו "ברקע" באמת
  // בטוח: בדפדפן, יציאה מהדף הורגת את הבקשה באמצע.
  after(async () => {
    const targets: Promise<boolean>[] = [];
    if (CRM_URL && CRM_URL !== "off") targets.push(deliver("crm", CRM_URL, crmPayload));

    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (webhook) targets.push(deliver("webhook", webhook, payload));

    if (targets.length === 0) {
      console.error("no lead destination configured - LEAD LOST:", payload);
      return;
    }
    const results = await Promise.all(targets);
    if (!results.some(Boolean)) {
      console.error("lead delivery failed to every destination:", payload);
    }
  });

  if (suspectedSpam) {
    console.warn("suspected spam lead forwarded with flag:", mask(email, phoneRaw));
  }

  return Response.json({ ok: true });
}
