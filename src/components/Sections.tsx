import Image from "next/image";
import { CTA, PRODUCT, formatPrice } from "@/lib/config";
import { CashIcon, CheckIcon, PhoneIcon, TruckIcon } from "./Hero";

function SectionHeader({ eyebrow, title, text, id }: { eyebrow: string; title: string; text?: string; id?: string }) {
  return (
    <div className="reveal mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-wide text-gold">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-3 text-base text-ink-soft sm:text-lg">{text}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function ProblemSection() {
  const problems = [
    { title: "بشرة بمظهر دهني", text: "الوجه كيلمع من بعد ساعات قليلة وكتحس بالزيوت زايدة." },
    { title: "مسام واضحة", text: "المسام كتبان بزاف خصوصاً فمنطقة الأنف والخدود." },
    { title: "آثار الحبوب", text: "الحبوب مشات ولكن خلات وراها بقع وآثار كتبان." },
    { title: "لون غير موحّد", text: "البشرة فيها مناطق أغمق من أخرى وكتبان باهتة." },
  ];
  return (
    <section id="problem" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20" aria-labelledby="problem-title">
      <SectionHeader id="problem-title" eyebrow="واش هادشي كيوقع ليك؟" title="مشاكل بسيطة… ولكن كتأثر على الثقة" text="ماشي بوحدك. هادو من أكثر المشاكل اللي كيعاني منها الناس فالمغرب، خصوصاً مع الحرارة والشمس." />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((p, i) => (
          <li key={p.title} className="reveal rounded-2xl border border-sand-dark/70 bg-white p-5 shadow-card" style={{ transitionDelay: `${i * 60}ms` }}>
            <span className="font-brand text-3xl text-gold">0{i + 1}</span>
            <h3 className="mt-2 text-lg font-bold text-sage-900">{p.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function SolutionSection() {
  return (
    <section id="solution" className="bg-sage-50/70" aria-labelledby="solution-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="reveal relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[2rem] shadow-soft md:order-2">
          <Image src="/images/product-texture.jpg" alt="قطرة سيروم نياسيناميد خفيفة القوام — صورة توضيحية" fill loading="lazy" sizes="(max-width: 768px) 92vw, 480px" className="object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink-soft">صورة توضيحية</span>
        </div>
        <div className="reveal md:order-1">
          <p className="text-xs font-bold tracking-wide text-gold">الحل</p>
          <h2 id="solution-title" className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-4xl">
            خطوة وحدة بسيطة كتزيدها للروتين ديالك
          </h2>
          <p className="mt-4 text-ink-soft sm:text-lg">
            سيروم نياسيناميد من LUNÉA SKIN تصمّم باش يكون خفيف، سهل الاستعمال، وكيتناسب مع الروتين اليومي. ما كيحتاجش خطوات معقدة: كتنظف وجهك، كتحط شوية من السيروم، وكتكمل الروتين ديالك العادي.
          </p>
          <ul className="mt-6 space-y-3 text-ink">
            {["قوام خفيف كيتمتص بسرعة بلا إحساس بالثقل", "مناسب للاستعمال اليومي، صباحاً أو مساءً", "كيتكامل مع المرطب وواقي الشمس ديالك"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckIcon />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-soft">منتج تجميلي للعناية بمظهر البشرة. ماشي دواء وما كيعالجش أي مرض جلدي.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function BenefitsSection() {
  const benefits = [
    { title: "توازن مظهر الزيوت", text: "كيعاون على تقليل اللمعان وكيعطي مظهر أكثر نقاءً." },
    { title: "مظهر مسام أقل وضوحاً", text: "كيعاون على تحسين مظهر المسام باش تبان البشرة أنعم." },
    { title: "بشرة بمظهر موحّد", text: "كيعاون على توحيد مظهر لون البشرة وتقليل المناطق الباهتة." },
    { title: "تحسين مظهر آثار الحبوب", text: "كيعاون على تحسين مظهر البقع اللي كتبقى من بعد الحبوب." },
    { title: "إشراقة أكثر", text: "كيعاون على إعطاء البشرة مظهر حيوي ومشرق." },
    { title: "خفيف وسهل", text: "قوام سيروم خفيف، سهل التوزيع، وكيتناسب مع أي روتين." },
  ];
  return (
    <section id="benefits" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 md:py-20" aria-labelledby="benefits-title">
      <SectionHeader id="benefits-title" eyebrow="الفوائد" title="علاش غادي تحبو؟" />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <li key={b.title} className="reveal flex gap-4 rounded-2xl border border-sand-dark/70 bg-white p-5" style={{ transitionDelay: `${i * 50}ms` }}>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-50 text-sage-700">
              <CheckIcon />
            </div>
            <div>
              <h3 className="font-bold text-sage-900">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="reveal mt-8 text-center">
        <a href="#order" className="btn-primary">
          {CTA.primary} — {formatPrice(PRODUCT.price)}
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function IngredientsSection() {
  const items = [
    { title: "نياسيناميد", text: "المكوّن الرئيسي فالسيروم، معروف فعالم العناية بالبشرة بمساهمته فتحسين مظهر البشرة الدهنية والمسام." },
    { title: "قوام خفيف", text: "سيروم خفيف كيتمتص بسرعة وما كيخليش طبقة دهنية." },
    { title: "سهولة الاستعمال", text: "قطارة عملية باش تتحكم فالكمية وتوزعها بسهولة." },
    { title: "مناسب للروتين اليومي", text: "كيدخل بسهولة فأي روتين، صباحاً أو مساءً." },
  ];
  return (
    <section id="ingredients" className="scroll-mt-20 bg-sand/60" aria-labelledby="ingredients-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeader id="ingredients-title" eyebrow="المكونات والمميزات" title="بساطة وشفافية" text="كنقولو ليك غير اللي كاين. بلا مبالغة وبلا وعود فارغة." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={it.title} className="reveal rounded-2xl bg-white/80 p-6 shadow-card" style={{ transitionDelay: `${i * 60}ms` }}>
              <h3 className="text-lg font-bold text-sage-900">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{it.text}</p>
            </li>
          ))}
        </ul>
        <p className="reveal mt-6 text-center text-xs text-ink-soft">القائمة الكاملة للمكونات (INCI) مكتوبة على عبوة المنتج.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function HowToUseSection() {
  const steps = ["نظّف وجهك مزيان ونشّفو.", "حط كمية مناسبة من السيروم على الوجه.", "وزّعو بلطف بأطراف الأصابع حتى يتمتص.", "كمّل الروتين ديالك العادي (مرطب، وواقي الشمس فالنهار)."];
  return (
    <section id="how-to-use" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 md:py-20" aria-labelledby="howto-title">
      <SectionHeader id="howto-title" eyebrow="طريقة الاستعمال" title="4 خطوات بسيطة" />
      <ol className="mt-10 grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s} className="reveal relative rounded-2xl border border-sand-dark/70 bg-white p-5 pt-8" style={{ transitionDelay: `${i * 60}ms` }}>
            <span className="absolute -top-4 right-5 grid h-9 w-9 place-items-center rounded-full bg-sage-700 font-bold text-white shadow-card" aria-hidden="true">
              {i + 1}
            </span>
            <p className="text-ink">{s}</p>
          </li>
        ))}
      </ol>
      <p className="reveal mt-6 text-center text-xs text-ink-soft">نصيحة: جرّب المنتج على منطقة صغيرة أولاً. إلا حسيتي بأي تهيج، وقف الاستعمال.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Placeholder({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl border-2 border-dashed border-sand-dark bg-sand/40 p-4 text-center">
      <div>
        <p className="font-bold text-ink-soft">{label}</p>
        <p className="mt-1 text-xs text-ink-soft">{sub}</p>
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  return (
    <section id="results" className="bg-sage-50/70" aria-labelledby="results-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeader id="results-title" eyebrow="قبل / بعد" title="صور حقيقية فقط" text="ما كنعرضوش أي صور مزيفة. الصور الحقيقية للعملاء غادي تتزاد هنا بموافقتهم بعد إطلاق المنتج." />
        <div className="reveal mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Placeholder label="قبل — مكان مخصص للصورة" sub="غادي تتزاد صورة حقيقية بموافقة العميل(ة)" />
          <Placeholder label="بعد — مكان مخصص للصورة" sub="غادي تتزاد صورة حقيقية بموافقة العميل(ة)" />
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20" aria-labelledby="reviews-title">
      <SectionHeader id="reviews-title" eyebrow="آراء العملاء" title="شنو كيقولو الناس؟" />
      <div className="reveal mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-dashed border-sand-dark bg-white/60 p-8 text-center">
        <p className="text-lg font-bold text-sage-900">آراء العملاء سيتم إضافتها بعد إطلاق المنتج.</p>
        <p className="mt-2 text-sm text-ink-soft">كنلتزمو نعرضو غير آراء حقيقية من عملاء حقيقيين.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function ShowcaseSection() {
  return (
    <section id="product" className="bg-sand/60" aria-labelledby="product-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="reveal relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] shadow-soft">
          <Image src="/images/product-hero.jpg" alt="سيروم نياسيناميد LUNÉA SKIN — عرض المنتج، صورة توضيحية" fill loading="lazy" sizes="(max-width: 768px) 92vw, 480px" className="object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink-soft">صورة توضيحية للمنتج</span>
        </div>
        <div className="reveal">
          <p className="text-xs font-bold tracking-wide text-gold">المنتج</p>
          <h2 id="product-title" className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-4xl">
            {PRODUCT.nameAr} — {PRODUCT.name}
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-ink-soft">العلامة</dt>
              <dd className="font-bold text-sage-900">LUNÉA SKIN</dd>
            </div>
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-ink-soft">النوع</dt>
              <dd className="font-bold text-sage-900">سيروم للوجه</dd>
            </div>
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-ink-soft">المكوّن الرئيسي</dt>
              <dd className="font-bold text-sage-900">نياسيناميد</dd>
            </div>
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-ink-soft">الثمن</dt>
              <dd className="font-bold text-sage-900">{formatPrice(PRODUCT.price)}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-ink-soft">مناسب لمن يبحث عن تحسين مظهر البشرة الدهنية، المسام، وآثار الحبوب فإطار روتين يومي بسيط.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function OfferSection() {
  return (
    <section id="offer" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 md:py-20" aria-labelledby="offer-title">
      <div className="reveal relative overflow-hidden rounded-[2rem] border border-gold-light bg-white p-8 text-center shadow-soft sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sage-50" aria-hidden="true" />
        <p className="relative text-xs font-bold tracking-wide text-gold">العرض</p>
        <h2 id="offer-title" className="relative mt-2 text-2xl font-extrabold text-sage-900 sm:text-4xl">
          {PRODUCT.nameAr}
        </h2>
        <p className="relative mt-4 text-5xl font-extrabold text-sage-900">
          {PRODUCT.price} <span className="text-xl font-bold text-ink-soft">{PRODUCT.currencyAr}</span>
        </p>
        <ul className="relative mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink">
          <li className="inline-flex items-center gap-1.5"><CashIcon /> الدفع عند الاستلام</li>
          <li className="inline-flex items-center gap-1.5"><TruckIcon /> التوصيل لجميع المدن المغربية</li>
          <li className="inline-flex items-center gap-1.5"><PhoneIcon /> تأكيد بالهاتف قبل الإرسال</li>
        </ul>
        <a href="#order" className="btn-primary relative mt-8 w-full text-base sm:w-auto">
          {CTA.primary}
        </a>
        <p className="relative mt-3 text-xs text-ink-soft">{CTA.codNote}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function FaqSection() {
  const faqs = [
    { q: "كيفاش كنخلص؟", a: "كتخلص نقداً للموزع ملي يوصلك الطلب (الدفع عند الاستلام). ما كاين حتى دفع مسبق." },
    { q: "شحال كياخد التوصيل؟", a: "مدة التوصيل كتختلف حسب المدينة. غادي نتصلو بيك بالهاتف لتأكيد الطلب ونعطيوك التفاصيل." },
    { q: "واش المنتج مناسب لجميع أنواع البشرة؟", a: "السيروم تصمّم خصيصاً لمن عندهم بشرة بمظهر دهني، مسام واضحة أو آثار حبوب. ننصح دائماً بتجربته على منطقة صغيرة أولاً." },
    { q: "إمتى نستعملو؟", a: "يمكن استعمالو صباحاً و/أو مساءً بعد التنظيف وقبل المرطب. فالنهار، استعمل واقي الشمس." },
    { q: "واش نقدر نطلب أكثر من قنينة؟", a: `نعم، يمكن تطلب من ${PRODUCT.minQty} حتى ${PRODUCT.maxQty} قنينات فنفس الطلب.` },
  ];
  return (
    <section id="faq" className="scroll-mt-20 bg-sage-50/70" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeader id="faq-title" eyebrow="أسئلة شائعة" title="عندك سؤال؟" />
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="reveal group rounded-2xl border border-sand-dark/70 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-sage-900">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage-50 text-sage-700 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
