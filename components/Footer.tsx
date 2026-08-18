import Link from "next/link";
import { copy } from "@/lib/copy";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(77, 141, 255, 0.12)",
        background: "var(--bg)",
        padding: "26px 24px calc(26px + env(safe-area-inset-bottom, 0px))",
        textAlign: "center",
        color: "#78828f",
        fontSize: "clamp(0.9rem, 2vw, 0.95rem)",
        lineHeight: 1.8,
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: "0.14em", color: "#aab4c8" }}>
        AUTOMATA
      </div>
      <div>{copy.ui.footerTagline}</div>
      <div>
        <Link
          href="/privacy"
          style={{
            color: "#78828f",
            textDecoration: "underline",
            display: "inline-block",
            padding: "6px 2px",
          }}
        >
          {copy.ui.footerPrivacy}
        </Link>
        {" · "}
        {copy.ui.footerRights}
      </div>
    </footer>
  );
}
