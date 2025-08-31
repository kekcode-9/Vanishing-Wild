import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rank = searchParams.get("rank");
    const q = searchParams.get("q");

    if (!rank || !q) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const targetUrl = `https://api.gbif.org/v1/species/suggest?rank=${rank}&q=${q}`;

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
  } catch (err) {
    console.error("failed to get species suggest: ", err);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
