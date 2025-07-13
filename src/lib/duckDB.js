"use server";
import { Database } from "duckdb";
import path from "path";

const db = new Database(":memory:");
const con = db.connect();

let initialized = false;

export async function initializeDB() {
  if (initialized) return;

  try {
    const filePath = path.resolve(process.cwd(), "data/LPD_2024_public.csv");

    /**
     * binomial_to_cname_map query explained:
     * 1. GROUP BY Binomial, Common_name: Groups the rows by each (Binomial, Common_name) pair.
     * 2. COUNT(*) AS freq: Counts how many times each pair appears — gives us frequency.
     * 3. ROW_NUMBER() OVER (PARTITION BY Binomial ORDER BY COUNT(*) DESC) AS rn:
     *    a. For each Binomial, it assigns a row number to its associated common names.
     *    b. Orders them so the most frequent Common_name gets row number 1.
     */

    const createViewSQL = `
      CREATE VIEW lpi_data AS
      SELECT * FROM read_csv_auto('${filePath}', HEADER=true, nullstr='NULL')
      WHERE NOT (Family IN ('Falconidae') AND Class IN ('Reptilia'))
        AND NOT (Binomial IN ('Neophema_chrysogaster', 'Pezoporus_wallicus') AND (NOT Family IN ('Psittaculidae')))
        AND NOT (Family = 'Potamotrygonidae' AND (NOT Class in ('Elasmobranchii')));

      CREATE VIEW binomial_to_cname_map AS
      SELECT Binomial, Common_name
      FROM (
        SELECT Binomial, Common_name, COUNT(*) AS freq,
                ROW_NUMBER() OVER (PARTITION BY Binomial ORDER BY COUNT(*) DESC) AS rn
        FROM lpi_data
        WHERE Binomial IS NOT NULL AND Common_name IS NOT NULL
        GROUP BY Binomial, Common_name
      )
      WHERE rn = 1;
    `;

    /**
     * CREATE VIEW binomial_to_all_cname_map AS
      SELECT Binomial,
      GROUP_CONCAT(DISTINCT Common_name, ', ') AS Common_names
      FROM lpi_data
      GROUP BY Binomial;
     */

    await new Promise((resolve, reject) => {
      con.run(createViewSQL, (err) => {
        if (err) reject(err);
        else {
          initialized = true;
          resolve();
        }
      });
    });
  } catch (err) {
    console.error("initializeDB: ", err);
  }
}

export async function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      con.all(sql, params, (err, rows) => {
        if (err) {
          console.error(`duckdb con.all query error: `, err);
          reject(err);
        } else resolve(rows);
      });
    } else {
      con.all(sql, (err, rows) => {
        if (err) {
          console.error(`duckdb con.all query error: `, err);
          reject(err);
        } else resolve(rows);
      });
    }
  });
}
