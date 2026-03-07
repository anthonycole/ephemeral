import { defineConfig } from "drizzle-kit";
import { getLocalDatabaseFilePath } from "./src/data/db/config";

export default defineConfig({
  schema: "./src/data/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalDatabaseFilePath()
  }
});
