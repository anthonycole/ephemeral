import { eq } from "drizzle-orm";
import { importCssDocument, normalizeTokenDocument, type TokenDocument } from "@/features/token-visualizer/document";
import { ensureDatabase, db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";

export type WorkspaceRecord = {
  id: string;
  editorCss: string;
  document: TokenDocument;
  createdAt: Date;
  updatedAt: Date;
};

type WorkspaceSaveInput = {
  id: string;
  editorCss: string;
  document: TokenDocument;
};

function parseWorkspaceRecord(row: typeof workspaces.$inferSelect): WorkspaceRecord {
  const normalizedDocument = normalizeTokenDocument(JSON.parse(row.documentJson) as Partial<TokenDocument>);
  const recoveredDocument =
    normalizedDocument.tokens.length === 0 && row.editorCss.trim().length > 0 ? importCssDocument(row.editorCss, normalizedDocument) : normalizedDocument;

  return {
    id: row.id,
    editorCss: row.editorCss,
    document: recoveredDocument,
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

  await db
    .insert(workspaces)
    .values({
      id: input.id,
      editorCss: input.editorCss,
      documentJson,
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: workspaces.id,
      set: {
        editorCss: input.editorCss,
        documentJson,
        updatedAt: now
      }
    });

  const workspace = await getWorkspace(input.id);

  if (!workspace) {
    throw new Error(`Workspace ${input.id} was not saved.`);
  }

  return workspace;
}
