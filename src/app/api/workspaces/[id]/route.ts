import { NextResponse } from "next/server";
import { normalizeTokenDocument, type TokenDocument } from "@/features/token-visualizer/document";
import { getWorkspace, saveWorkspace } from "@/features/token-visualizer/workspace-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function serializeWorkspace(workspace: Awaited<ReturnType<typeof saveWorkspace>>) {
  return {
    id: workspace.id,
    editorCss: workspace.editorCss,
    document: workspace.document,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString()
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const workspace = await getWorkspace(id);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  return NextResponse.json({ workspace: serializeWorkspace(workspace) });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let payload: {
    editorCss?: unknown;
    document?: Partial<TokenDocument>;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof payload.editorCss !== "string") {
    return NextResponse.json({ error: "`editorCss` must be a string." }, { status: 400 });
  }

  if (!payload.document || typeof payload.document !== "object") {
    return NextResponse.json({ error: "`document` must be an object." }, { status: 400 });
  }

  const workspace = await saveWorkspace({
    id,
    editorCss: payload.editorCss,
    document: normalizeTokenDocument(payload.document)
  });

  return NextResponse.json({ workspace: serializeWorkspace(workspace) });
}
