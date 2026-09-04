import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PRODUCT, SITE } from "@/lib/config";

/**
 * Legal pages — initial content clearly marked for final legal review.
 * Nothing here is a legal guarantee; replace bracketed placeholders before launch.
 */
const PAGES: Record<string, { title: string; sections: { h: string; p: string[] }[] }> = {
  privacy: {
    title: "سياسة الخصوصية",
    sections: [
      { h: "المعلومات التي نجمعها", p: ["عند تقديم طلب، نجمع: الاسم الكامل، رقم الهاتف، المدينة، العنوان، الكمية، وأي ملاحظات تضيفها. كما نسجل مصدر الزيارة ونوع المتصفح لأغراض تقنية."] },
      { h: "كيف نستخدمها", p: ["نستخدم هذه المعلومات حصرياً لمعالجة طلبك، الاتصال بك لتأكيده، وتوصيله إليك. لا نبيع بياناتك لأي طرف ثالث."] },
      { h: "أين تُخزَّن", p: ["تُخزَّن الطلبات في نظام داخلي محمي بصلاحيات وصول محدودة لفريق LUNÉA SKIN فقط."] },
      { h: "أدوات التحليل", p: ["قد نستخدم Google Analytics وMeta Pixel وTikTok Pixel لقياس أداء الإعلانات. لا نرسل اسمك أو رقم هاتفك أو عنوانك لهذه الأدوات."] },
      { h: "حقوقك", p: [`يمكنك طلب الاطلاع على بياناتك أو حذفها بمراسلتنا على ${SITE.contactEmail}.`, "[قيد المراجعة القانونية النهائية — يُرجى مراجعة هذا النص مع مستشار قانوني وفق القانون المغربي 09-08 المتعلق بحماية المعطيات الشخصية.]"] },
    ],
  },
  terms: {
    title: "الشروط والأحكام",
    sections: [
      { h: "المنتج", p: [`${PRODUCT.nameAr} (${PRODUCT.name}) هو منتج تجميلي للعناية بمظهر البشرة. ليس دواءً ولا يُقصد به تشخيص أو علاج أي حالة طبية.`] },
      { h: "الثمن والدفع", p: [`الثمن المعلن هو ${PRODUCT.price} ${PRODUCT.currencyAr} للقنينة. الدفع يتم نقداً عند الاستلام.`] },
      { h: "الطلب", p: ["بعد تقديم الطلب، نتصل بك هاتفياً لتأكيده. يحق لنا إلغاء الطلبات التي يتعذر تأكيدها."] },
      { h: "الاستعمال", p: ["يُنصح بتجربة المنتج على منطقة صغيرة من الجلد أولاً. في حال حدوث أي تهيج، أوقف الاستعمال واستشر مختصاً."] },
      { h: "مراجعة", p: ["[قيد المراجعة القانونية النهائية — يُرجى استكمال هذا النص مع مستشار قانوني.]"] },
    ],
  },
  shipping: {
    title: "سياسة التوصيل",
    sections: [
      { h: "النطاق", p: ["نوصّل إلى جميع المدن المغربية عبر شركاء التوصيل."] },
      { h: "المدة", p: ["[حدّد مدة التوصيل المتوقعة حسب المدينة — مثال: 24-72 ساعة للمدن الكبرى.]"] },
      { h: "رسوم التوصيل", p: ["[حدّد ما إذا كان التوصيل مجانياً أو بأي رسوم. لا تُعلن أي وعد قبل تأكيده تجارياً.]"] },
      { h: "التتبع", p: ["سيتصل بك الموزع قبل التسليم. احتفظ برقم طلبك للمتابعة."] },
    ],
  },
  refund: {
    title: "سياسة الإرجاع والاسترداد",
    sections: [
      { h: "عند الاستلام", p: ["يمكنك فحص الطرد عند الاستلام. في حال وصول المنتج تالفاً أو مختلفاً عن الطلب، تواصل معنا فوراً."] },
      { h: "الشروط", p: ["[حدّد شروط الإرجاع: المدة، حالة المنتج، ومن يتحمل رسوم الإرجاع. لا تُقدَّم أي ضمانات غير مؤكدة.]"] },
      { h: "التواصل", p: [`للمطالبات: ${SITE.contactEmail} أو الهاتف ${SITE.contactPhone}.`, "[قيد المراجعة القانونية النهائية.]"] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return page ? { title: `${page.title} | ${SITE.brand}`, robots: { index: false } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-sage-700 underline-offset-2 hover:underline">
          ← الرجوع للصفحة الرئيسية
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-sage-900">{page.title}</h1>
        <p className="mt-2 rounded-xl border border-gold-light bg-white p-3 text-xs text-ink-soft">
          ⚠️ هذه النسخة أولية ومخصصة للمراجعة القانونية النهائية قبل الإطلاق. الفقرات بين [أقواس] تحتاج إلى استكمال.
        </p>
        <div className="mt-8 space-y-8">
          {page.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-bold text-sage-900">{s.h}</h2>
              {s.p.map((t, i) => (
                <p key={i} className="mt-2 text-ink-soft">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
