import Image from "next/image";
import thanks from "@/assets/thanks.png";

/**
 * תמונת דף התודה — הקריאייטיב הייעודי ("קיבלנו את הפרטים שלך").
 * להחלפה: דורסים את assets/thanks.png.
 */
export default function ThanksImageSlot({ alt }: { alt: string }) {
  return (
    <Image
      src={thanks}
      alt={alt}
      priority
      placeholder="blur"
      sizes="(max-width: 900px) 100vw, 880px"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
