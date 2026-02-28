import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function getLocalDatabaseFilePath() {
  const databaseFilePath = path.join(process.cwd(), "data", "ephemeral.sqlite");
  mkdirSync(path.dirname(databaseFilePath), { recursive: true });
  return databaseFilePath;
}

export function getLocalDatabaseUrl() {
  return pathToFileURL(getLocalDatabaseFilePath()).toString();
}
