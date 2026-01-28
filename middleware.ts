// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const token = request.cookies.get("accessToken")?.value;
  // const pathname = request.nextUrl.pathname;
  // Redirect unauthenticated users trying to access protected routes
  // if (pathname.startsWith("/dashboard") && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  // Redirect logged-in users away from the login page
  // if (pathname.startsWith("/login") && token) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  return NextResponse.next();
}
