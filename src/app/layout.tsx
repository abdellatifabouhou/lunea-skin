import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@/components/Analytics";
import { PRODUCT, SITE } from "@/lib/config";
import "./globals.css";

const title = "سيروم نياسيناميد LUNÉA SKIN — للبشرة الدهنية والمسام وآثار الحبوب | 149 درهم، الدفع عند الاستلام";
const description =
  "سيروم نياسيناميد خفيف من LUNÉA SKIN كيعاون على توازن مظهر الزيوت، تحسين مظهر المسام وآثار الحبوب وتوحيد مظهر البشرة. 149 درهم، التوصيل لجميع المدن المغربية، كتخلص غير ملي يوصلك الطلب.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title,
  description,
  alternates: { canonical: "/" },
  keywords: ["Niacinamide Serum Morocco", "سيروم نياسيناميد", "سيروم للبشرة الدهنية", "سيروم للمسام", "سيروم آثار الحبوب", "LUNÉA SKIN"],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.domain,
    siteName: SITE.brand,
    title,
    description,
    images: [{ url: "/images/product-hero.jpg", width: 1024, height: 1024, alt: `${SITE.brand} ${PRODUCT.name}` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/product-hero.jpg"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Cormorant+Garamond:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <a href="#order" className="sr-only-focusable fixed top-2 right-2 z-[100] rounded-full bg-sage-700 px-4 py-2 text-white">
          الانتقال إلى نموذج الطلب
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
