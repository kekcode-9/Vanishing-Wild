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
  const agg = searchParams.get("agg") || "sum";
  const country = searchParams.get("Country");

  if (!filterBy || !focus) {
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
    const whereClause = filterBy.map(
      (filterKey, _) =>
        `${filterKey} IN (${searchParams
          .get(filterKey)
          .split(",")
          .map((value, _) => `'${value}'`)
          .join(", ")})`
    );
    if (focus === "Country") {
      whereClause.push(`Country in (${searchParams.get("Country")})`);
    }

    const filterQuery = `WHERE ${whereClause.join(" AND ")}`;

    const yearColumns = Array.from(
      { length: 2020 - 1950 + 1 },
      (_, i) => `${1950 + i}`
    );
    const aliasedYearCols = yearColumns.map((year) => `"${year}" AS y${year}`).join(", ");
    const selectedYearCols = yearColumns.map((year) => `y${year}`);

    // const binomialToCommonName = await queryDB(`
    //   SELECT * FROM binomial_to_all_cname_map
    // `);

    // const binomialToCNameMap = {};
    // binomialToCommonName.map((item, _) => {
    //   binomialToCNameMap[item.Binomial] = item.Common_name;
    // });

    const sql = `
      SELECT 
      ${focus},
      ${selectedYearCols.map((year, _) => `SUM(${year}) AS ${year}`).join(", ")},
      FROM (
        SELECT Country, Class, Family, Binomial, ${aliasedYearCols}
        FROM lpi_data
      )
      ${filterQuery}
      GROUP BY ${focus}
    `;

    const rows = await queryDB(sql);

    const data = rows.map((row, _) => ({
      name: row[focus],
      data: selectedYearCols.map((year, _) => ({
        x: Number(year.replace("y", "")),
        y: Number(row[year])
      }))
    }));

    return Response.json({
      "filter-by": filterBy,
      "focus-by": focus,
      "focused-values": searchParams.get("focus").split(","),
      "other-column": "Country",
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
