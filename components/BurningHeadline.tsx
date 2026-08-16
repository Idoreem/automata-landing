"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { copy } from "@/lib/copy";

/**
 * הכותרת הראשית עם אפקט הבעירה.
 *
 * הרצף: שתי השורות נכנסות בכחול המותג, ואז השורה השנייה "נדלקת"
 * (מעבר רך לגרדיאנט אש עם ריצוד חום), ומתחתיה מתחילים ליפול
 * סימני דולר שנשרפים בדרך למטה.
 *
 * מכבד prefers-reduced-motion: בלי ריצוד, בלי חלקיקים.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  life: number; // 0..1
  decay: number;
};

// מסלול הצבע של הדולר בדרך למטה: זהב → כתום → אדום → גחלת
const EMBER_STOPS: [number, number, number][] = [
  [255, 226, 138],
  [255, 168, 46],
  [255, 82, 24],
  [150, 34, 8],
];

function emberColor(life: number): [number, number, number] {
  const t = Math.min(0.999, Math.max(0, 1 - life)) * (EMBER_STOPS.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = EMBER_STOPS[i];
  const b = EMBER_STOPS[Math.min(EMBER_STOPS.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export default function BurningHeadline() {
  const { hero } = copy;
  const reduced = useReducedMotion();
  const [ignited, setIgnited] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ההצתה: מעט אחרי שהכותרת נכנסה
  useEffect(() => {
    if (reduced) {
      setIgnited(true);
      return;
    }
    const t = setTimeout(() => setIgnited(true), 1050);
    return () => clearTimeout(t);
  }, [reduced]);

  // הדולרים הבוערים
  useEffect(() => {
    if (reduced || !ignited) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const line = lineRef.current;
    if (!canvas || !host || !line) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // הקנבס נמשך הרבה מתחת לכותרת כדי שלדולרים יהיה מרחק אמיתי ליפול ולהישרף בו
    const FALL_ZONE = 320;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = host.getBoundingClientRect();
      const h = r.height + FALL_ZONE;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const MAX = 26;

    const spawn = () => {
      if (particles.length >= MAX) return;
      const hostRect = host.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      // נקודת לידה: לאורך תחתית השורה הבוערת
      const x = lineRect.left - hostRect.left + Math.random() * lineRect.width;
      const y = lineRect.bottom - hostRect.top - lineRect.height * 0.18;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.35 + Math.random() * 0.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.05,
        size: 14 + Math.random() * 14,
        life: 1,
        decay: 0.0032 + Math.random() * 0.0026,
      });
    };

    let raf = 0;
    let last = performance.now();
    let sinceSpawn = 0;

    const tick = (now: number) => {
      const dt = Math.min(34, now - last);
      last = now;
      sinceSpawn += dt;

      // קצב לידה דליל בכוונה: רומז על שריפה, לא מציף את המסך
      if (sinceSpawn > 240) {
        sinceSpawn = 0;
        if (!document.hidden) spawn();
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.012 * (dt / 16);
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.rot += p.vrot * (dt / 16);
        p.life -= p.decay * (dt / 16);

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const [r, g, b] = emberColor(p.life);
        const alpha = p.life < 0.35 ? p.life / 0.35 : 1;
        const scale = 0.75 + p.life * 0.25;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
        ctx.shadowBlur = 14 * p.life + 4;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.font = `700 ${p.size * scale}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [ignited, reduced]);

  return (
    <div ref={hostRef} className="burn-host">
      <canvas ref={canvasRef} className="burn-canvas" aria-hidden />
      <h1 className="hero-h1">
        <span className="hero-h1-a">{hero.h1Line1}</span>
        <span ref={lineRef} className={`hero-h1-b${ignited ? " is-lit" : ""}`}>
          {/* שתי שכבות זהות: הכחולה דועכת והאש עולה במקומה */}
          <span className="burn-cool" aria-hidden>
            {hero.h1Line2}
          </span>
          <span className="burn-hot">{hero.h1Line2}</span>
        </span>
      </h1>
    </div>
  );
}
