/**
 * השטח השמור לתמונת דף התודה.
 *
 * כשהתמונה מוכנה:
 * 1. שים את הקובץ ב-public/thanks.webp (או png/jpg)
 * 2. שנה את THANKS_SRC למטה ל-"/thanks.webp"
 */
import FlowViz from "./FlowViz";

const THANKS_SRC: string | null = null;

export default function ThanksImageSlot({ alt }: { alt: string }) {
  if (THANKS_SRC) {
    return (
      <img
        src={THANKS_SRC}
        alt={alt}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    );
  }

  return (
    <div
      style={{
        aspectRatio: "16 / 9",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background:
          "radial-gradient(ellipse 480px 280px at 50% 40%, rgba(77, 141, 255, 0.16) 0%, transparent 70%), linear-gradient(180deg, #060d1c 0%, #030711 100%)",
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
      {/* בלי שורת הסלוגן — היא כבר מופיעה בפוטר שמתחת, שלא תהיה כפילות */}
      <span
        style={{
          position: "relative",
          fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
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
    </div>
  );
}
