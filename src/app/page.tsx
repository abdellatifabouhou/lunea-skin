import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { OrderForm } from "@/components/OrderForm";
import { RevealObserver } from "@/components/Reveal";
import {
  BeforeAfterSection,
  BenefitsSection,
  FaqSection,
  HowToUseSection,
  IngredientsSection,
  OfferSection,
  ProblemSection,
  ShowcaseSection,
  SolutionSection,
  TestimonialsSection,
} from "@/components/Sections";
import { CTA, PRODUCT, SITE } from "@/lib/config";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE.brand} ${PRODUCT.name}`,
    alternateName: PRODUCT.nameAr,
    brand: { "@type": "Brand", name: SITE.brand },
    description: "سيروم نياسيناميد خفيف كيعاون على توازن مظهر الزيوت، تحسين مظهر المسام وآثار الحبوب وتوحيد مظهر البشرة.",
    image: [`${SITE.domain}/images/product-hero.jpg`],
    offers: {
      "@type": "Offer",
      url: SITE.domain,
      priceCurrency: PRODUCT.currency,
      price: PRODUCT.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      areaServed: "MA",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main id="main" className="pb-20 md:pb-0">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <BenefitsSection />
        <IngredientsSection />
        <HowToUseSection />
        <BeforeAfterSection />
        <TestimonialsSection />
        <ShowcaseSection />
        <OfferSection />

        {/* COD ORDER SECTION */}
        <section id="order" className="scroll-mt-16 bg-sage-50/70" aria-labelledby="order-title">
          <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20">
            <div className="reveal text-center">
              <p className="text-xs font-bold tracking-wide text-gold">الطلب</p>
              <h2 id="order-title" className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-4xl">
                عمّر المعلومات ديالك وأكد الطلب
              </h2>
              <p className="mt-3 text-ink-soft">{CTA.codNote} غادي نتصلو بيك لتأكيد الطلب قبل الإرسال.</p>
            </div>
            <div className="reveal mt-8">
              <OrderForm />
            </div>
          </div>
        </section>

        <FaqSection />
      </main>
      <Footer />

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-dark/70 bg-white/95 p-3 backdrop-blur md:hidden" role="region" aria-label="شريط الطلب السريع">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">{PRODUCT.nameAr}</p>
            <p className="text-lg font-extrabold text-sage-900">
              {PRODUCT.price} {PRODUCT.currencyAr}
            </p>
          </div>
          <a href="#order" className="btn-primary flex-1 !py-3 text-base">
            {CTA.primary}
          </a>
        </div>
      </div>
      <RevealObserver />
    </>
  );
}
