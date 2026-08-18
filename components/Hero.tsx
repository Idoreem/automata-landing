"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";
import MockupSlot from "./MockupSlot";
import BalancedText from "./BalancedText";

// אנימציית הכניסה של הרפרנס: blur + fade + עלייה, בהדרגה
const rise = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(8px)", y: 20 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  const { hero } = copy;
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "48px 24px 12px",
          overflow: "hidden",
        }}
      >
        {/* זוהר רדיאלי + גריד עדין - כמו ברפרנס, בכחול */}
        <div
          aria-hidden
          className="glow-breathe"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 900px 600px at 50% 30%, rgba(77, 141, 255, 0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(77, 141, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 141, 255, 0.035) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, width: "100%" }}>
          <m.h1
            {...rise(0.05)}
            className="hero-h1"
            style={{ margin: "0 auto 26px" }}
          >
            <span className="hero-h1-a">{hero.h1Line1}</span>
            <span className="hero-h1-b">{hero.h1Line2}</span>
          </m.h1>

          <m.p
            {...rise(0.2)}
            id="hero-sub"
            className="hero-layer"
            style={{
              fontSize: "clamp(1.35rem, 4.4vw, 2rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.4,
              maxWidth: 720,
              margin: "0 auto 18px",
            }}
          >
            <BalancedText
              text={hero.sub}
              highlight={hero.subHighlight}
              highlightClass="hero-sub-accent"
            />
          </m.p>

          <m.p
            {...rise(0.32)}
            className="hero-layer"
            style={{
              fontSize: "clamp(1rem, 2.3vw, 1.12rem)",
              color: "#aab4c8",
              maxWidth: 540,
              margin: "0 auto 28px",
              fontStyle: "italic",
            }}
          >
            {hero.parenthetical}
          </m.p>

          {/* כפתור ראשון: תופס את מי שכבר משוכנע מהכותרת */}
          <m.div
            {...rise(0.4)}
            className="hero-layer"
            style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}
          >
            <a
              href="#form"
              className="cta-btn cta-ghost"
              style={{
                fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
                padding: "clamp(13px, 1.8vw, 17px) clamp(22px, 4vw, 40px)",
                maxWidth: "92vw",
              }}
            >
              {hero.heroCta}
            </a>
          </m.div>

          {/* השטח השמור למוקאפ - לחיץ, מגלגל לטופס */}
          <m.div
            className="media-frame"
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.92 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: 680,
              margin: "0 auto 36px",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(77, 141, 255, 0.25)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(77, 141, 255, 0.18)",
            }}
          >
            <a href="#form" className="mockup-link">
              <MockupSlot />
              <span className="sr-only">מעבר לטופס תיאום הפגישה</span>
            </a>
          </m.div>

          <m.div {...rise(0.6)} style={{ display: "flex", justifyContent: "center" }}>
            <a
              href="#form"
              className="cta-btn"
              style={{
                fontSize: "clamp(1rem, 1.9vw, 1.3rem)",
                padding: "clamp(14px, 2vw, 20px) clamp(28px, 5vw, 56px)",
                maxWidth: "92vw",
              }}
            >
              {hero.cta}
            </a>
          </m.div>

          <m.p
            {...rise(0.72)}
            style={{ fontSize: "clamp(0.92rem, 2.1vw, 1rem)", color: "#8b95a5", marginTop: 14 }}
          >
            {hero.microcopy}
          </m.p>
        </div>
      </section>
      </LazyMotion>
    </MotionConfig>
  );
}
