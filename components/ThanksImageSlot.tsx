import Image from "next/image";
import mockup from "@/assets/mockup.png";

/**
 * תמונת דף התודה — אותה תמונת נושא.
 * להחלפה בתמונה ייעודית: מוסיפים קובץ ל-assets ומעדכנים את ה-import.
 */
export default function ThanksImageSlot({ alt }: { alt: string }) {
  return (
    <Image
      src={mockup}
      alt={alt}
      placeholder="blur"
      sizes="(max-width: 900px) 92vw, 1040px"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
