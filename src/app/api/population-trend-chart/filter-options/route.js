import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";
import { convertBigIntsToNumbers } from "@/lib/typeConversions";

export async function GET (request) {
    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country");
    const commonNameParam = searchParams.get("common_name");

    await initializeDB();

    try {
        if (!countryParam && !commonNameParam) {
            const commonNameList = await queryDB(`SELECT DISTINCT Common_name FROM lpi_data`);
            const countriesList = await queryDB(`SELECT DISTINCT Country FROM lpi_data`);

            console.log("commonNameList: ", convertBigIntsToNumbers(commonNameList).map((r) => r.commonName));

            return NextResponse.json({
                commonNames: commonNameList.map((item, _) => item["Common_name"]),
                countries: countriesList.map((item, i) => item["Country"])
            })
        } else if (countryParam) {
            const countries = countryParam.split(",").map(c => `'${c.trim()}'`).join(", ");

            const sql = `
                SELECT DISTINCT Common_name
                FROM lpi_data
                WHERE Country in (${countries})
            `;

            const result = await queryDB(sql);

            return NextResponse.json({
                commonNames: convertBigIntsToNumbers(result).map((r) => r.commonName)
            })
        } else if (commonNameParam) {
            const commonNames = commonNameParam.split(",").map(s => `'${s.trim()}'`).join(", ");

            const sql = `
                SELECT DISTINCT Country
                FROM lpi_data
                WHERE Common_name in (${commonNames})
            `;

            const result = await queryDB(sql);

            return NextResponse.json({
                countries: convertBigIntsToNumbers(result).map((r) => r.Country)
            })
        }
    } catch(err) {
        console.error("DuckDB filter query error: ", err.stack);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}