/**
 * Pemecah berkas SQL menjadi statement terpisah.
 *
 * Driver libSQL menjalankan satu statement per `execute()`, jadi berkas
 * migrasi yang berisi banyak statement harus dipecah lebih dulu.
 *
 * Pemecah ini sadar komentar: baris komentar dua tanda hubung, blok
 * komentar, dan literal string dengan kutip tunggal tidak dihitung
 * sebagai pemisah statement.
 */

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let i = 0;

  // Kita sedang berada di dalam literal string atau bukan.
  let inString = false;

  while (i < sql.length) {
    const char = sql[i]!;
    const next = sql[i + 1];

    // ---- komentar baris: dua tanda hubung sampai akhir baris ---------
    if (!inString && char === "-" && next === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      continue;
    }

    // ---- komentar blok: slash bintang sampai bintang slash ------------
    if (!inString && char === "/" && next === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }

    // ---- literal string: '...' dengan kutip ganda di dalam ------------
    if (char === "'") {
      if (inString && next === "'") {
        // escaped quote: '' di dalam string
        current += "''";
        i += 2;
        continue;
      }
      inString = !inString;
      current += char;
      i += 1;
      continue;
    }

    // ---- pemisah statement -------------------------------------------
    if (char === ";" && !inString) {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = "";
      i += 1;
      continue;
    }

    current += char;
    i += 1;
  }

  const tail = current.trim();
  if (tail.length > 0) statements.push(tail);

  return statements;
}
