import { NextResponse } from "next/server";

export const SUPER_ADMIN_USER = "superadmin";
export const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASS || "tooda2026";

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Super-Admin, X-Tenant-Id",
    "Access-Control-Max-Age": "86400",
  };
}

export function jsonResponse(
  data: unknown,
  init: ResponseInit = {},
  origin?: string | null
) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders(origin),
      ...(init.headers || {}),
    },
  });
}

export function optionsResponse(origin?: string | null) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export function isSuperAdmin(req: Request) {
  const header = req.headers.get("x-super-admin");
  if (header === SUPER_ADMIN_PASS) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${SUPER_ADMIN_PASS}`) return true;
  return false;
}

export function unauthorized(origin?: string | null) {
  return jsonResponse({ error: "未授权" }, { status: 401 }, origin);
}
