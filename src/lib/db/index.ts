import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import { getLocalDatabaseUrl } from "@/lib/db/config";
import * as schema from "@/lib/db/schema";

const client = createClient({
  url: getLocalDatabaseUrl()
});

export const db = drizzle(client, { schema });

let migrationPromise: Promise<void> | null = null;

export function ensureDatabase() {
  if (!migrationPromise) {
    migrationPromise = migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle")
    }).catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}
