import { NextResponse } from "next/server";
import { initializeDB, queryDB } from "@/lib/duckDB";
import { convertBigIntsToNumbers } from "@/lib/typeConversions";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  await initializeDB();

  try {
    const classToFamily = await queryDB(`
      SELECT Class, STRING_AGG(DISTINCT Family, ', ') as Families FROM lpi_data GROUP BY Class
    `);

    const familyToBinomials = await queryDB(`
      SELECT Family, STRING_AGG(DISTINCT Binomial, ', ') as Binomials FROM lpi_data GROUP BY Family
    `);

    const binomialToCommonName = await queryDB(`
      SELECT * FROM binomial_to_cname_map
    `);

    const binomialToCNameMap = {};
    binomialToCommonName.map((item, _) => {
      binomialToCNameMap[item.Binomial] = item.Common_name;
    });

    const queryString = searchParams.get("queryString");

    console.log("query: ", new URL(request.url));

    if (queryString) {
      try {
        const familyMatches = await queryDB(
          `
            SELECT DISTINCT 
              Family, 
              Class 
            FROM lpi_data 
            WHERE LOWER(Family) LIKE LOWER(?) || '%'
          `,
          [queryString]
        );
        const familiesList = familyMatches.map((match, _) => [
          match.Family,
          "Class-" + match.Class,
        ]);

        const binomialMatches = await queryDB(
          `
            SELECT DISTINCT 
              Binomial, 
              Family, 
              Class 
            FROM lpi_data 
            WHERE LOWER(Binomial) LIKE LOWER(?) || '%'
          `,
          [queryString]
        );
        const binomialsList = binomialMatches.map((match, _) => [
          match.Binomial,
          "Family-" + match.Family,
          "Class-" + match.Class,
        ]);

        const commonNameMatches = await queryDB(
          `
            SELECT DISTINCT Common_name,
            FROM lpi_data 
            WHERE LOWER(Common_name) LIKE LOWER(?) || '%'
          `,
          [queryString]
        );
        const commonNamesList = commonNameMatches.map((match, _) => [match.Common_name]);

        return NextResponse.json({
          matchedFacetedList: {
            Family: [...familiesList],
            Binomial: [...binomialsList],
            Common_name: [...commonNamesList],
          },
        });
      } catch (err) {
        console.error("Failed creating search filter matches: ", err);
      }
    }

    const facetedList = {
      Class: {
        facet: "Class",
        isNested: true,
        subFacet: "Family",
        allowMultiple: false,
        mappings: classToFamily.map((item, _) => ({
          [item.Class]: item.Families.split(", "),
        })),
      },
      Family: {
        facet: "Family",
        isNested: true,
        subFacet: "Binomial",
        allowMultiple: true,
        mappings: familyToBinomials.map((item, _) => ({
          [item.Family]: item.Binomials.split(", ").map(
            (binomial, _) => binomial + " | " + binomialToCNameMap[binomial]
          ),
        })),
      },
      Binomial: {
        facet: "Binomial",
        isNested: false,
        subFacet: null,
        allowMultiple: true,
        options: binomialToCommonName.map(
          (item, _) => item.Binomial + " | " + item.Common_name
        ),
      },
    };

    return NextResponse.json({
      facetedList,
    });
  } catch (err) {
    console.error("DuckDB filter query error: ", err.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
