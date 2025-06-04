import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";

export async function GET(request) {
  await initializeDB();

  const { searchParams } = new URL(request.url);
  const filterBy = searchParams
    .get("filter_by")
    ?.split(",")
    .map((s) => s.trim());
  const focus = searchParams.get("focus");
  const agg = searchParams.get("agg") || "avg";

  if (!filterBy || filterBy.length < 2 || !focus) {
    return NextResponse.json(
      {
        error: "insufficient query parameters",
      },
      {
        status: 400,
      }
    );
  }

  const other = filterBy.find((item) => item !== focus);
  const focusValues = searchParams
    .get(focus.toLowerCase())
    ?.split(",")
    .map((s) => `'${s.trim().replace("'", "").toLowerCase()}'`);
  const otherValues = searchParams
    .get(other.toLowerCase())
    ?.split(",")
    .map((s) => `'${s.trim().replace("'", "").toLowerCase()}'`);

  if (!focusValues || !otherValues || focusValues === "all") {
    return NextResponse.json(
      {
        error: "insufficient query parameters",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const whereClause = [];
    whereClause.push(
      `LOWER(REPLACE(${focus}, '''', ''))IN (${focusValues.join(", ")})`
    );
    console.log("otherValues: ", otherValues);
    otherValues[0] !== `'all'` &&
      whereClause.push(
        `LOWER(REPLACE(${other}, '''', '')) IN (${otherValues.join(", ")})`
      );
    const filterQuery = `WHERE ${whereClause.join(" AND ")}`;

    const yearColumns = Array.from(
      { length: 2020 - 1950 + 1 },
      (_, i) => `${1950 + i}`
    );

    const sql = `
    SELECT 
    ${focus} as focus_value,
    ${other} as other_value,
    Latitude, Longitude,
    ${yearColumns.map((year, _) => `"${year}"`).join(", ")},
    FROM lpi_data
    ${filterQuery}`;

    const rows = await queryDB(sql);

    const grouped = {};
    for (const row of rows) {
      const key = row.focus_value;
      if (!grouped[key]) grouped[key] = {};

      for (const year of yearColumns) {
        const val = row[year] !== "NULL" ? row[year] : null;
        if (!grouped[key][year]) grouped[key][year] = [];
        grouped[key][year].push(val);
      }
    }

    const data = Object.entries(grouped).map(([name, yearMap]) => {
      const points = yearColumns.map((year) => {
        const values = yearMap[year].filter((v) => v !== null).map(v => Number(v));
        console.log("values: ", values);
        let y = null;
        if (values.length) {
          if (agg === "sum") y = values.reduce((a, b) => a + b, 0);
          else if (agg === "min") y = Math.min(...values);
          else if (agg === "max") y = Math.max(...values);
          else if (agg === "stddev") {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            y = Math.sqrt(
              values.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
                values.length
            );
          } else y = values.reduce((a, b) => a + b, 0) / values.length;
        }
        return { x: parseInt(year), y };
      });
      return { name, data: points };
    });

    console.log("data: ", data);

    return Response.json({
      "filter-by": filterBy,
      "focus-by": focus,
      "focused-values": focusValues ?? Object.keys(grouped),
      "other-column": other,
      agg: agg,
      data,
    });
  } catch (err) {
    console.log("error: ", err);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
