import Link from "next/link";
import { SITE } from "@/lib/config";

const legal = [
  { href: "/legal/privacy", label: "سياسة الخصوصية" },
  { href: "/legal/terms", label: "الشروط والأحكام" },
  { href: "/legal/shipping", label: "سياسة التوصيل" },
  { href: "/legal/refund", label: "سياسة الإرجاع" },
];

export function Footer() {
  return (
    <footer className="border-t border-sand-dark/60 bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-brand text-2xl font-semibold text-sage-900">
            LUNÉA <span className="text-gold">SKIN</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            علامة مغربية للعناية بالبشرة. منتجات بسيطة، عرض واضح، وتوصيل مع الدفع عند الاستلام في جميع المدن.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-sage-900">تواصل معنا</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              الهاتف / واتساب: <span dir="ltr">{SITE.contactPhone}</span>
            </li>
            <li>
              البريد: <a href={`mailto:${SITE.contactEmail}`} className="underline-offset-2 hover:underline">{SITE.contactEmail}</a>
            </li>
            <li>المغرب 🇲🇦</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-sage-900">معلومات قانونية</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-2 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-dark/60 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {SITE.brand}. جميع الحقوق محفوظة. منتج تجميلي — ليس دواءً ولا يعالج أي مرض.
      </div>
    </footer>
  );
}
