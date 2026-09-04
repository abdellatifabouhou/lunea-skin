"use client";

import { PRODUCT } from "./config";

/**
 * Privacy-safe analytics helper.
 * Only product/value data is ever sent. NEVER pass name, phone, or address.
 */

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
type Ttq = { track: (event: string, params?: Record<string, unknown>) => void; page?: () => void };

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    ttq?: Ttq;
    dataLayer?: unknown[];
  }
}

const item = {
  item_id: "LS-NIACINAMIDE-SERUM",
  item_name: PRODUCT.name,
  price: PRODUCT.price,
  currency: PRODUCT.currency,
};

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    /* analytics must never break the page */
  }
}

export function trackViewItem() {
  safe(() => window.gtag?.("event", "view_item", { currency: PRODUCT.currency, value: PRODUCT.price, items: [item] }));
  safe(() => window.fbq?.("track", "ViewContent", { content_ids: [item.item_id], content_type: "product", value: PRODUCT.price, currency: PRODUCT.currency }));
  safe(() => window.ttq?.track("ViewContent", { content_id: item.item_id, content_type: "product", value: PRODUCT.price, currency: PRODUCT.currency }));
}

let beganCheckout = false;
export function trackBeginCheckout() {
  if (beganCheckout) return;
  beganCheckout = true;
  safe(() => window.gtag?.("event", "begin_checkout", { currency: PRODUCT.currency, value: PRODUCT.price, items: [item] }));
  safe(() => window.fbq?.("track", "InitiateCheckout", { content_ids: [item.item_id], value: PRODUCT.price, currency: PRODUCT.currency }));
  safe(() => window.ttq?.track("InitiateCheckout", { content_id: item.item_id, value: PRODUCT.price, currency: PRODUCT.currency }));
}

export function trackPurchase(orderId: string, quantity: number, total: number) {
  safe(() =>
    window.gtag?.("event", "purchase", {
      transaction_id: orderId,
      currency: PRODUCT.currency,
      value: total,
      payment_type: "cash_on_delivery",
      items: [{ ...item, quantity }],
    }),
  );
  safe(() => window.fbq?.("track", "Purchase", { content_ids: [item.item_id], content_type: "product", num_items: quantity, value: total, currency: PRODUCT.currency }, { eventID: orderId }));
  safe(() => window.ttq?.track("PlaceAnOrder", { content_id: item.item_id, content_type: "product", quantity, value: total, currency: PRODUCT.currency }));
}
