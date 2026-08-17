import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/account") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
