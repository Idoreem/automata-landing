import Image from "next/image";
import mockup from "@/assets/mockup.png";

/**
 * תמונת הנושא בהירו — נטענת בעדיפות (LCP) עם בלר-אפ,
 * ומוגשת אוטומטית בגודל ובפורמט אופטימליים ע"י Vercel.
 * להחלפת התמונה: פשוט מחליפים את הקובץ assets/mockup.png.
 */
export default function MockupSlot() {
  return (
    <Image
      src={mockup}
      alt="פגישת אפיון AI לעסק שלך ב-30 דקות, ללא עלות — אוטומציות, בקרה וצמיחה | Automata"
      priority
      placeholder="blur"
      sizes="(max-width: 900px) 92vw, 680px"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
