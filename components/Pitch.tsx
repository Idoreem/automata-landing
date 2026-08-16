"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";

/**
 * סקשן ההצעה: מה מציעים ולמה. יושב בין ההירו להמלצות, כך שהגולש
 * מבין מה מדובר לפני שהוא רואה את ההוכחה, ורק אחר כך מגיע לטופס.
 * ה-CTA כאן גולל לטופס שבתחתית הדף.
 */
export default function Pitch() {
  const { pitch } = copy;

  const rise = (delay: number) =>
    ({
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.35 },
      transition: { duration: 0.6, delay },
    }) as const;

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <section
          style={{
            position: "relative",
            padding: "clamp(38px, 5.5vw, 62px) 0",
            background: "var(--bg-form)",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 700px 460px at 50% 45%, rgba(77, 141, 255, 0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <m.h2
              {...rise(0)}
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.3,
                margin: "0 0 16px",
              }}
            >
              {pitch.h2line1}
              <br />
              {pitch.h2line2}
            </m.h2>

            <m.p
              {...rise(0.1)}
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.18rem)",
                color: "#aab4c8",
                lineHeight: 1.85,
                margin: "0 auto 18px",
                whiteSpace: "pre-line",
                maxWidth: 640,
              }}
            >
              {pitch.subtext}
            </m.p>

            <m.p
              {...rise(0.16)}
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.18rem)",
                color: "#aab4c8",
                lineHeight: 1.85,
                margin: "0 auto 30px",
                maxWidth: 640,
              }}
            >
              {pitch.explainer}
            </m.p>

            <m.div
              {...rise(0.24)}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <a
                href="#form"
                className="cta-btn"
                style={{
                  fontSize: "clamp(1rem, 1.9vw, 1.25rem)",
                  padding: "clamp(14px, 2vw, 19px) clamp(26px, 5vw, 50px)",
                  maxWidth: "92vw",
                }}
              >
                {pitch.cta}
              </a>
            </m.div>
          </div>
        </section>
      </LazyMotion>
    </MotionConfig>
  );
}
