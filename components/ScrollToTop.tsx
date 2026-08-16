"use client";

import { useEffect } from "react";

/**
 * הדף תמיד נפתח מלמעלה.
 * הדפדפן משחזר מיקום גלילה ברענון או בחזרה אחורה, וזה שובר את רגע
 * הפתיחה של ההירו. מבטלים את השחזור וגוללים למעלה, אלא אם הגולש
 * הגיע במכוון לעוגן (למשל #form).
 */
export default function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);

  return null;
}
