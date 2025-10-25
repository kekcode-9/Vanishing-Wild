import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { usageKey } = await params;

    if (!usageKey) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const targetUrl = `https://api.gbif.org/v1/species/${usageKey}/iucnRedListCategory`;
    console.log("targetUrl: ", targetUrl);

    const res = await fetch(targetUrl, { method: "GET" });
    console.log("res.body: ", res.body);
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
