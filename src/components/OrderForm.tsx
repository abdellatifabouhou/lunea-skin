"use client";

import { FormEvent, useRef, useState } from "react";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { CTA, MESSAGES, PRODUCT, formatPrice } from "@/lib/config";
import { validateOrder, type FieldErrors } from "@/lib/validation";
import { CashIcon, PhoneIcon, TruckIcon } from "./Hero";

/**
 * ============================================================
 *  FRONTEND API CONFIGURATION
 *  The browser posts to the same-origin proxy below. The Cloudflare Pages Function
 *  (functions/api/order.ts) forwards to the Google Apps Script Web App URL
 *  stored in the server env var GOOGLE_SCRIPT_URL.
 *  → Set GOOGLE_SCRIPT_URL="YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL" in .env
 * ============================================================
 */
const ORDER_ENDPOINT = "/api/order";

const CITIES = ["الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أكادير", "مكناس", "وجدة", "القنيطرة", "تطوان", "سلا", "تمارة", "المحمدية", "الجديدة", "خريبكة", "بني ملال", "الناظور", "سطات", "برشيد", "العيون"];

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; orderId: string; total: number; duplicate: boolean }
  | { kind: "error"; message: string };

const initial = { fullName: "", phone: "", city: "", address: "", quantity: 1, notes: "", website: "" };

export function OrderForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ kind: "idle" });
  const submittingRef = useRef(false); // hard lock against double submission
  const total = values.quantity * PRODUCT.price;

  const set = (k: keyof typeof initial, v: string | number) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k as keyof FieldErrors]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  /** submitOrder(): validate → lock → loading → POST → handle → track */
  async function submitOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;

    const { ok, errors: errs, clean } = validateOrder(values);
    if (!ok || !clean) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    submittingRef.current = true;
    setState({ kind: "submitting" });

    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clean, website: values.website }),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean; orderId?: string; error?: string; duplicate?: boolean; total?: number } | null;

      if (res.ok && data?.success && data.orderId) {
        const finalTotal = typeof data.total === "number" ? data.total : clean.quantity * PRODUCT.price;
        setState({ kind: "success", orderId: data.orderId, total: finalTotal, duplicate: Boolean(data.duplicate) });
        if (!data.duplicate) trackPurchase(data.orderId, clean.quantity, finalTotal);
        setValues(initial); // reset ONLY after success
        setErrors({});
        document.getElementById("order-success")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Show validation messages from server (already customer-safe), otherwise generic message
        const msg = res.status === 400 && data?.error && /[\u0600-\u06FF]/.test(data.error) ? data.error : MESSAGES.error;
        setState({ kind: "error", message: msg });
      }
    } catch {
      setState({ kind: "error", message: MESSAGES.error });
    } finally {
      submittingRef.current = false;
    }
  }

  const submitting = state.kind === "submitting";

  if (state.kind === "success") {
    return (
      <div id="order-success" role="status" aria-live="polite" className="rounded-[2rem] border border-sage-300 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-50 text-sage-700">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h3 className="mt-4 text-2xl font-extrabold text-sage-900">{MESSAGES.success}</h3>
        <p className="mt-3 text-ink-soft">{MESSAGES.orderIdLabel}</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-wider text-sage-900" dir="ltr">
          {state.orderId}
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          المجموع: <strong className="text-ink">{formatPrice(state.total)}</strong> — {CTA.codNote}
        </p>
        {state.duplicate && <p className="mt-2 text-sm text-gold">{MESSAGES.duplicate}</p>}
        <p className="mt-4 text-sm text-ink-soft">غادي نتصلو بيك قريباً لتأكيد الطلب والعنوان. احتفظ برقم الطلب.</p>
        <button type="button" onClick={() => setState({ kind: "idle" })} className="btn-outline mt-6 text-sm">
          طلب جديد
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitOrder} noValidate className="rounded-[2rem] border border-sand-dark/70 bg-white p-5 shadow-soft sm:p-8" aria-describedby="form-cod-note">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-sage-50 p-4">
        <div>
          <p className="text-sm font-bold text-sage-900">{PRODUCT.nameAr}</p>
          <p className="text-xs text-ink-soft">{formatPrice(PRODUCT.price)} للقنينة</p>
        </div>
        <div className="text-left" dir="rtl">
          <p className="text-xs text-ink-soft">المجموع</p>
          <p className="text-xl font-extrabold text-sage-900" aria-live="polite">
            {formatPrice(total)}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Field id="f-fullName" label="الاسم الكامل" error={errors.fullName}>
          <input id="f-fullName" name="fullName" className="input" autoComplete="name" placeholder="مثال: فاطمة الزهراء العلوي" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} onFocus={trackBeginCheckout} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "f-fullName-err" : undefined} required />
        </Field>

        <Field id="f-phone" label="رقم الهاتف" error={errors.phone} hint="غادي نتصلو بيك فهاد الرقم لتأكيد الطلب">
          <input id="f-phone" name="phone" type="tel" inputMode="tel" dir="ltr" className="input text-left" autoComplete="tel" placeholder="06XXXXXXXX" value={values.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "f-phone-err" : "f-phone-hint"} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field id="f-city" label="المدينة" error={errors.city}>
            <input id="f-city" name="city" list="cities" className="input" autoComplete="address-level2" placeholder="مثال: الدار البيضاء" value={values.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} aria-describedby={errors.city ? "f-city-err" : undefined} required />
            <datalist id="cities">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field id="f-quantity" label="الكمية" error={errors.quantity}>
            <div className="flex items-center rounded-2xl border border-sand-dark bg-white" role="group" aria-label="اختيار الكمية">
              <button type="button" onClick={() => set("quantity", Math.max(PRODUCT.minQty, values.quantity - 1))} className="grid h-12 w-12 place-items-center text-xl font-bold text-sage-900 disabled:opacity-30" aria-label="تقليل الكمية" disabled={values.quantity <= PRODUCT.minQty}>
                −
              </button>
              <input id="f-quantity" name="quantity" type="number" inputMode="numeric" min={PRODUCT.minQty} max={PRODUCT.maxQty} className="w-full border-0 bg-transparent text-center text-lg font-bold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value) || PRODUCT.minQty)} aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "f-quantity-err" : undefined} />
              <button type="button" onClick={() => set("quantity", Math.min(PRODUCT.maxQty, values.quantity + 1))} className="grid h-12 w-12 place-items-center text-xl font-bold text-sage-900 disabled:opacity-30" aria-label="زيادة الكمية" disabled={values.quantity >= PRODUCT.maxQty}>
                +
              </button>
            </div>
          </Field>
        </div>

        <Field id="f-address" label="العنوان الكامل" error={errors.address}>
          <textarea id="f-address" name="address" className="input min-h-[88px] resize-y" autoComplete="street-address" placeholder="الحي، الشارع، رقم الدار/العمارة، علامة قريبة…" value={values.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors.address} aria-describedby={errors.address ? "f-address-err" : undefined} required />
        </Field>

        <Field id="f-notes" label="ملاحظات (اختياري)">
          <input id="f-notes" name="notes" className="input" placeholder="مثال: عيّط ليا قبل التوصيل" value={values.notes} onChange={(e) => set("notes", e.target.value)} maxLength={300} />
        </Field>

        {/* Honeypot — hidden from humans, ignored by screen readers */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="f-website">Website</label>
          <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>
      </div>

      {state.kind === "error" && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={submitting} aria-busy={submitting} className="btn-primary mt-6 w-full text-lg">
        {submitting ? (
          <>
            <Spinner /> جاري إرسال الطلب…
          </>
        ) : (
          <>
            {CTA.secondary} — {formatPrice(total)}
          </>
        )}
      </button>

      <p id="form-cod-note" className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1"><CashIcon /> {CTA.codNote}</span>
        <span className="inline-flex items-center gap-1"><TruckIcon /> التوصيل لجميع المدن</span>
        <span className="inline-flex items-center gap-1"><PhoneIcon /> تأكيد بالهاتف</span>
      </p>
    </form>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-sage-900">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
