import { PRODUCT } from "./config";

/**
 * Shared order validation — runs in the browser (fast feedback) AND in the
 * Cloudflare Pages Function. Google Apps Script performs its own, authoritative
 * validation again (see apps-script/Validation.gs). Never rely on the client.
 */

export type OrderInput = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  quantity: number;
  notes?: string;
  product?: string;
  // Honeypot — must stay empty. Bots that fill every field get silently rejected.
  website?: string;
};

export type FieldErrors = Partial<Record<keyof OrderInput, string>>;

export const ERRORS = {
  fullName: "عافاك دخل الاسم الكامل ديالك.",
  phone: "رقم الهاتف خاصو يكون بحال 06XXXXXXXX أو 07XXXXXXXX.",
  city: "عافاك دخل المدينة.",
  address: "عافاك دخل العنوان الكامل باش يوصلك الطلب.",
  quantity: `الكمية خاصها تكون بين ${PRODUCT.minQty} و ${PRODUCT.maxQty}.`,
} as const;

/** Convert Arabic-Indic digits (٠١٢…) to Latin digits and strip separators. */
export function normalizeDigits(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabicIndic = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/[٠-٩۰-۹]/g, (d) => {
    const i = arabicIndic.indexOf(d);
    return String(i >= 0 ? i : easternArabicIndic.indexOf(d));
  });
}

/**
 * Normalize Moroccan mobile numbers to the local 10-digit form (06XXXXXXXX / 07XXXXXXXX).
 * Accepted inputs: 06…, 07…, +2126…, +2127…, 002126…, 2126…, with spaces/dashes/dots.
 * Returns null when the number is not a valid Moroccan mobile.
 */
export function normalizePhone(raw: string): string | null {
  let p = normalizeDigits(String(raw ?? "")).replace(/[\s\-().]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("00212")) p = p.slice(5);
  else if (p.startsWith("212")) p = p.slice(3);
  if (/^[67]\d{8}$/.test(p)) p = "0" + p;
  return /^0[67]\d{8}$/.test(p) ? p : null;
}

export function validateOrder(input: Partial<OrderInput>): {
  ok: boolean;
  errors: FieldErrors;
  clean: OrderInput | null;
} {
  const errors: FieldErrors = {};

  const fullName = String(input.fullName ?? "").trim().replace(/\s+/g, " ");
  if (fullName.length < 3 || fullName.length > 80) errors.fullName = ERRORS.fullName;

  const phone = normalizePhone(String(input.phone ?? ""));
  if (!phone) errors.phone = ERRORS.phone;

  const city = String(input.city ?? "").trim();
  if (city.length < 2 || city.length > 60) errors.city = ERRORS.city;

  const address = String(input.address ?? "").trim();
  if (address.length < 5 || address.length > 300) errors.address = ERRORS.address;

  const quantity = Number(normalizeDigits(String(input.quantity ?? "")));
  if (!Number.isInteger(quantity) || quantity < PRODUCT.minQty || quantity > PRODUCT.maxQty) {
    errors.quantity = ERRORS.quantity;
  }

  const notes = String(input.notes ?? "").trim().slice(0, 300);

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    clean: ok
      ? {
          fullName,
          phone: phone as string,
          city,
          address,
          quantity,
          notes,
          product: PRODUCT.name,
        }
      : null,
  };
}
