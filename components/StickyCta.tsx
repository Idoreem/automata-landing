"use client";

import { useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";

/**
 * כפתור CTA צף למובייל בלבד.
 *
 * מופיע אחרי שגוללים מעבר להירו, ונעלם ברגע שהטופס עצמו על המסך
 * (כפתור שמכסה את הטופס שהוא מוביל אליו רק מפריע).
 *
 * שלושה דברים שחשוב לא לשבור כאן:
 *
 * 1. הצמדה לתחתית שרואים בפועל. במובייל שורת הכתובת של הדפדפן נכנסת
 *    ויוצאת בזמן גלילה, אבל position: fixed נצמד לגובה התיאורטי של הדף
 *    ולא לגובה שרואים. התוצאה: בגלילה למטה הפס יורד מתחת לקצה המסך.
 *    לכן מודדים את השטח הנראה (visualViewport) ומרימים את המעטפת בהפרש.
 *
 * 2. הבדיקה רצה בתוך requestAnimationFrame ולא בתוך אירוע הגלילה עצמו.
 *    קריאת מיקום אלמנט בכל אירוע scroll מכריחה את הדפדפן לחשב פריסה
 *    מחדש עשרות פעמים בשנייה, וזה מה שגרם לפס להישרך אחרי הגלילה.
 *
 * 3. יש מרווח בין נקודת ההופעה לנקודת ההיעלמות (היסטרזיס). בלי המרווח,
 *    גלילה קטנה סביב אותה נקודה מחליפה מצב שוב ושוב, והפס מחליק למעלה
 *    ולמטה בלי סוף.
 */
const SHOW_AT = 0.8; // מכפיל גובה מסך: מכאן ומטה הכפתור מופיע
const HIDE_AT = 0.55; // וחוזר להיעלם רק אם גוללים בחזרה מעל זה
const MAX_GAP = 400; // תקרת ביטחון להפרש, שערך חריג לא יזרוק את הפס למעלה

export default function StickyCta() {
  const [show, setShow] = useState(false);
  const shownRef = useRef(false);
  const gapRef = useRef(-1);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;

      // ההפרש בין תחתית הדף התיאורטית לתחתית השטח שהגולש רואה
      const vv = window.visualViewport;
      if (vv) {
        // בזום ידני (pinch) השטח הנראה קטן מסיבה אחרת לגמרי, ואז ההצמדה
        // הזאת רק תזרוק את הפס לאמצע המסך. במצב הזה משאירים אותו במקום.
        const zoomed = vv.scale > 1.05;
        const raw = zoomed
          ? 0
          : document.documentElement.clientHeight - (vv.height + vv.offsetTop);
        const gap = Math.min(MAX_GAP, Math.max(0, Math.round(raw)));
        if (gap !== gapRef.current) {
          gapRef.current = gap;
          document.documentElement.style.setProperty("--vv-gap", `${gap}px`);
        }
      }

      // הטופס נמצא על המסך, או שכבר עברנו אותו? אין צורך בכפתור
      const form = document.getElementById("form");
      const formReached = form
        ? form.getBoundingClientRect().top < vh * 0.88
        : false;

      let next: boolean;
      if (formReached) {
        next = false;
      } else if (shownRef.current) {
        next = y > vh * HIDE_AT;
      } else {
        next = y > vh * SHOW_AT;
      }

      if (next !== shownRef.current) {
        shownRef.current = next;
        setShow(next);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
    // כניסת שורת הכתובת או המקלדת משנה את השטח הנראה בלי אירוע גלילה
    const vv = window.visualViewport;
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    measure();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="sticky-shell">
      <div className={`sticky-cta${show ? " on" : ""}`} aria-hidden={!show}>
        <a href="#form" className="cta-btn" tabIndex={show ? 0 : -1}>
          {copy.hero.cta}
        </a>
      </div>
    </div>
  );
}
