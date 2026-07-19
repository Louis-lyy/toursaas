import { getStoreMode } from "@/lib/platform";
import { jsonResponse, optionsResponse } from "@/lib/platform/api-helpers";

export async function OPTIONS(req: Request) {
  return optionsResponse(req.headers.get("origin"));
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  return jsonResponse(
    {
      ok: true,
      storeMode: getStoreMode(),
      api: "/api/platform",
    },
    {},
    origin
  );
}
