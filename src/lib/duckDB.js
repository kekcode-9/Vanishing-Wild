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

    const createViewSQL = `
    CREATE VIEW lpi_data AS
    SELECT * FROM read_csv_auto('${filePath}', HEADER=true);
  `;

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

export async function queryDB(sql) {
  return new Promise((resolve, reject) => {
    con.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
