import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";
import { QUERY_STRINGS } from "@/constants/api-constants";

const {SPECIES, COMMON_NAME} = QUERY_STRINGS;

export async function GET(request) {
  await initializeDB();

  const speciesSQL = `
        SELECT DISTINCT Species as ${SPECIES}
        FROM lpi_data
    `;

  const namesSQL = `
        SELECT DISTINCT Common_Name as ${COMMON_NAME}
        FROM lpi_data
    `;

  try {
    const speciesList = await queryDB(speciesSQL);
    const namesList = await queryDB(namesSQL);
    console.log("namesList: ", namesList.slice(0, 4))

    return NextResponse.json({speciesList, namesList});
  } catch (err) {
    console.error("DuckDB query error: ", err.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
