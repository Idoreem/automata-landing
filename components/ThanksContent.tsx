"use client";

import { useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { copy } from "@/lib/copy";
import ThanksImageSlot from "./ThanksImageSlot";

// צבעי המותג - הקונפטי חייב להרגיש חלק מהעיצוב, לא סטיקר עליו
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
   * 1. פיצוץ מרכזי רחב - הרגע עצמו
   * 2. שתי תותחים מהצדדים בהשהיה - מילוי הפריים
   * 3. נשורת חלקיקים איטית ~2.5 שניות - הזנב היוקרתי שמונע תחושת "פופ" זול
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
        // 1 - הפיצוץ המרכזי, מעט מתחת לאמצע כדי לעלות אל התמונה
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
        // 2 - תותחי צד
        fire({ ...base, particleCount: 55, angle: 55, spread: 65, startVelocity: 50, origin: { x: 0, y: 0.75 } });
        fire({ ...base, particleCount: 55, angle: 125, spread: 65, startVelocity: 50, origin: { x: 1, y: 0.75 } });
      }, 620)
    );

    timers.push(
      setTimeout(() => {
        // 3 - נשורת עדינה: חלקיקים קטנים, כבידה נמוכה, ריחוף הצידה
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
          {/* שכבת הקונפטי - מעל התוכן, שקופה ללחיצות */}
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
            {/* הקריאייטיב הוא האישור עצמו - הווי והכותרת כבר בתוכו */}
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
                fontSize: "clamp(1.08rem, 2.3vw, 1.2rem)",
                color: "#aab4c8",
                lineHeight: 1.8,
                margin: "0 0 clamp(28px, 4vw, 40px)",
                whiteSpace: "pre-line",
              }}
            >
              {thanks.sub}
            </m.p>

            {/* בלוק ההכנה: מנגנון המחויבות שמעלה את אחוז ההגעה לפגישה */}
            <m.div
              {...rise(0.72)}
              style={{
                display: "inline-block",
                maxWidth: 560,
                background:
                  "linear-gradient(180deg, rgba(77, 141, 255, 0.09) 0%, rgba(77, 141, 255, 0.04) 100%)",
                border: "1px solid rgba(77, 141, 255, 0.32)",
                borderRadius: 18,
                padding: "clamp(22px, 4vw, 30px) clamp(22px, 5vw, 36px)",
                boxShadow: "0 0 40px rgba(77, 141, 255, 0.08)",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(1.06rem, 2.2vw, 1.16rem)",
                  fontWeight: 600,
                  color: "#ffffff",
                  lineHeight: 1.85,
                  whiteSpace: "pre-line",
                  margin: "0 0 20px",
                }}
              >
                {thanks.prep.question}
              </p>

              <a
                className="wa-btn"
                href={`https://wa.me/${copy.whatsapp.number}?text=${encodeURIComponent(
                  copy.whatsapp.prefill
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
                  <path
                    fill="currentColor"
                    d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"
                  />
                  <path
                    fill="currentColor"
                    d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22z"
                  />
                </svg>
                <span>{thanks.prep.ctaLabel}</span>
              </a>

              <p
                style={{
                  fontSize: "clamp(0.94rem, 2.1vw, 1rem)",
                  color: "#9aa6ba",
                  margin: "14px 0 0",
                }}
              >
                {thanks.prep.ctaNote}
              </p>
            </m.div>
          </div>
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
