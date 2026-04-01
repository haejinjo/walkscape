import { NextRequest, NextResponse } from "next/server";
import { getPlacesData } from "@/lib/server-data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const data = await getPlacesData(query);

  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store"
    }
  });
}
