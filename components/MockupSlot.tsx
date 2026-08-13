/**
 * השטח השמור למוקאפ של עידו.
 *
 * כשהמוקאפ מוכן:
 * 1. שים את הקובץ ב-public/mockup.webp (או png/jpg)
 * 2. שנה את MOCKUP_SRC למטה ל-"/mockup.webp"
 * זהו. שאר הדף לא משתנה.
 */
import FlowViz from "./FlowViz";

const MOCKUP_SRC: string | null = null;

export default function MockupSlot() {
  if (MOCKUP_SRC) {
    return (
      <img
        src={MOCKUP_SRC}
        alt="עידו ראם — Automata"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    );
  }

  // מצב ביניים מעוצב עד שהמוקאפ נכנס — נראה מכוון גם אם הדף עולה לפני התמונה
  return (
    <div
      style={{
        aspectRatio: "16 / 10",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background:
          "radial-gradient(ellipse 420px 260px at 50% 40%, rgba(77, 141, 255, 0.14) 0%, transparent 70%), linear-gradient(180deg, #060d1c 0%, #030711 100%)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(77, 141, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 141, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <FlowViz />
      <span
        style={{
          position: "relative",
          fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
          fontWeight: 800,
          letterSpacing: "0.22em",
          background:
            "linear-gradient(135deg, #2f6bff 0%, #8ab4ff 50%, #2f6bff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          paddingInlineStart: "0.22em",
        }}
      >
        AUTOMATA
      </span>
      <span
        style={{
          position: "relative",
          color: "#aab4c8",
          fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
          fontWeight: 600,
        }}
      >
        ארכיטקטורה טכנולוגית לעסקים
      </span>
    </div>
  );
}
