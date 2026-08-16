import type { Metadata, Viewport } from "next";
import { Assistant } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { copy } from "@/lib/copy";
import { BASE_PATH, SITE_URL } from "@/lib/site";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: copy.title,
  description: copy.metaDescription,
  alternates: { canonical: "./" },
  formatDetection: { telephone: false },
  openGraph: {
    title: copy.title,
    description: copy.metaDescription,
    siteName: "Automata",
    locale: "he_IL",
    type: "website",
    images: [{ url: `${BASE_PATH}/og.png`, width: 1200, height: 630, alt: copy.offerName }],
  },
  twitter: {
    card: "summary_large_image",
    title: copy.title,
    description: copy.metaDescription,
    images: [`${BASE_PATH}/og.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#02060f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.className} antialiased`}>
        <MetaPixel />
        <Analytics />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Automata",
              description: "ארכיטקטורה טכנולוגית לעסקים - AI ואוטומציות",
              url: `${SITE_URL}${BASE_PATH}`,
              founder: [{ "@type": "Person", name: "עידו ראם" }],
            }),
          }}
        />
      </body>
    </html>
  );
}
