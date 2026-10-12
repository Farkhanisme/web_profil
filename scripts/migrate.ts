/**
 * Menjalankan migrasi SQL yang belum pernah diterapkan.
 *
 * Cara pakai:
 *   npm run migrate
 *
 * Idempoten: migrasi yang versinya sudah tercatat di tabel `_migrations`
 * akan dilewati, jadi skrip ini aman dijalankan berulang kali.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createDb, resolveDatabaseUrl } from "../src/lib/db/client";
import { splitSqlStatements } from "../src/lib/db/sql";

const MIGRATIONS_DIR = join(process.cwd(), "db", "migrations");

async function main(): Promise<void> {
  const url = resolveDatabaseUrl();
  const db = createDb(url);

  console.log(`Database : ${url.startsWith("file:") ? "SQLite lokal" : "Turso"}`);
  console.log(`URL      : ${url.replace(/\?.*$/, "")}\n`);

  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
       version    TEXT PRIMARY KEY,
       applied_at INTEGER NOT NULL
     )`,
  );

  const ada = await db.execute("SELECT version FROM _migrations");
  const applied = new Set(ada.rows.map((r) => r.version as string));

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("Tidak ada berkas migrasi di db/migrations.");
    return;
  }

  let baru = 0;

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");

    if (applied.has(version)) {
      console.log(`  lewati  ${file}`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const statements = splitSqlStatements(sql).map((s) => [s] as [string]);

    // Mode "write" membungkus seluruh daftar sebagai satu transaksi:
    // bila ada statement gagal, tidak ada tabel yang setengah jadi.
    if (statements.length > 0) await db.batch(statements, "write");

    await db.execute({
      sql: "INSERT INTO _migrations (version, applied_at) VALUES (?, ?)",
      args: [version, Math.floor(Date.now() / 1000)],
    });

    console.log(`  baru    ${file} (${statements.length} statement)`);
    baru += 1;
  }

  const tabel = await db.execute(
    "SELECT count(*) AS c FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );

  console.log(
    `\nSelesai. ${baru} migrasi baru dijalankan, total ${tabel.rows[0].c} tabel.`,
  );
}

main().catch((error) => {
  console.error("Migrasi gagal:", error);
  process.exit(1);
});
