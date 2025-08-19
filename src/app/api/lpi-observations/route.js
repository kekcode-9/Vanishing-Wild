import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";
import { convertBigIntsToNumbers } from "@/lib/typeConversions";
import { groupBy } from "lodash";
import { QUERY_STRINGS } from "@/constants/api-constants";

const { COMMON_NAME, SPECIES } = QUERY_STRINGS;

export async function GET(request) {
  await initializeDB();

  const { searchParams } = new URL(request.url);
  const filterBy = searchParams
    .get("filter_by")
    ?.split(",")
    .map((s) => s.trim());
  const focus = searchParams.get("focus");
  const agg = searchParams.get("agg") || "sum";

  const yearColumns = Array.from(
    { length: 2020 - 1990 + 1 },
    (_, i) => `${1990 + i}`
  );

  // if (!filterBy || !focus || !searchParams.get(focus)) {
  //   return NextResponse.json(
  //     {
  //       error: "insufficient query parameters",
  //     },
  //     {
  //       status: 400,
  //     }
  //   );
  // }

  const columns = [
    ...(focus ? [focus] : []),
    ...(focus !== "Binomial" ? ["Binomial"] : []),
    "Common_name",
    "Species",
    "Country",
    "Latitude",
    "Longitude",
  ];

  const whereClause =
    focus && searchParams.get(focus)
      ? [
          `${focus} IN (${searchParams
            .get(focus)
            .split(",")
            .map((value, _) => `'${value}'`)
            .join(", ")})`,
        ]
      : [];

  const filterQuery =
    whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

  /**
   * UNNEST to create an array of rows for each year instead of having all years present in one row and having the population for
   * that year represented with its own key. Will still contain rows where the population is NULL
   */
  const sql = `SELECT
  ${columns.join(", ")},
  unnest_years AS year,
  unnest_values AS population
  FROM (
    SELECT
      ${columns.join(", ")},
      UNNEST(ARRAY[${yearColumns
        .map((year, _) => `"${year}"`)
        .join(", ")}]) AS unnest_values,
      UNNEST(ARRAY[${yearColumns
        .map((y) => `'${y}'`)
        .join(", ")}]) AS unnest_years
    FROM lpi_data
    ${filterQuery}
  ) t -- subquery in the FROM clause needs an alias
  WHERE unnest_values IS NOT NULL`;
  console.log("sql: ", sql);

  try {
    const results = await queryDB(sql);
    const safeResults = convertBigIntsToNumbers(results);
    const grouped = groupBy(safeResults, (row) => row.year.toString());

    const geoJSONByYear = {};

    Object.entries(grouped).map(([year, rowsArr], _) => {
      const geoJSON = {
        type: "FeatureCollection",
        // create features for only those rows where the population is non-Null
        features: rowsArr
          .filter((row, _) => row.population !== "NULL")
          .map((row, _) => ({
            type: "Feature",
            properties: {
              // id: row.id,
              ...(focus && focus !== "Common_name" && { [focus]: row[focus] }),
              Species: row.Species,
              Common_name: row["Common_name"],
              population: row.population,
              country: row.Country,
            },
            geometry: {
              type: "Point",
              coordinates: [row.Longitude, row.Latitude],
            },
          })),
      };

      geoJSONByYear[year] = geoJSON;
    });

    return NextResponse.json(geoJSONByYear);
  } catch (err) {
    console.error("DuckDB query error: ", err.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
