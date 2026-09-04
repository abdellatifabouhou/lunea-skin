import { MESSAGES, PRODUCT } from "../../src/lib/config";
import { validateOrder, type OrderInput } from "../../src/lib/validation";

type Env = {
  GOOGLE_SCRIPT_URL?: string;
  ORDER_API_TOKEN?: string;
};

type ApiSuccess = { success: true; orderId: string; message: string; duplicate?: boolean; total?: number };
type ApiError = { success: false; error: string };

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

function json(body: ApiSuccess | ApiError, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function forwardToAppsScript(order: OrderInput, env: Env, source: string, userAgent: string): Promise<ApiSuccess | ApiError> {
  const url = env.GOOGLE_SCRIPT_URL?.trim() ?? "";
  if (!url) return { success: false, error: MESSAGES.error };

  const token = env.ORDER_API_TOKEN?.trim() ?? "";
  const payload = { ...order, source, userAgent, token: token || undefined };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await res.text();
    let data: { success?: boolean; orderId?: string; message?: string; duplicate?: boolean; total?: number; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[order] Apps Script returned non-JSON", res.status, text.slice(0, 200));
      return { success: false, error: MESSAGES.error };
    }

    if (data.success && data.orderId) {
      return {
        success: true,
        orderId: data.orderId,
        message: data.message ?? "Order created successfully",
        duplicate: data.duplicate,
        total: data.total,
      };
    }

    return { success: false, error: typeof data.error === "string" ? data.error : MESSAGES.error };
  } finally {
    clearTimeout(timer);
  }
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ success: false, error: "Too many requests" }, 429);

  let body: Partial<OrderInput>;
  try {
    body = (await request.json()) as Partial<OrderInput>;
    if (!body || typeof body !== "object") throw new Error("bad body");
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ success: true, orderId: "LS-00000", message: "Order created successfully" });
  }

  if (body.product && body.product !== PRODUCT.name) {
    return json({ success: false, error: "Invalid product" }, 400);
  }

  const { ok, errors, clean } = validateOrder(body);
  if (!ok || !clean) {
    const first = Object.values(errors)[0] ?? "Invalid order";
    return json({ success: false, error: first }, 400);
  }

  const source = (request.headers.get("Referer") || "direct").slice(0, 200);
  const userAgent = request.headers.get("User-Agent") || "";

  try {
    const result = await forwardToAppsScript(clean, env, source, userAgent);
    return json(result, result.success ? 200 : 400);
  } catch (err) {
    console.error("[order] failed", {
      ip,
      qty: clean.quantity,
      err: err instanceof Error ? err.message : String(err),
    });
    return json({ success: false, error: MESSAGES.error }, 502);
  }
};
