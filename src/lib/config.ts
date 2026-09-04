/**
 * LUNÉA SKIN — central site/product configuration.
 *
 * IMPORTANT: The price shown here is for DISPLAY only.
 * The real unit price is always read server-side from the Google Sheet
 * "Settings" tab by Google Apps Script. The frontend price is never trusted.
 */
export const SITE = {
  brand: "LUNÉA SKIN",
  domain: "https://luneaskin.ma",
  locale: "ar_MA",
  // Replace with the real support number/email once available.
  contactPhone: "+212 653 080 465",
  contactEmail: "contact@luneaskin.ma",
} as const;

export const PRODUCT = {
  name: "Niacinamide Serum",
  nameAr: "سيروم نياسيناميد",
  price: 149,
  currency: "MAD",
  currencyAr: "درهم",
  minQty: 1,
  maxQty: 10,
} as const;

export const CTA = {
  primary: "اطلب دابا",
  secondary: "أكد الطلب ديالك",
  codNote: "كتخلص غير ملي يوصلك الطلب.",
} as const;

export const MESSAGES = {
  success: "شكراً ليك! تسجل الطلب ديالك بنجاح.",
  orderIdLabel: "رقم الطلب ديالك:",
  error: "وقع مشكل أثناء إرسال الطلب. حاول مرة أخرى.",
  duplicate: "الطلب ديالك تسجل من قبل بشوية. غادي نتصلو بيك قريباً للتأكيد.",
} as const;

export function formatPrice(amount: number): string {
  return `${amount} ${PRODUCT.currencyAr}`;
}
