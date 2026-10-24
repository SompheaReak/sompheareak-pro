/**
 * Direct Neon PostgreSQL Client for Client & Server
 * Uses Neon's native HTTP Query API (CORS enabled: *)
 * Works in static CDN browsers, edge runtimes, and Node.js servers alike!
 */

function getNeonConfig(): { url: string; endpoint: string } {
  const url =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DATABASE_URL) ||
    (typeof process !== "undefined" && process.env?.DATABASE_URL) ||
    "postgresql://neondb_owner:npg_PMLFK18CHxin@ep-autumn-grass-ao3z40da-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  try {
    const parsed = new URL(url);
    return {
      url,
      endpoint: `https://${parsed.hostname}/sql`,
    };
  } catch {
    return {
      url,
      endpoint: "https://ep-autumn-grass-ao3z40da-pooler.c-2.ap-southeast-1.aws.neon.tech/sql",
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function neonQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const { url, endpoint } = getNeonConfig();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": url,
      },
      body: JSON.stringify({ query, params }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Neon HTTP query failed with status:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.rows as T[]) || [];
  } catch (err) {
    console.warn("Neon direct query error:", err);
    return [];
  }
}

export async function neonGetKey<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const rows = await neonQuery<{ value: T }>(
      "SELECT value FROM sompheareak_store WHERE key = $1 LIMIT 1;",
      [key]
    );
    if (rows && rows.length > 0 && rows[0].value !== undefined && rows[0].value !== null) {
      return rows[0].value;
    }
  } catch (err) {
    console.warn(`Failed to read key '${key}' from Neon:`, err);
  }
  return defaultValue;
}

export async function neonSetKey<T>(key: string, value: T): Promise<boolean> {
  try {
    const result = await neonQuery(
      `INSERT INTO sompheareak_store (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW();`,
      [key, JSON.stringify(value)]
    );
    return Array.isArray(result);
  } catch (err) {
    console.error(`Failed to write key '${key}' to Neon:`, err);
    return false;
  }
}
