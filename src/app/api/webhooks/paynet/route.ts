import { NextResponse } from "next/server";
import { handlePaynetCallback } from "@/lib/paynet-callback";

async function respond(params: URLSearchParams) {
  const result = await handlePaynetCallback(params);
  if (result.found && !result.verified && params.get("control")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  return respond(new URL(req.url).searchParams);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  return respond(new URLSearchParams(rawBody));
}
