"use client";

import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { copy } from "@/lib/copy";
import ThanksImageSlot from "./ThanksImageSlot";

// בלוני החגיגה — כמו ברפרנס: עפים מלמטה למעלה פעם אחת
const BALLOONS = [
  { emoji: "🎈", left: "8%", delay: 0.2, duration: 7 },
  { emoji: "🎉", left: "22%", delay: 1.1, duration: 6.2 },
  { emoji: "🎈", left: "38%", delay: 0.6, duration: 7.6 },
  { emoji: "🎈", left: "62%", delay: 1.5, duration: 6.6 },
  { emoji: "🎉", left: "78%", delay: 0.4, duration: 7.2 },
  { emoji: "🎈", left: "92%", delay: 0.9, duration: 6.4 },
];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function ThanksContent() {
  const reduced = useReducedMotion();
  const { thanks } = copy;
  // הבלונים מרונדרים רק אחרי mount — מונע hydration mismatch עם reduced-motion
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // פיצוץ קונפטי חד-פעמי בצבעי המותג — כמו ברפרנס
  useEffect(() => {
    if (reduced) return;
    const colors = ["#4d8dff", "#8ab4ff", "#2f6bff", "#ffffff"];
    const t = setTimeout(() => {
      confetti({ particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.55 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true });
    }, 400);
    return () => {
      clearTimeout(t);
      confetti.reset();
    };
  }, [reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
      {/* שכבת הבלונים */}
      {mounted && !reduced && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {BALLOONS.map((b, i) => (
            <m.div
              key={i}
              initial={{ y: "110vh", opacity: 0 }}
              animate={{ y: "-25vh", opacity: [0, 1, 1, 0] }}
              transition={{
                delay: b.delay,
                duration: b.duration,
                ease: "linear",
                times: [0, 0.1, 0.85, 1],
              }}
              style={{
                position: "absolute",
                left: b.left,
                fontSize: 44,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            >
              {b.emoji}
            </m.div>
          ))}
        </div>
      )}

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
          padding: "60px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 900px 600px at 50% 40%, rgba(77, 141, 255, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1040, width: "100%" }}>
          {/* תג ה-✓ הקופץ */}
          <m.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            style={{
              width: 88,
              height: 88,
              margin: "0 auto 28px",
              borderRadius: "50%",
              background: "rgba(77, 141, 255, 0.1)",
              border: "2px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              color: "var(--accent)",
              fontWeight: 800,
            }}
          >
            ✓
          </m.div>

          <m.h1
            {...rise(0.35)}
            style={{
              fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 16,
              color: "#ffffff",
            }}
          >
            {thanks.h1}
          </m.h1>

          <m.p
            {...rise(0.5)}
            style={{
              fontSize: "clamp(1.05rem, 1.9vw, 1.2rem)",
              color: "#aab4c8",
              lineHeight: 1.8,
              margin: "0 0 40px",
              whiteSpace: "pre-line",
            }}
          >
            {thanks.sub}
          </m.p>

          {/* בלוק ההכנה — מנגנון המחויבות שמעלה show-rate */}
          <m.div
            {...rise(0.6)}
            style={{
              display: "inline-block",
              background: "rgba(77, 141, 255, 0.06)",
              border: "1px solid rgba(77, 141, 255, 0.3)",
              borderRadius: 14,
              padding: "22px 32px",
              margin: "0 auto 44px",
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.85,
              whiteSpace: "pre-line",
            }}
          >
            {thanks.prep}
          </m.div>

          <m.div
            className="media-frame"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow:
                "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(77, 141, 255, 0.2), 0 0 40px rgba(77, 141, 255, 0.12)",
            }}
          >
            <ThanksImageSlot alt={thanks.imageAlt} />
          </m.div>
        </div>
      </main>
      </LazyMotion>
    </MotionConfig>
  );
}
