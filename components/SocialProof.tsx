"use client";

import { useRef, useState } from "react";
import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";

/**
 * סקשן העדויות - 3 סרטונים + 4 תמונות.
 *
 * להוספת סרטון אמיתי:
 * 1. שים את הקובץ ב-public/testimonials/ (למשל video1.mp4 + פוסטר video1.jpg)
 * 2. עדכן את המערך: { src: "/testimonials/video1.mp4", poster: "/testimonials/video1.jpg" }
 *
 * להוספת תמונה: שים ב-public/testimonials/ ועדכן את PHOTOS.
 * סלוט עם null מציג פלייסהולדר מעוצב עד שהמדיה מוכנה.
 */
const VIDEOS: { src: string | null; poster: string | null; captions: string | null }[] = [
  { src: null, poster: null, captions: null },
  { src: null, poster: null, captions: null },
  { src: null, poster: null, captions: null },
];

const PHOTOS: { src: string | null; alt: string }[] = [
  { src: null, alt: "עידו ראם" },
  { src: null, alt: "מאור" },
  { src: null, alt: "מאחורי הקלעים" },
  { src: null, alt: "עבודה עם בעלי עסקים" },
];

function PlayIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
      <circle cx="26" cy="26" r="25" stroke="rgba(138, 180, 255, 0.65)" strokeWidth="1.5" fill="rgba(2, 6, 15, 0.45)" />
      <path d="M21 17.5v17l14-8.5-14-8.5z" fill="rgba(138, 180, 255, 0.9)" />
    </svg>
  );
}

const rise = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6 },
} as const;

/**
 * הסקשן מוצג רק כשיש לפחות פריט מדיה אמיתי אחד - קופסאות ריקות באתר חי
 * פוגעות באמון יותר משהן עוזרות. לתצוגה מקדימה של העיצוב בלי מדיה:
 * שנה זמנית ל-true.
 */
const SHOW_WITH_PLACEHOLDERS = false;

export default function SocialProof() {
  const { socialProof } = copy;
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const hasMedia = VIDEOS.some((v) => v.src) || PHOTOS.some((p) => p.src);

  // הכרטיס הפעיל = זה שמרכזו הכי קרוב למרכז המסילה (נכון בכל רוחב מסך)
  function onRailScroll() {
    const rail = railRef.current;
    if (!rail) return;
    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>(".sp-video"));
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - railCenter);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }

  function scrollToCard(i: number) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelectorAll<HTMLElement>(".sp-video")[i];
    if (!card) return;
    rail.scrollTo({
      left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  }

  if (!hasMedia && !SHOW_WITH_PLACEHOLDERS) return null;

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
      <section
        style={{
          position: "relative",
          padding: "clamp(64px, 10vw, 110px) 0",
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 800px 500px at 50% 20%, rgba(77, 141, 255, 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <m.h2
            {...rise}
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.3,
              textAlign: "center",
              margin: "0 0 10px",
              padding: "0 24px",
            }}
          >
            {socialProof.h2}
          </m.h2>
          <m.p
            {...rise}
            style={{
              fontSize: "clamp(0.95rem, 1.7vw, 1.15rem)",
              color: "#aab4c8",
              textAlign: "center",
              margin: "0 0 30px",
              padding: "0 24px",
            }}
          >
            {socialProof.subtext}
          </m.p>

          {/* סרטוני עדות - קרוסלת החלקה במובייל, שלישייה בדסקטופ */}
          <m.div
            {...rise}
            className="sp-videos"
            dir="ltr"
            ref={railRef}
            onScroll={onRailScroll}
            role="region"
            aria-label={copy.ui.videosRegionLabel}
          >
            {VIDEOS.map((v, i) => (
              <div className="sp-video" key={i} dir="rtl">
                {v.src ? (
                  <video src={v.src} poster={v.poster ?? undefined} controls playsInline preload="metadata">
                    {v.captions && (
                      <track kind="captions" srcLang="he" label="עברית" default src={v.captions} />
                    )}
                  </video>
                ) : (
                  <div className="sp-ghost">
                    <PlayIcon />
                    <span>{copy.ui.videoPlaceholder}</span>
                  </div>
                )}
              </div>
            ))}
          </m.div>
          <div className="sp-dots" dir="ltr">
            {VIDEOS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`sp-dot${active === i ? " active" : ""}`}
                aria-label={`${copy.ui.videoDotLabel} ${i + 1}`}
                aria-current={active === i ? "true" : undefined}
                onClick={() => scrollToCard(i)}
              />
            ))}
          </div>

          {/* תמונות */}
          <m.div {...rise} className="sp-photos">
            {PHOTOS.map((p, i) => (
              <div className="sp-photo" key={i}>
                {p.src ? (
                  <img src={p.src} alt={p.alt} loading="lazy" />
                ) : (
                  <div className="sp-ghost">
                    <span>{copy.ui.photoPlaceholder}</span>
                  </div>
                )}
              </div>
            ))}
          </m.div>
        </div>
      </section>
      </LazyMotion>
    </MotionConfig>
  );
}
