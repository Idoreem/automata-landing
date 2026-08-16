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

/**
 * אירוע ההמרה - נורה רק אחרי שליחת טופס אמיתית (חתימה ב-sessionStorage),
 * לא על רענון או כניסה ישירה לדף התודה. eventID ייחודי מוכן לדדופליקציה מול CAPI.
 */
export function PixelLeadEvent() {
  const fired = useRef(false);
  useEffect(() => {
    if (!PIXEL_ID || fired.current) return;
    let eventId: string | null = null;
    try {
      eventId = sessionStorage.getItem("lead_submitted");
      if (eventId) sessionStorage.removeItem("lead_submitted");
    } catch {}
    if (!eventId) return;
    fired.current = true;
    window.fbq?.("track", "Lead", {}, { eventID: eventId });
  }, []);
  return null;
}
