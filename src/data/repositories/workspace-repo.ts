import { eq } from "drizzle-orm";
import { importCssDocument, normalizeTokenDocument, type TokenDocument } from "@/model/tokens/document";
import { normalizeWorkspaceMeta, type WorkspaceMeta } from "@/model/tokens/workspace-meta";
import { ensureDatabase, db } from "@/data/db";
import { workspaces } from "@/data/db/schema";

export type WorkspaceRecord = {
  id: string;
  editorCss: string;
  document: TokenDocument;
  meta: WorkspaceMeta;
  createdAt: Date;
  updatedAt: Date;
};

type WorkspaceSaveInput = {
  id: string;
  editorCss: string;
  document: TokenDocument;
  meta?: WorkspaceMeta;
};

function parseWorkspaceRecord(row: typeof workspaces.$inferSelect): WorkspaceRecord {
  const normalizedDocument = normalizeTokenDocument(JSON.parse(row.documentJson) as Partial<TokenDocument>);
  const recoveredDocument =
    normalizedDocument.tokens.length === 0 && row.editorCss.trim().length > 0 ? importCssDocument(row.editorCss, normalizedDocument) : normalizedDocument;
  const rawMeta =
    typeof row.metaJson === "string" && row.metaJson.length > 0 ? (JSON.parse(row.metaJson) as Partial<WorkspaceMeta>) : null;

  return {
    id: row.id,
    editorCss: row.editorCss,
    document: recoveredDocument,
    meta: normalizeWorkspaceMeta(rawMeta, { legacy: !row.metaJson }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function getWorkspace(workspaceId: string) {
  await ensureDatabase();

  const [row] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  return row ? parseWorkspaceRecord(row) : null;
}

export async function saveWorkspace(input: WorkspaceSaveInput) {
  await ensureDatabase();

  const now = new Date();
  const document = normalizeTokenDocument(input.document);
  const documentJson = JSON.stringify(document);
  const metaJson = JSON.stringify(normalizeWorkspaceMeta(input.meta, { legacy: false }));

  await db
    .insert(workspaces)
    .values({
      id: input.id,
      editorCss: input.editorCss,
      documentJson,
      metaJson,
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: workspaces.id,
      set: {
        editorCss: input.editorCss,
        documentJson,
        metaJson,
        updatedAt: now
      }
    });

  const workspace = await getWorkspace(input.id);

  if (!workspace) {
    throw new Error(`Workspace ${input.id} was not saved.`);
  }

  return workspace;
}
