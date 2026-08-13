// יעד הלידים: Webhook של Make (או כל יעד אחר) דרך משתנה סביבה.
// הגדרה ב-Vercel: Settings → Environment Variables → LEAD_WEBHOOK_URL
// כל עוד המשתנה לא מוגדר — הליד נרשם ללוג בלבד ולא נשמר. אסור להריץ טראפיק ככה.

// הגבלת קצב בסיסית לכל אינסטנס (סרברלס — מתאפס בין אינסטנסים; שכבת הגנה ראשונה בלבד).
// התקרה נדיבה בכוונה: גולשי מובייל מקמפיין חולקים IP דרך CGNAT של המפעיל.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const MAP_CLEAN_THRESHOLD = 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // ניקוי המפה כשהיא תופחת — מונע דליפת זיכרון באינסטנס חם
  if (hits.size > MAP_CLEAN_THRESHOLD) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true; // בקשה שנדחתה לא נספרת — ניסיון חוזר לא מאריך את הנעילה
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// נטרול תו פותח שמסוכן בגיליונות (הזרקת נוסחאות ב-Google Sheets וכד')
const defuse = (s: string): string => s.replace(/^[=+@\t\r]+/, "");

// מיסוך PII ללוגים — מספיק לזיהוי, לא מספיק לזליגה
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

  // הגבלת קצב קודם לכל — גם בוטים שנתפסים בפיתיון כפופים לה
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
  // רשימת תווים סגורה לטלפון — חוסמת גם הזרקות נוסחה וגם זבל
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

  const payload = {
    name,
    email,
    phone: phoneRaw,
    consent: true,
    // ליד שנתפס בפיתיון לא נזרק — עובר עם דגל, ומסוננים ב-Make.
    // ככה מילוי אוטומטי שהפעיל את הפיתיון בטעות לא מעלים ליד אמיתי.
    suspected_spam: suspectedSpam,
    source: "automata-landing",
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        // ליד אמיתי שנכשל — נשמר בלוג במלואו לשחזור (מומלץ להגדיר Log Drain)
        console.error("lead webhook failed:", res.status, payload);
        return Response.json({ ok: false }, { status: 502 });
      }
    } catch (err) {
      console.error("lead webhook error:", err, payload);
      return Response.json({ ok: false }, { status: 502 });
    }
  } else {
    console.warn("LEAD_WEBHOOK_URL not set — lead logged only:", payload);
  }

  if (suspectedSpam) {
    console.warn("suspected spam lead forwarded with flag:", mask(email, phoneRaw));
  }

  return Response.json({ ok: true });
}
