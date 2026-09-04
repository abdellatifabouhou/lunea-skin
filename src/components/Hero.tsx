import Image from "next/image";
import { CTA, PRODUCT, formatPrice } from "@/lib/config";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-8 sm:px-6 md:grid-cols-2 md:gap-12 md:pb-24 md:pt-16">
        {/* Image first on mobile for immediate product recognition */}
        <div className="animate-fade-up relative order-1 md:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] bg-sand shadow-soft">
            <Image
              src="/images/product-hero.jpg"
              alt="قنينة سيروم نياسيناميد من LUNÉA SKIN على خلفية بيج فاتحة — صورة توضيحية"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 480px"
              className="object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink-soft backdrop-blur">
              صورة توضيحية للمنتج
            </span>
          </div>
          <div className="absolute -bottom-4 right-4 rounded-2xl border border-gold-light bg-white px-4 py-3 shadow-card md:right-8">
            <p className="text-xs text-ink-soft">الثمن</p>
            <p className="text-2xl font-extrabold text-sage-900">
              {PRODUCT.price} <span className="text-base font-bold">{PRODUCT.currencyAr}</span>
            </p>
          </div>
        </div>

        <div className="order-2 md:order-1">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-sage-300 bg-white/70 px-3 py-1 text-xs font-semibold text-sage-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden="true" />
            علامة مغربية للعناية بالبشرة
          </p>
          <h1 className="animate-fade-up delay-1 mt-4 text-[2rem] font-extrabold leading-[1.2] text-sage-900 sm:text-5xl">
            سيروم نياسيناميد
            <span className="mt-1 block text-xl font-bold text-ink-soft sm:text-2xl">للبشرة الدهنية، المسام، وآثار الحبوب</span>
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-lg text-base text-ink-soft sm:text-lg">
            سيروم خفيف كيعاون على توازن مظهر الزيوت فالوجه، كيحسن مظهر المسام وآثار الحبوب، وكيعطي البشرة مظهر موحّد ومشرق أكثر — بخطوة وحدة بسيطة فالروتين اليومي ديالك.
          </p>

          <ul className="animate-fade-up delay-2 mt-6 grid gap-2 text-sm font-medium text-ink sm:grid-cols-2">
            {["كيعاون على توازن مظهر الزيوت", "كيحسن مظهر المسام", "كيحسن مظهر آثار الحبوب", "بشرة بمظهر موحّد ومشرق"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckIcon />
                {b}
              </li>
            ))}
          </ul>

          <div className="animate-fade-up delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#order" className="btn-primary text-base">
              {CTA.primary} — {formatPrice(PRODUCT.price)}
            </a>
            <a href="#benefits" className="btn-outline text-base">
              شوف الفوائد
            </a>
          </div>

          <div className="animate-fade-up delay-3 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CashIcon /> الدفع عند الاستلام
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TruckIcon /> التوصيل لجميع المدن
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PhoneIcon /> تأكيد بالهاتف قبل الإرسال
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-sage-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}
export function CashIcon() {
  return (
    <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
export function TruckIcon() {
  return (
    <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}
export function PhoneIcon() {
  return (
    <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}
