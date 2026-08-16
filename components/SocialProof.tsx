"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";
import { BASE_PATH } from "@/lib/site";

import posterA from "@/assets/testimonials/testimonial-video.jpg";
import posterB from "@/assets/testimonials/testimonial-video-3.jpg";
import posterC from "@/assets/testimonials/testimonial-video-2.jpg";
import shotThanks from "@/assets/testimonials/thanks.jpg";
import shotLeads from "@/assets/testimonials/leads.jpg";
import shotMaster from "@/assets/testimonials/master.jpg";
import shotValue from "@/assets/testimonials/value.jpg";

/**
 * סקשן העדויות: 3 המלצות מצולמות + 4 צילומי וואטסאפ.
 *
 * התוכן מגיע מהקומפוננטה המשותפת של האתר (js/results-section.js) ומותאם
 * כאן לעיצוב הדארק-נייבי של דף הנחיתה. הסדר בשורת הסרטונים זהה למקור.
 *
 * להחלפת מדיה: דורסים את הקובץ ב-assets/testimonials/ (תמונות) או
 * ב-public/testimonials/ (סרטונים). הקופי יושב ב-lib/copy.ts.
 */
const VIDEOS: { src: string; poster: StaticImageData }[] = [
  { src: `${BASE_PATH}/testimonials/testimonial-video.mp4`, poster: posterA },
  { src: `${BASE_PATH}/testimonials/testimonial-video-3.mp4`, poster: posterB },
  { src: `${BASE_PATH}/testimonials/testimonial-video-2.mp4`, poster: posterC },
];

const SHOTS: StaticImageData[] = [shotThanks, shotLeads, shotMaster, shotValue];

/* אייקון וואטסאפ - חוזר בכל כרטיס, בירוק המקורי של המותג */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 13.6c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.2z" />
    </svg>
  );
}

const rise = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6 },
} as const;

export default function SocialProof() {
  const { socialProof, ui } = copy;
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // הסרטונים מתנגנים רק כשהם בשדה הראייה. preload="none" משלים את זה:
  // 14MB של וידאו לא יורדים עד שגוללים לכאן.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const vids = Array.from(rail.querySelectorAll("video"));
    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const vid = en.target as HTMLVideoElement;
          if (en.isIntersecting) {
            void vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

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

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <section
          id="results"
          style={{
            position: "relative",
            padding: "clamp(38px, 5.5vw, 62px) 0",
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

            {/* המלצות מצולמות - קרוסלת החלקה במובייל, שלישייה בדסקטופ */}
            <m.div
              {...rise}
              className="sp-videos"
              dir="ltr"
              ref={railRef}
              onScroll={onRailScroll}
              role="region"
              aria-label={ui.videosRegionLabel}
            >
              {VIDEOS.map((v, i) => (
                <div className="sp-video" key={v.src} dir="rtl">
                  <video
                    src={v.src}
                    poster={v.poster.src}
                    aria-label={`${socialProof.videoAlt} ${i + 1}`}
                    controls
                    controlsList="nodownload"
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                </div>
              ))}
            </m.div>
            <div className="sp-dots" dir="ltr">
              {VIDEOS.map((v, i) => (
                <button
                  key={v.src}
                  type="button"
                  className={`sp-dot${active === i ? " active" : ""}`}
                  aria-label={`${ui.videoDotLabel} ${i + 1}`}
                  aria-current={active === i ? "true" : undefined}
                  onClick={() => scrollToCard(i)}
                />
              ))}
            </div>

            {/* צילומי וואטסאפ - נשארים כמו שהם, בלי חיתוך. האותנטיות היא הנכס */}
            <m.div {...rise} className="sp-shots">
              {socialProof.cards.map((card, i) => (
                <figure className="sp-shot" key={card.title}>
                  <figcaption>
                    <span className="sp-wa">
                      <WhatsAppIcon />
                    </span>
                    {card.title}
                  </figcaption>
                  <Image
                    src={SHOTS[i]}
                    alt={card.alt}
                    sizes="(max-width: 899px) 92vw, 440px"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </figure>
              ))}
            </m.div>
          </div>
        </section>
      </LazyMotion>
    </MotionConfig>
  );
}
