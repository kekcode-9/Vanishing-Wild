// app/api/gbif-tiles/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, pathname } = new URL(request.url);
  // request.url = http://localhost:3000/api/gbif-tiles/{z}/{x}/{y}.png?taxonKey=…
  // Strip leading "/api/gbif-tiles/"
  const tilePath = pathname.split("gbif-tiles/")[1];
  const targetUrl = `https://api.gbif.org/v2/map/occurrence/density/${tilePath}?taxonKey=${searchParams.get(
    "taxonKey"
  )}&style=purpleHeat.point`;

  const res = await fetch(targetUrl, { method: "GET" });
  const contentType =
    res.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
