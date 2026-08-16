"use client";

import { useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { copy } from "@/lib/copy";
import ThanksImageSlot from "./ThanksImageSlot";

// צבעי המותג — הקונפטי חייב להרגיש חלק מהעיצוב, לא סטיקר עליו
const BRAND = ["#4d8dff", "#8ab4ff", "#2f6bff", "#ffffff", "#c9dcff"];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function ThanksContent() {
  const reduced = useReducedMotion();
  const { thanks } = copy;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * רצף חגיגה בשלוש שכבות:
   * 1. פיצוץ מרכזי רחב — הרגע עצמו
   * 2. שתי תותחים מהצדדים בהשהיה — מילוי הפריים
   * 3. נשורת חלקיקים איטית ~2.5 שניות — הזנב היוקרתי שמונע תחושת "פופ" זול
   */
  useEffect(() => {
    if (reduced || !canvasRef.current) return;
    // קנבס משלנו + רינדור בתהליך הראשי: מתנהג זהה בכל דפדפן, וניתן לאימות בבדיקות
    const fire = confetti.create(canvasRef.current, { resize: true, useWorker: false });
    const timers: ReturnType<typeof setTimeout>[] = [];
    let drift: ReturnType<typeof setInterval> | undefined;

    const base = { colors: BRAND, disableForReducedMotion: true };

    timers.push(
      setTimeout(() => {
        // 1 — הפיצוץ המרכזי, מעט מתחת לאמצע כדי לעלות אל התמונה
        fire({
          ...base,
          particleCount: 120,
          spread: 90,
          startVelocity: 45,
          origin: { x: 0.5, y: 0.62 },
          scalar: 1.05,
          ticks: 260,
        });
      }, 350)
    );

    timers.push(
      setTimeout(() => {
        // 2 — תותחי צד
        fire({ ...base, particleCount: 55, angle: 55, spread: 65, startVelocity: 50, origin: { x: 0, y: 0.75 } });
        fire({ ...base, particleCount: 55, angle: 125, spread: 65, startVelocity: 50, origin: { x: 1, y: 0.75 } });
      }, 620)
    );

    timers.push(
      setTimeout(() => {
        // 3 — נשורת עדינה: חלקיקים קטנים, כבידה נמוכה, ריחוף הצידה
        const end = Date.now() + 2500;
        drift = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(drift);
            return;
          }
          fire({
            ...base,
            particleCount: 3,
            startVelocity: 0,
            gravity: 0.42,
            drift: Math.random() * 1.6 - 0.8,
            scalar: 0.72,
            ticks: 330,
            spread: 70,
            origin: { x: Math.random(), y: -0.08 },
          });
        }, 110);
      }, 900)
    );

    return () => {
      timers.forEach(clearTimeout);
      if (drift) clearInterval(drift);
      fire.reset();
    };
  }, [reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <main
          dir="rtl"
          style={{
            background: "var(--bg)",
            color: "#ffffff",
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "clamp(32px, 6vw, 64px) 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* שכבת הקונפטי — מעל התוכן, שקופה ללחיצות */}
          <canvas
            ref={canvasRef}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 60,
            }}
          />

          <div
            aria-hidden
            className="glow-breathe"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 900px 620px at 50% 35%, rgba(77, 141, 255, 0.13) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 880, width: "100%" }}>
            {/* הקריאייטיב הוא האישור עצמו — הווי והכותרת כבר בתוכו */}
            <m.div
              className="media-frame"
              initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: "clamp(28px, 5vw, 44px)",
                border: "1px solid rgba(77, 141, 255, 0.28)",
                boxShadow:
                  "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 48px rgba(77, 141, 255, 0.16)",
              }}
            >
              <ThanksImageSlot alt={thanks.imageAlt} />
            </m.div>

            {/* מה עכשיו */}
            <m.h1
              {...rise(0.45)}
              style={{
                fontSize: "clamp(1.6rem, 4.2vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.25,
                margin: "0 0 14px",
                color: "#ffffff",
              }}
            >
              {thanks.h1}
            </m.h1>

            <m.p
              {...rise(0.58)}
              style={{
                fontSize: "clamp(1rem, 1.9vw, 1.18rem)",
                color: "#aab4c8",
                lineHeight: 1.8,
                margin: "0 0 clamp(28px, 4vw, 40px)",
                whiteSpace: "pre-line",
              }}
            >
              {thanks.sub}
            </m.p>

            {/* בלוק ההכנה — מנגנון המחויבות שמעלה את אחוז ההגעה לפגישה */}
            <m.div
              {...rise(0.72)}
              style={{
                display: "inline-block",
                background:
                  "linear-gradient(180deg, rgba(77, 141, 255, 0.09) 0%, rgba(77, 141, 255, 0.04) 100%)",
                border: "1px solid rgba(77, 141, 255, 0.32)",
                borderRadius: 16,
                padding: "clamp(20px, 4vw, 28px) clamp(22px, 5vw, 36px)",
                fontSize: "clamp(0.98rem, 1.8vw, 1.12rem)",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.85,
                whiteSpace: "pre-line",
                boxShadow: "0 0 40px rgba(77, 141, 255, 0.08)",
              }}
            >
              {thanks.prep}
            </m.div>
          </div>
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
