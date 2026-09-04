export const onRequestGet = async () =>
  Response.json({ ok: true, service: "LUNÉA SKIN API" }, { headers: { "Cache-Control": "no-store" } });
