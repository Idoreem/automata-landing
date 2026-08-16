import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | Automata",
  description: "מדיניות הפרטיות של Automata - איזה מידע נאסף, למה, ומה הזכויות שלך.",
  robots: { index: false, follow: false },
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontSize: "1.15rem",
      fontWeight: 700,
      color: "#ffffff",
      margin: "28px 0 8px",
    }}
  >
    {children}
  </h2>
);

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        padding: "56px 24px 80px",
      }}
    >
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          color: "#aab4c8",
          lineHeight: 1.8,
          fontSize: "0.98rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 6,
          }}
        >
          מדיניות פרטיות
        </h1>
        <p style={{ color: "#78828f", fontSize: "0.85rem", marginBottom: 8 }}>
          עודכן לאחרונה: אוגוסט 2026
        </p>

        <p>
          Automata (״אנחנו״) מכבדת את הפרטיות שלך. המסמך הזה מסביר בשפה פשוטה
          איזה מידע נאסף באתר הזה, למה, ומה הזכויות שלך.
        </p>

        <H>איזה מידע נאסף</H>
        <p>
          כשאתה משאיר פרטים בטופס באתר, אנחנו אוספים את מה שמילאת: שם מלא,
          כתובת אימייל ומספר טלפון. בנוסף, כמו ברוב האתרים, עשוי להיאסף מידע
          טכני בסיסי (סוג דפדפן, עמודים שנצפו) באמצעות כלי מדידה.
        </p>

        <H>למה אנחנו משתמשים במידע</H>
        <p>
          מטרה אחת: ליצור איתך קשר - בוואטסאפ, בטלפון או באימייל - כדי לתאם
          את שיחת המיפוי שביקשת, ולשלוח לך מידע שקשור אליה. לא נשלח לך ספאם
          ולא נמכור את הפרטים שלך לאף גורם.
        </p>

        <H>שמירת המידע ואבטחה</H>
        <p>
          הפרטים נשמרים במערכות ניהול לידים מאובטחות של ספקים מוכרים, ונגישים
          רק לצוות Automata. אנחנו שומרים את המידע כל עוד הוא נדרש למטרה שלשמה
          נמסר, או עד שתבקש למחוק אותו.
        </p>

        <H>שיתוף עם צדדים שלישיים</H>
        <p>
          איננו מוכרים או משכירים מידע אישי. המידע עשוי לעבור דרך ספקי תשתית
          תפעוליים בלבד (אחסון אתרים, מערכות טפסים ואוטומציה) לצורך מתן השירות.
        </p>

        <H>עוגיות וכלי מדידה</H>
        <p>
          האתר עשוי להשתמש בעוגיות (Cookies) ובכלי מדידה ופרסום, כגון פיקסל של
          Meta, לצורך מדידת ביצועי הקמפיין ושיפור החוויה. אפשר לחסום עוגיות
          בהגדרות הדפדפן.
        </p>

        <H>הזכויות שלך</H>
        <p>
          בכל רגע אפשר לבקש לעיין במידע שנאסף עליך, לתקן אותו או למחוק אותו -
          פשוט כתוב לנו ונטפל בזה במהירות.
        </p>

        <H>יצירת קשר</H>
        <p>
          לכל שאלה על פרטיות:{" "}
          <a
            href="mailto:idoreem2@gmail.com"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            idoreem2@gmail.com
          </a>
        </p>

        <H>עדכונים</H>
        <p>
          ייתכן שנעדכן את המדיניות מעת לעת. הגרסה העדכנית תמיד תופיע בעמוד הזה.
        </p>

        <p style={{ marginTop: 36 }}>
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            → חזרה לדף הראשי
          </Link>
        </p>
      </article>
    </main>
  );
}
