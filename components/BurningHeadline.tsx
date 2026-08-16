"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { copy } from "@/lib/copy";

/**
 * הכותרת הבוערת.
 *
 * ההתנהגות:
 * - בנחיתה: שתי השורות נכנסות בכחול, ואז "שורף כסף?״" נדלקת באדום-כתום,
 *   ומתחתיה נופלים שטרות דולר שנאכלים באש תוך כדי נפילה.
 * - בגלילה הראשונה למטה: האש כבה בעדינות (חזרה לכחול המותג),
 *   וממשיכים לרחף מטה רק שטרות חרוכים, בקצב נמוך.
 * - בחזרה לראש הדף: האש נדלקת שוב.
 *
 * מכבד prefers-reduced-motion: כותרת אש סטטית, בלי שטרות.
 */

type Bill = {
  baseX: number;
  y: number;
  vy: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  rotBase: number;
  rotAmp: number;
  rotFreq: number;
  rotPhase: number;
  w: number;
  burn: number;
  burnRate: number;
  charred: boolean;
  fromLeft: boolean;
  notches: number[];
  age: number;
};

// כמה השטר נופל מתחת לכותרת לפני שהוא נעלם
const FALL_ZONE = 340;
const MAX_BILLS = 14;

// עוזר לציור מלבן מעוגל, עם נפילה לאחור לדפדפנים בלי roundRect
function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

export default function BurningHeadline() {
  const { hero } = copy;
  const reduced = useReducedMotion();
  const [lit, setLit] = useState(false);
  const modeRef = useRef<"off" | "fire" | "ember">("off");
  const hostRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // הצתה ראשונית + כיבוי/הצתה לפי מיקום הגלילה, עם היסטרזיס נגד ריצודים
  useEffect(() => {
    if (reduced) {
      setLit(true);
      return;
    }
    let ignited = false;
    let atTop = true;

    const update = () => {
      const y = window.scrollY;
      if (atTop && y > 60) atTop = false;
      else if (!atTop && y < 12) atTop = true;
      const next = ignited && atTop;
      modeRef.current = !ignited ? "off" : next ? "fire" : "ember";
      setLit((prev) => (prev === next ? prev : next));
    };

    const t = setTimeout(() => {
      ignited = true;
      update();
    }, 1050);

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update);
    };
  }, [reduced]);

  // מנוע השטרות
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const line = lineRef.current;
    if (!canvas || !host || !line) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const bills: Bill[] = [];

    const spawn = (charred: boolean) => {
      if (bills.length >= MAX_BILLS) return;
      const hostRect = host.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const w = 34 + Math.random() * 22;
      bills.push({
        baseX: lineRect.left - hostRect.left + Math.random() * lineRect.width,
        y: lineRect.bottom - hostRect.top - lineRect.height * 0.22,
        vy: (charred ? 0.34 : 0.42) + Math.random() * 0.3,
        swayAmp: 10 + Math.random() * 16,
        swayFreq: 0.45 + Math.random() * 0.4,
        swayPhase: Math.random() * Math.PI * 2,
        rotBase: (Math.random() - 0.5) * 0.5,
        rotAmp: 0.22 + Math.random() * 0.2,
        rotFreq: 0.3 + Math.random() * 0.3,
        rotPhase: Math.random() * Math.PI * 2,
        w,
        burn: charred ? 0.32 + Math.random() * 0.26 : 0.04,
        burnRate: charred ? 0 : 0.0022 + Math.random() * 0.0014,
        charred,
        fromLeft: Math.random() < 0.5,
        notches: Array.from({ length: 7 }, () => Math.random()),
        age: 0,
      });
    };

    const drawBill = (b: Bill, now: number) => {
      const h = b.w * 0.46;
      const t = now / 1000;
      const x = b.baseX + Math.sin(t * b.swayFreq * Math.PI * 2 + b.swayPhase) * b.swayAmp;
      const rot =
        b.rotBase + Math.sin(t * b.rotFreq * Math.PI * 2 + b.rotPhase) * b.rotAmp;

      // דהייה בכניסה, וגם לקראת תחתית אזור הנפילה
      const zoneH = canvas.height / dpr;
      const fadeIn = Math.min(1, b.age / 500);
      const fadeOut = Math.min(1, Math.max(0, (zoneH - b.y) / 90));
      const ashFade = b.burn >= 0.97 ? Math.max(0, (1 - b.burn) / 0.03) : 1;
      const alpha = 0.92 * fadeIn * fadeOut * ashFade;
      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(x, b.y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      // גוף השטר: ירקרק-קרם עדין, כהה יותר אם הוא חרוך
      const bodyLight = b.charred ? "#a8ad9c" : "#d8ddc9";
      const bodyDark = b.charred ? "#8e947f" : "#c2c9ae";
      const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      grad.addColorStop(0, bodyLight);
      grad.addColorStop(1, bodyDark);
      rrect(ctx, -b.w / 2, -h / 2, b.w, h, 2.5);
      ctx.fillStyle = grad;
      ctx.fill();

      // מסגרת פנימית + עיגול מרכזי + $ : השפה הוויזואלית של שטר, במינימום קווים
      ctx.strokeStyle = "rgba(74, 96, 72, 0.75)";
      ctx.lineWidth = 1;
      rrect(ctx, -b.w / 2 + 2.5, -h / 2 + 2.5, b.w - 5, h - 5, 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, h * 0.34, h * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(58, 82, 56, 0.9)";
      ctx.font = `700 ${h * 0.42}px "Segoe UI", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 0.5);

      // אזור הבעירה: פוליגון משונן שאוכל את השטר מאחד הצדדים
      if (b.burn > 0.02) {
        const dir = b.fromLeft ? 1 : -1;
        const edge = b.fromLeft ? -b.w / 2 : b.w / 2;
        const burnX = edge + dir * b.burn * (b.w + 6);

        ctx.beginPath();
        ctx.moveTo(edge, -h / 2 - 1);
        const steps = b.notches.length;
        for (let i = 0; i <= steps; i++) {
          const yy = -h / 2 + (h + 2) * (i / steps) - 1;
          const jag = (b.notches[Math.min(i, steps - 1)] - 0.5) * 7;
          ctx.lineTo(burnX + jag * dir, yy);
        }
        ctx.lineTo(edge, h / 2 + 1);
        ctx.closePath();

        const charGrad = ctx.createLinearGradient(burnX, 0, edge, 0);
        charGrad.addColorStop(0, "#2a1c12");
        charGrad.addColorStop(0.35, "#150d08");
        charGrad.addColorStop(1, "#070403");
        ctx.fillStyle = charGrad;
        ctx.fill();

        // קו הגחלת: זוהר כשיש אש, עמום כשחרוך
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const yy = -h / 2 + (h + 2) * (i / steps) - 1;
          const jag = (b.notches[Math.min(i, steps - 1)] - 0.5) * 7;
          if (i === 0) ctx.moveTo(burnX + jag * dir, yy);
          else ctx.lineTo(burnX + jag * dir, yy);
        }
        if (!b.charred && b.burn < 0.96) {
          const flick = 0.75 + 0.25 * Math.sin(now / 90 + b.swayPhase * 7);
          ctx.strokeStyle = `rgba(255, 122, 30, ${0.9 * flick})`;
          ctx.lineWidth = 1.7;
          ctx.shadowColor = "rgba(255, 120, 30, 0.9)";
          ctx.shadowBlur = 11 * flick;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(255, 214, 130, ${0.8 * flick})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(66, 48, 36, 0.85)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    let sinceSpawn = 0;

    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const mode = modeRef.current;

      // מחוץ למסך: לא מציירים ולא מולידים, רק ממשיכים להאזין
      if (window.scrollY > window.innerHeight * 1.3) {
        if (bills.length) {
          bills.length = 0;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      sinceSpawn += dt;
      const interval = mode === "fire" ? 480 : 1500;
      if (mode !== "off" && sinceSpawn > interval && !document.hidden) {
        sinceSpawn = 0;
        spawn(mode === "ember");
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      for (let i = bills.length - 1; i >= 0; i--) {
        const b = bills[i];
        b.age += dt;
        b.y += b.vy * (dt / 16);
        if (!b.charred) b.burn = Math.min(1, b.burn + b.burnRate * dt);

        const zoneH = canvas.height / dpr;
        if (b.y > zoneH + 30 || b.burn >= 1) {
          bills.splice(i, 1);
          continue;
        }
        drawBill(b, now);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <div ref={hostRef} className="burn-host">
      <canvas ref={canvasRef} className="burn-canvas" aria-hidden />
      <h1 className="hero-h1">
        <span className="hero-h1-a">{hero.h1Line1}</span>
        <span ref={lineRef} className={`hero-h1-b${lit ? " is-lit" : ""}`}>
          <span className="burn-cool" aria-hidden>
            {hero.h1Line2}
          </span>
          <span className="burn-hot">{hero.h1Line2}</span>
        </span>
      </h1>
    </div>
  );
}
