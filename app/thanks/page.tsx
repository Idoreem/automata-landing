import type { Metadata } from "next";
import { copy } from "@/lib/copy";
import ThanksContent from "@/components/ThanksContent";
import Footer from "@/components/Footer";
import { PixelLeadEvent } from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: copy.thanks.title,
  description: copy.thanks.sub.split("\n").slice(0, 2).join(" "),
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <>
      <PixelLeadEvent />
      <ThanksContent />
      <Footer />
    </>
  );
}
