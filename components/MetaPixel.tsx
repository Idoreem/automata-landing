"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * פיקסל מטא.
 *
 * מה נורה: PageView בכל טעינה/ניווט, ואירוע Lead בכניסה לדף התודה
 * (ראה PixelLeadEvent בתחתית הקובץ - משולב בדף התודה).
 *
 * המזהה יושב כאן ולא במשתנה סביבה בכוונה: התחילית NEXT_PUBLIC_ נצרבת
 * לקוד שרץ בדפדפן, כלומר המזהה גלוי לכל גולש בכל מקרה ואין בו סוד.
 * להחלפה בלי נגיעה בקוד אפשר להגדיר NEXT_PUBLIC_META_PIXEL_ID ב-Vercel.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1628159481563841";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  // PageView בניווטי SPA (הטעינה הראשונה מכוסה בסקריפט האתחול)
  useEffect(() => {
    if (!PIXEL_ID) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/** החתימה שנכתבת ברגע השליחה, וסימון שהאירוע כבר נורה בפועל */
export const LEAD_KEY = "lead_submitted";
const FIRED_KEY = "lead_pixel_fired";

/** מזהה אירוע. crypto.randomUUID לא קיים בדפדפנים ישנים, ואסור שזה יפיל את המדידה */
export function newEventId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * יורה אירוע Lead. אם הסקריפט של מטא עוד לא נטען, ממתין לו במקום לוותר
 * בשקט - זו הייתה נקודת הכשל הקודמת. אותו eventID בכל ניסיון, כך שגם אם
 * האירוע נורה פעמיים (וגם מול CAPI בעתיד) מטא סופרת המרה אחת.
 */
export function trackLead(eventId: string): void {
  if (!PIXEL_ID || typeof window === "undefined") return;
  let tries = 0;
  const attempt = () => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {}, { eventID: eventId });
      try {
        sessionStorage.setItem(FIRED_KEY, eventId);
      } catch {}
      return;
    }
    if (tries++ < 30) setTimeout(attempt, 200); // עד 6 שניות המתנה
  };
  attempt();
}

/**
 * רשת ביטחון בדף התודה: יורה רק אם השליחה עצמה לא הספיקה לירות.
 * לא נורה על רענון או כניסה ישירה, כי בלי חתימה אין אירוע.
 */
export function PixelLeadEvent() {
  const handled = useRef(false);
  useEffect(() => {
    if (!PIXEL_ID || handled.current) return;
    handled.current = true;

    let eventId: string | null = null;
    let already: string | null = null;
    try {
      eventId = sessionStorage.getItem(LEAD_KEY);
      already = sessionStorage.getItem(FIRED_KEY);
    } catch {}
    if (!eventId) return;

    // החתימה נמחקת רק אחרי שהוכרע מה לעשות איתה
    const clear = () => {
      try {
        sessionStorage.removeItem(LEAD_KEY);
        sessionStorage.removeItem(FIRED_KEY);
      } catch {}
    };

    if (already === eventId) {
      clear(); // כבר נורה ברגע השליחה
      return;
    }
    trackLead(eventId);
    setTimeout(clear, 7000); // אחרי שחלון ההמתנה ל-fbq נסגר
  }, []);
  return null;
}
