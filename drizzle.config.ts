import { defineConfig } from "drizzle-kit";
import { getLocalDatabaseFilePath } from "./src/lib/db/config";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalDatabaseFilePath()
  }
});
