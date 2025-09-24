import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) {
      return NextResponse.json(
        { error: "Only http/https allowed" },
        { status: 400 },
      );
    }
    if (!ALLOWED.includes(u.host)) {
      return NextResponse.json(
        { error: `Host not allowed: ${u.host}` },
        { status: 403 },
      );
    }

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(u, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    clearTimeout(to);

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: `Unsupported content-type: ${ct}` },
        { status: 415 },
      );
    }

    const text = await res.text();
    const size = new TextEncoder().encode(text).length;
    if (size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    const status = /abort/i.test(msg) ? 504 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
