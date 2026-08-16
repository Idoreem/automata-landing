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
  flameIdx: number[];
  flameSeeds: number[];
  age: number;
};

// מקסימום שטרות חיים בו-זמנית. מעט ובכוונה
const MAX_BILLS = 4;

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

  // ההצתה קורית רק חצי שנייה אחרי המגע הראשון של הגולש בדף.
  // לפני כן - שום דבר לא בוער. ואז: כיבוי בגלילה למטה, הצתה מחדש בראש הדף.
  useEffect(() => {
    if (reduced) {
      setLit(true);
      return;
    }
    let ignited = false;
    let atTop = true;
    let igniteTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const y = window.scrollY;
      if (atTop && y > 60) atTop = false;
      else if (!atTop && y < 12) atTop = true;
      const next = ignited && atTop;
      modeRef.current = !ignited ? "off" : next ? "fire" : "ember";
      setLit((prev) => (prev === next ? prev : next));
    };

    const INTERACTIONS: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "mousemove",
      "wheel",
      "scroll",
      "keydown",
    ];

    const onFirstTouch = () => {
      INTERACTIONS.forEach((ev) => window.removeEventListener(ev, onFirstTouch));
      igniteTimer = setTimeout(() => {
        ignited = true;
        update();
      }, 500);
    };

    INTERACTIONS.forEach((ev) =>
      window.addEventListener(ev, onFirstTouch, { passive: true })
    );
    window.addEventListener("scroll", update, { passive: true });
    update();

    // אם הגולש כבר גלל לפני שהקוד נטען, המגע הראשון כבר קרה ואבד לנו.
    // הגלילה עצמה היא הראיה, אז מדליקים גם במקרה הזה
    if (window.scrollY > 0) onFirstTouch();

    return () => {
      if (igniteTimer) clearTimeout(igniteTimer);
      INTERACTIONS.forEach((ev) => window.removeEventListener(ev, onFirstTouch));
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

    // גבול הנפילה: השטרות נמוגים בגובה השורה השנייה של תת-הכותרת
    // ("אתה משלם משכורות מלאות."). נמדד מהדף עצמו, לא מספר קבוע
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = host.getBoundingClientRect();

      let fallZone = 110;
      const sub = document.getElementById("hero-sub");
      if (sub) {
        const subRect = sub.getBoundingClientRect();
        const lineH = parseFloat(getComputedStyle(sub).lineHeight) || 32;
        fallZone = Math.max(60, subRect.top - r.bottom + lineH * 2);
      }

      const h = r.height + fallZone;
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
      const w = 27 + Math.random() * 16;
      bills.push({
        baseX: lineRect.left - hostRect.left + Math.random() * lineRect.width,
        y: lineRect.bottom - hostRect.top - lineRect.height * 0.22,
        vy: (charred ? 0.3 : 0.36) + Math.random() * 0.24,
        swayAmp: 10 + Math.random() * 16,
        swayFreq: 0.4 + Math.random() * 0.35,
        swayPhase: Math.random() * Math.PI * 2,
        rotBase: (Math.random() - 0.5) * 0.5,
        rotAmp: 0.2 + Math.random() * 0.18,
        rotFreq: 0.26 + Math.random() * 0.26,
        rotPhase: Math.random() * Math.PI * 2,
        w,
        burn: charred ? 0.32 + Math.random() * 0.26 : 0.03,
        // מכויל למסע: השטר נאכל בהדרגה ומגיע שרוף לשורה השנייה של תת-הכותרת
        burnRate: charred ? 0 : 0.00016 + Math.random() * 0.00007,
        charred,
        fromLeft: Math.random() < 0.5,
        notches: Array.from({ length: 7 }, () => Math.random()),
        // 3 נקודות עיגון ללשונות האש לאורך קו הבעירה
        flameIdx: [1, 3, 5].map((i) => Math.min(6, i + Math.floor(Math.random() * 2))),
        flameSeeds: Array.from({ length: 3 }, () => Math.random() * 10),
        age: 0,
      });
    };

    // לשון אש בודדת: ליבה לבנה-צהובה, גוף כתום, קצה אדום שנמוג. תמיד פונה מעלה
    const drawFlame = (wx: number, wy: number, hf: number, seed: number, now: number) => {
      const sway =
        Math.sin(now / 150 + seed * 9) * hf * 0.16 +
        Math.sin(now / 61 + seed * 3.7) * hf * 0.08;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // הילת חום רכה
      const glow = ctx.createRadialGradient(wx, wy - hf * 0.3, 0, wx, wy - hf * 0.3, hf * 1.2);
      glow.addColorStop(0, "rgba(255, 118, 28, 0.26)");
      glow.addColorStop(1, "rgba(255, 60, 10, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(wx, wy - hf * 0.3, hf * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // גוף הלהבה
      const body = ctx.createLinearGradient(wx, wy, wx, wy - hf);
      body.addColorStop(0, "rgba(255, 236, 168, 0.92)");
      body.addColorStop(0.45, "rgba(255, 156, 38, 0.8)");
      body.addColorStop(1, "rgba(255, 58, 12, 0)");
      ctx.beginPath();
      ctx.moveTo(wx - hf * 0.22, wy);
      ctx.quadraticCurveTo(wx - hf * 0.27, wy - hf * 0.46, wx + sway, wy - hf);
      ctx.quadraticCurveTo(wx + hf * 0.27, wy - hf * 0.46, wx + hf * 0.22, wy);
      ctx.closePath();
      ctx.fillStyle = body;
      ctx.fill();

      // ליבה חמה
      const core = ctx.createLinearGradient(wx, wy, wx, wy - hf * 0.55);
      core.addColorStop(0, "rgba(255, 250, 222, 0.9)");
      core.addColorStop(1, "rgba(255, 204, 96, 0)");
      ctx.beginPath();
      ctx.moveTo(wx - hf * 0.1, wy);
      ctx.quadraticCurveTo(wx - hf * 0.12, wy - hf * 0.26, wx + sway * 0.5, wy - hf * 0.55);
      ctx.quadraticCurveTo(wx + hf * 0.12, wy - hf * 0.26, wx + hf * 0.1, wy);
      ctx.closePath();
      ctx.fillStyle = core;
      ctx.fill();

      ctx.restore();
    };

    const drawBill = (b: Bill, now: number, mode: "off" | "fire" | "ember") => {
      const h = b.w * 0.46;
      const t = now / 1000;
      const x = b.baseX + Math.sin(t * b.swayFreq * Math.PI * 2 + b.swayPhase) * b.swayAmp;
      const rot =
        b.rotBase + Math.sin(t * b.rotFreq * Math.PI * 2 + b.rotPhase) * b.rotAmp;

      // בוער באמת רק כשהאש דולקת; אחרי כיבוי הכל חרוך ושקט
      const burningVisual = mode === "fire" && !b.charred && b.burn < 0.96;

      // דהייה בכניסה, וגם לקראת תחתית אזור הנפילה
      const zoneH = canvas.height / dpr;
      const fadeIn = Math.min(1, b.age / 500);
      const fadeOut = Math.min(1, Math.max(0, (zoneH - b.y) / 38));
      const ashFade = b.burn >= 0.95 ? Math.max(0, (1 - b.burn) / 0.05) : 1;
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
        if (burningVisual) {
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

      // הלהבות: מצוירות במרחב העולם כדי שיפנו תמיד מעלה, גם כשהשטר מסתובב
      if (burningVisual && b.burn > 0.04) {
        const dir = b.fromLeft ? 1 : -1;
        const edge = b.fromLeft ? -b.w / 2 : b.w / 2;
        const burnX = edge + dir * b.burn * (b.w + 6);
        const steps = b.notches.length;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);

        ctx.save();
        ctx.globalAlpha = alpha;
        for (let f = 0; f < b.flameIdx.length; f++) {
          const i = b.flameIdx[f];
          const seed = b.flameSeeds[f];
          const yy = -h / 2 + (h + 2) * (i / steps) - 1;
          const jag = (b.notches[Math.min(i, steps - 1)] - 0.5) * 7;
          const px = burnX + jag * dir;
          const wx = x + px * cos - yy * sin;
          const wy = b.y + px * sin + yy * cos;

          // גובה הלהבה נושם: שני גלים בקצבים שונים במקום ריצוד מכני
          const breathe =
            (0.62 + 0.38 * (0.5 + 0.5 * Math.sin(now / 130 + seed * 5))) *
            (0.82 + 0.18 * Math.sin(now / 53 + seed * 2.3));
          const hf = (7 + b.w * 0.16) * breathe;
          drawFlame(wx, wy + 1.5, hf, seed, now);
        }
        ctx.restore();
      }
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
      const interval = mode === "fire" ? 2400 : 6000;
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
        // הבעירה מתקדמת רק כשהאש דולקת. כשהיא כבויה - הכל קפוא וחרוך
        if (!b.charred && mode === "fire") {
          b.burn = Math.min(1, b.burn + b.burnRate * dt);
        }

        const zoneH = canvas.height / dpr;
        if (b.y > zoneH + 30 || b.burn >= 1) {
          bills.splice(i, 1);
          continue;
        }
        drawBill(b, now, mode);
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
